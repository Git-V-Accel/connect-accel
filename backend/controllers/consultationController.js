const ConsultationRequest = require('../models/ConsultationRequest');
const User = require('../models/User');
const ActivityLogger = require('../services/activityLogger');
const socketService = require('../services/socketService');
const { STATUS_CODES, MESSAGES, USER_ROLES } = require('../constants');
const { createAuditLog } = require('../utils/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/auditMessages');

const ensureAdmin = (role) =>
  role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN;

const getConsultations = async (req, res) => {
  try {
    if (!ensureAdmin(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ADMIN_REQUIRED || 'Only admins can access consultations',
      });
    }

    const { status, assigned } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (assigned === 'me') {
      filter.assignedTo = req.user._id;
    } else if (assigned === 'unassigned') {
      filter.assignedTo = null;
    }

    const consultations = await ConsultationRequest.find(filter)
      .populate('client', 'name email company phone')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('project', 'title status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    console.error('Failed to fetch consultations:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR || 'Failed to fetch consultations',
    });
  }
};

const assignConsultation = async (req, res) => {
  try {
    if (!ensureAdmin(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ADMIN_REQUIRED || 'Only admins can assign consultations',
      });
    }

    const { id } = req.params;
    const { assigneeId } = req.body || {};

    const consultation = await ConsultationRequest.findById(id);
    if (!consultation) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    if (consultation.assignedTo && consultation.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Consultation request has already been assigned',
      });
    }

    let targetAssigneeId;

    if (req.user.role === USER_ROLES.ADMIN) {
      targetAssigneeId = req.user._id;
    } else if (req.user.role === USER_ROLES.SUPERADMIN) {
      targetAssigneeId = assigneeId || req.user._id;
    }

    if (!targetAssigneeId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Assignee is required',
      });
    }

    const assigneeUser = await User.findById(targetAssigneeId).select('name email role status');
    if (!assigneeUser || !ensureAdmin(assigneeUser.role)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Selected assignee is not a valid admin user',
      });
    }

    consultation.assignedTo = assigneeUser._id;
    consultation.assignedBy = req.user._id;
    consultation.assignedAt = new Date();
    consultation.status = 'assigned';
    await consultation.save();

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: AUDIT_ACTIONS.CONSULTATION_ASSIGNED,
        targetUser: assigneeUser,
        metadata: {
          consultationId: consultation._id,
          clientName: consultation.clientName || 'Client',
          assigneeName: assigneeUser.name
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log consultation assignment audit:', auditError);
    }

    await ActivityLogger.logActivity({
      user: req.user._id,
      activityType: 'consultation_requested',
      title: 'Consultation Assigned',
      description: `Consultation request for ${consultation.clientName} assigned to ${assigneeUser.name}`,
      metadata: {
        consultationId: consultation._id,
        assignedTo: assigneeUser._id,
        assignedToName: assigneeUser.name,
      },
      visibleToAdmin: true,
      visibleToClient: false,
      tags: ['consultation', 'assignment'],
      severity: 'medium',
    });

    const updatedConsultation = await ConsultationRequest.findById(id)
      .populate('client', 'name email company phone')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('project', 'title status createdAt');

    // Notify all admin users about the assignment in real-time
    socketService.emitToAdminUsers('consultation-updated', {
      consultation: updatedConsultation
    });

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'consultation',
        action: 'updated',
        consultationId: updatedConsultation?._id?.toString?.() || id,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: updatedConsultation,
      message: 'Consultation request assigned successfully',
    });
  } catch (error) {
    console.error('Failed to assign consultation:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR || 'Failed to assign consultation',
    });
  }
};

module.exports = {
  getConsultations,
  assignConsultation,
};

