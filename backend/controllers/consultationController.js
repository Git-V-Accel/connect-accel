const ConsultationRequest = require('../models/ConsultationRequest');
const User = require('../models/User');
const ActivityLogger = require('../services/activityLogger');
const socketService = require('../services/socketService');
const { STATUS_CODES, MESSAGES, USER_ROLES } = require('../constants');
const { createAuditLog } = require('../utils/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/auditMessages');

const ensureAdmin = (role) =>
  role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN;

const ensureAgentOrAdmin = (role) =>
  role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN || role === USER_ROLES.AGENT;

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
      .populate('completedBy', 'name email role')
      .populate('cancelledBy', 'name email role')
      .populate('project', 'title status createdAt')
      .sort({ createdAt: -1 });

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
    const { assigneeId, assignmentType = 'assign_to_agent' } = req.body || {};

    const consultation = await ConsultationRequest.findById(id);
    if (!consultation) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    // Allow re-assignment even if already assigned
    let targetAssigneeId;
    let isReassignment = false;

    if (req.user.role === USER_ROLES.ADMIN) {
      targetAssigneeId = req.user._id;
    } else if (req.user.role === USER_ROLES.SUPERADMIN) {
      targetAssigneeId = assigneeId || req.user._id;
    }

    // Check if this is a re-assignment
    if (consultation.assignedTo && consultation.assignedTo.toString() !== targetAssigneeId.toString()) {
      isReassignment = true;
    }

    if (!targetAssigneeId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Assignee is required',
      });
    }

    const assigneeUser = await User.findById(targetAssigneeId).select('name email role status');
    if (!assigneeUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Selected assignee not found',
      });
    }

    // Validate assignee role based on assignment type
    if (assignmentType === 'assign_to_agent' && assigneeUser.role !== USER_ROLES.AGENT) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Selected user is not an agent',
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
        action: isReassignment ? AUDIT_ACTIONS.CONSULTATION_REASSIGNED : AUDIT_ACTIONS.CONSULTATION_ASSIGNED,
        targetUser: assigneeUser,
        metadata: {
          consultationId: consultation._id,
          clientName: consultation.clientName || 'Client',
          assigneeName: assigneeUser.name,
          assignmentType,
          isReassignment
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log consultation assignment audit:', auditError);
    }

    await ActivityLogger.logActivity({
      user: req.user._id,
      activityType: 'consultation_requested',
      title: isReassignment ? 'Consultation Re-assigned' : 'Consultation Assigned',
      description: `Consultation request for ${consultation.clientName} ${isReassignment ? 're-assigned to' : 'assigned to'} ${assigneeUser.name}`,
      metadata: {
        consultationId: consultation._id,
        assignedTo: assigneeUser._id,
        assignedToName: assigneeUser.name,
        assignmentType,
        isReassignment
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
      message: isReassignment ? 'Consultation re-assigned successfully' : 'Consultation request assigned successfully',
    });
  } catch (error) {
    console.error('Failed to assign consultation:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR || 'Failed to assign consultation',
    });
  }
};

const completeConsultation = async (req, res) => {
  try {
    if (!ensureAdmin(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ADMIN_REQUIRED || 'Only admins can complete consultations',
      });
    }

    const { id } = req.params;
    const { meetingNotes, outcome, actionItems } = req.body || {};

    const consultation = await ConsultationRequest.findById(id);
    if (!consultation) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    if (consultation.status !== 'assigned') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Only assigned consultations can be completed',
      });
    }

    if (!outcome) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Outcome is required to complete consultation',
      });
    }

    // Update consultation with completion details
    consultation.status = 'completed';
    consultation.meetingNotes = meetingNotes;
    consultation.outcome = outcome;
    consultation.actionItems = actionItems;
    consultation.completedAt = new Date();
    consultation.completedBy = req.user._id;
    await consultation.save();

    // Fetch the updated consultation with populated fields
    updatedConsultation = await ConsultationRequest.findById(id)
      .populate('client', 'name email company phone')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('completedBy', 'name email role')
      .populate('project', 'title status createdAt');

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: AUDIT_ACTIONS.CONSULTATION_COMPLETED,
        targetUser: consultation.assignedTo,
        metadata: {
          consultationId: consultation._id,
          clientName: consultation.clientName || 'Client',
          outcome,
          completedBy: req.user.name
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log consultation completion audit:', auditError);
    }

    // Log Activity
    try {
      await ActivityLogger.logActivity({
        user: req.user._id,
        activityType: 'consultation_completed',
        title: 'Consultation Completed',
        description: `Consultation request for ${consultation.clientName} was completed`,
        metadata: {
          consultationId: consultation._id,
          assignedTo: consultation.assignedTo,
          outcome,
          meetingNotes,
          actionItems
        },
        visibleToAdmin: true,
        visibleToClient: false,
        tags: ['consultation', 'completion'],
        severity: 'medium',
      }, req);
    } catch (activityError) {
      console.error('Failed to log consultation completion activity:', activityError);
    }

    const updatedConsultation = await ConsultationRequest.findById(id)
      .populate('client', 'name email company phone')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('completedBy', 'name email role')
      .populate('project', 'title status createdAt');

    // Notify all admin users about the completion in real-time
    socketService.emitToAdminUsers('consultation-updated', {
      consultation: updatedConsultation
    });

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'consultation',
        action: 'completed',
        consultationId: updatedConsultation?._id?.toString?.() || id,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: updatedConsultation,
      message: 'Consultation completed successfully',
    });
  } catch (error) {
    console.error('Failed to complete consultation:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR || 'Failed to complete consultation',
    });
  }
};

const cancelConsultation = async (req, res) => {
  try {
    if (!ensureAdmin(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ADMIN_REQUIRED || 'Only admins can cancel consultations',
      });
    }

    const { id } = req.params;
    const { cancellationReason } = req.body || {};

    const consultation = await ConsultationRequest.findById(id);
    if (!consultation) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    if (consultation.status === 'cancelled') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Consultation is already cancelled',
      });
    }

    if (consultation.status === 'completed') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Cannot cancel a completed consultation',
      });
    }

    // Store previous status for potential undo
    const previousStatus = consultation.status;

    // Update consultation with cancellation details
    consultation.status = 'cancelled';
    consultation.cancelledAt = new Date();
    consultation.cancelledBy = req.user._id;
    consultation.cancellationReason = cancellationReason;
    await consultation.save();

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: AUDIT_ACTIONS.CONSULTATION_CANCELLED,
        targetUser: consultation.assignedTo,
        metadata: {
          consultationId: consultation._id,
          clientName: consultation.clientName || 'Client',
          previousStatus,
          cancellationReason,
          cancelledBy: req.user.name
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log consultation cancellation audit:', auditError);
    }

    // Log Activity
    try {
      await ActivityLogger.logActivity({
        user: req.user._id,
        activityType: 'consultation_cancelled',
        title: 'Consultation Cancelled',
        description: `Consultation request for ${consultation.clientName} was cancelled`,
        metadata: {
          consultationId: consultation._id,
          assignedTo: consultation.assignedTo,
          previousStatus,
          cancellationReason
        },
        visibleToAdmin: true,
        visibleToClient: false,
        tags: ['consultation', 'cancellation'],
        severity: 'medium',
      }, req);
    } catch (activityError) {
      console.error('Failed to log consultation cancellation activity:', activityError);
    }

    const updatedConsultation = await ConsultationRequest.findById(id)
      .populate('client', 'name email company phone')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('cancelledBy', 'name email role')
      .populate('project', 'title status createdAt');

    // Notify all admin users about the cancellation in real-time
    socketService.emitToAdminUsers('consultation-updated', {
      consultation: updatedConsultation
    });

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'consultation',
        action: 'cancelled',
        consultationId: updatedConsultation?._id?.toString?.() || id,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: updatedConsultation,
      message: 'Consultation cancelled successfully',
    });
  } catch (error) {
    console.error('Failed to cancel consultation:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR || 'Failed to cancel consultation',
    });
  }
};

const undoCancelConsultation = async (req, res) => {
  try {
    if (!ensureAdmin(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ADMIN_REQUIRED || 'Only admins can undo consultation cancellation',
      });
    }

    const { id } = req.params;

    const consultation = await ConsultationRequest.findById(id);
    if (!consultation) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    if (consultation.status !== 'cancelled') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Only cancelled consultations can be restored',
      });
    }

    // Restore to previous status (assigned if it was assigned, otherwise pending)
    const restoredStatus = consultation.assignedTo ? 'assigned' : 'pending';

    // Update consultation to restore status
    consultation.status = restoredStatus;
    consultation.cancelledAt = null;
    consultation.cancelledBy = null;
    consultation.cancellationReason = null;
    await consultation.save();

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: AUDIT_ACTIONS.CONSULTATION_RESTORED,
        targetUser: consultation.assignedTo,
        metadata: {
          consultationId: consultation._id,
          clientName: consultation.clientName || 'Client',
          restoredStatus,
          restoredBy: req.user.name
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log consultation restoration audit:', auditError);
    }

    // Log Activity
    try {
      await ActivityLogger.logActivity({
        user: req.user._id,
        activityType: 'consultation_restored',
        title: 'Consultation Restored',
        description: `Consultation request for ${consultation.clientName} was restored to ${restoredStatus}`,
        metadata: {
          consultationId: consultation._id,
          assignedTo: consultation.assignedTo,
          restoredStatus
        },
        visibleToAdmin: true,
        visibleToClient: false,
        tags: ['consultation', 'restoration'],
        severity: 'medium',
      }, req);
    } catch (activityError) {
      console.error('Failed to log consultation restoration activity:', activityError);
    }

    const updatedConsultation = await ConsultationRequest.findById(id)
      .populate('client', 'name email company phone')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('project', 'title status createdAt');

    // Notify all admin users about the restoration in real-time
    socketService.emitToAdminUsers('consultation-updated', {
      consultation: updatedConsultation
    });

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'consultation',
        action: 'restored',
        consultationId: updatedConsultation?._id?.toString?.() || id,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: updatedConsultation,
      message: 'Consultation restored successfully',
    });
  } catch (error) {
    console.error('Failed to restore consultation:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR || 'Failed to restore consultation',
    });
  }
};

module.exports = {
  getConsultations,
  assignConsultation,
  completeConsultation,
  cancelConsultation,
  undoCancelConsultation,
};

