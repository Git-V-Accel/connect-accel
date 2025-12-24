const Project = require('../models/Project');
const ActivityLogger = require('../services/activityLogger');
const Notification = require('../models/Notification');
const ConsultationRequest = require('../models/ConsultationRequest');
const User = require('../models/User');
const socketService = require('../services/socketService');
const emailService = require('../services/emailService');
const { MESSAGES, STATUS_CODES, NOTIFICATION_TYPES, USER_ROLES } = require('../constants');
const { processAttachments } = require('../utils/attachmentStorage');

const formatProjectResponse = (project, user) => {
  if (!project || !user) return project;

  const originalTitle = project.clientTitle || project.title;
  const adminTitle = project.title || originalTitle;
  const titlesDiffer =
    originalTitle &&
    adminTitle &&
    originalTitle.toString() !== adminTitle.toString();

  project.originalTitle = originalTitle;
  project.adminTitle = adminTitle;
  project.adminDisplayTitle = titlesDiffer
    ? `${originalTitle} - ${adminTitle}`
    : adminTitle;

  if (user.role === USER_ROLES.CLIENT) {
    project.title = originalTitle;
  }

  return project;
};

// Helper function to create notifications for admin users
const createAdminNotifications = async (notificationData) => {
  try {
    // Find all admin and superadmin users
    const adminUsers = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    }).select('_id');

    // Create notifications for each admin user
    const notifications = adminUsers.map(adminUser => ({
      ...notificationData,
      user: adminUser._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Failed to create admin notifications:', error);
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { cursor, limit = 20, assignedFreelancerId, clientId } = req.query;
    const { cursorPaginate } = require('../utils/pagination');
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'client') {
      // Clients can only see their own projects
      // Draft projects are only visible to the owner client
      query.client = req.user.id;
      // Exclude draft projects for other clients (only show drafts to owner)
      // This is already handled by query.client = req.user.id, but we ensure drafts are only visible to owner
    } else if (req.user.role === 'freelancer') {
      // Freelancers can see:
      // 1. Projects assigned to them
      // 2. Projects open for bidding (not assigned to anyone)
      query.$or = [
        { assignedFreelancerId: req.user.id },
        { 
          $and: [
            { assignedFreelancerId: { $exists: false } },
            { $or: [
              { isOpenForBidding: true },
              { status: 'in_bidding' },
              { status: 'active' }
            ]}
          ]
        }
      ];
    } else if (req.user.role === 'agent') {
      // Agents can only see projects assigned to them
      query.assignedAgentId = req.user.id;
    }
    // Exclude draft projects for everyone except the owner client
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else {
      query.status = { $ne: 'draft' };
    }
    
    // Optional filtering for admin views
    if (
      assignedFreelancerId &&
      (req.user.role === 'admin' || req.user.role === 'superadmin')
    ) {
      query.assignedFreelancerId = assignedFreelancerId;
    }

    if (
      clientId &&
      (req.user.role === 'admin' || req.user.role === 'superadmin')
    ) {
      query.client = clientId;
    }

    const result = await cursorPaginate(Project, query, {
      cursor: cursor || null,
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'client', select: 'name email phone userID' },
        { path: 'assignedFreelancerId', select: 'name email userID' },
        { path: 'assignedAgentId', select: 'name email userID' },
        {
          path: 'additionalDescriptions.createdBy',
          select: 'name email userID role'
        }
      ],
      lean: true,
    });

    const formattedData = result.data.map((project) =>
      formatProjectResponse(project, req.user)
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email phone userID')
      .populate('assignedFreelancerId', 'name email userID')
      .populate('assignedAgentId', 'name email userID')
      .populate('additionalDescriptions.createdBy', 'name email userID role')
      .lean();

    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role === 'client' && project.client._id.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'freelancer') {
      // Allow access if:
      // 1. Project is assigned to this freelancer, OR
      // 2. Freelancer has an accepted bid for this project
      const isAssigned = project.assignedFreelancer?._id?.toString() === req.user.id || 
                        project.assignedFreelancerId?.toString() === req.user.id;
      
      if (!isAssigned) {
        // Check if freelancer has an accepted bid for this project
        const Bidding = require('../models/Bidding');
        const acceptedBid = await Bidding.findOne({
          projectId: project._id,
          freelancerId: req.user.id,
          isAccepted: true
        });
        
        if (!acceptedBid) {
          return res.status(STATUS_CODES.FORBIDDEN).json({
            success: false,
            message: 'Access denied'
          });
        }
      }
    }

    const formattedProject = formatProjectResponse(project, req.user);

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: formattedProject
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Client only)
const createProject = async (req, res) => {
  try {
    let title, description, budget, timeline, category, skills, priority, status;
    let isNegotiableBudget = false;
    
    if (req.body.title) {
      title = typeof req.body.title === 'string' ? req.body.title : req.body.title;
    }
    if (req.body.description) {
      description = typeof req.body.description === 'string' ? req.body.description : req.body.description;
    }
    if (
      req.body.budget !== undefined &&
      req.body.budget !== null &&
      req.body.budget !== ''
    ) {
      budget = typeof req.body.budget === 'string'
        ? parseFloat(req.body.budget)
        : req.body.budget;
    }
    if (req.body.timeline) {
      timeline = typeof req.body.timeline === 'string' ? req.body.timeline : req.body.timeline;
    }
    if (req.body.category) {
      category = typeof req.body.category === 'string' ? req.body.category : req.body.category;
    }
    if (req.body.skills) {
      skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
    }
    if (req.body.priority) {
      priority = typeof req.body.priority === 'string' ? req.body.priority : req.body.priority;
    }
    if (req.body.status) {
      status = typeof req.body.status === 'string' ? req.body.status : req.body.status;
    }

    if (req.body.isNegotiableBudget !== undefined) {
      if (typeof req.body.isNegotiableBudget === 'string') {
        isNegotiableBudget = req.body.isNegotiableBudget === 'true';
      } else {
        isNegotiableBudget = !!req.body.isNegotiableBudget;
      }
    }
    
    // Handle attachments from uploads or base64 payloads
    const processedAttachments = processAttachments(req.files, req.body.attachments);
    if (req.body.attachments) {
      delete req.body.attachments;
    }

    // Validation
    const missingFields = [];
    const isBudgetProvided = typeof budget === 'number' && !isNaN(budget) && budget > 0;

    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!timeline) missingFields.push('timeline');
    if (!category) missingFields.push('category');
    if (!isNegotiableBudget && !isBudgetProvided) missingFields.push('budget');

    if (missingFields.length > 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `Please provide all required fields: ${missingFields.join(', ')}`
      });
    }

    if (isNegotiableBudget && (budget === undefined || budget === null || isNaN(budget))) {
      budget = 0;
    }

    const { clientId: clientIdFromBody, consultationId } = req.body || {};

    const parseClientIdentifier = (value) => {
      if (!value) return null;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'string') return parsed;
          if (parsed && parsed._id) return parsed._id;
        } catch (_) {
          return value;
        }
        return value;
      }
      if (value && value._id) return value._id;
      return value;
    };

    let targetClientId = req.user.id;
    let actingAsAdmin = false;
    let selectedClientUser = null;
    let consultationForContext = null;

    if (req.user.role === USER_ROLES.CLIENT) {
      targetClientId = req.user.id;
    } else if (
      req.user.role === USER_ROLES.ADMIN ||
      req.user.role === USER_ROLES.SUPERADMIN
    ) {
      actingAsAdmin = true;
      let resolvedClientId =
        parseClientIdentifier(clientIdFromBody) ||
        parseClientIdentifier(req.body?.client) ||
        parseClientIdentifier(req.body?.clientID);

      if (!resolvedClientId && consultationId) {
        consultationForContext = await ConsultationRequest.findById(
          consultationId
        ).select('client assignedTo');

        if (consultationForContext) {
          const assignedToAdmin =
            consultationForContext.assignedTo &&
            consultationForContext.assignedTo.toString() ===
              req.user._id.toString();

          if (
            assignedToAdmin ||
            req.user.role === USER_ROLES.SUPERADMIN
          ) {
            resolvedClientId = consultationForContext.client?.toString();
          }
        }
      }

      if (!resolvedClientId) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message:
            'Client ID is required to create a project on behalf of a client',
        });
      }

      selectedClientUser = await User.findById(resolvedClientId);
      if (!selectedClientUser || selectedClientUser.role !== USER_ROLES.CLIENT) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Invalid client selected for project creation',
        });
      }
      targetClientId = selectedClientUser._id;
    } else {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Only clients or admins can create projects'
      });
    }

    const project = await Project.create({
      title,
      clientTitle: title,
      description,
      budget,
      timeline,
      category,
      skills: skills || [],
      priority: priority || 'medium',
      status: status, // Will use model default if undefined
      attachments: processedAttachments,
      client: targetClientId,
      isNegotiableBudget
    });

    // Log activity
    try {
      await ActivityLogger.logProjectCreated(project._id, req.user.id, req);
    } catch (activityError) {
      console.error('Failed to log project creation activity:', activityError);
    }

    // Create notification for admin users
    await createAdminNotifications({
      type: 'project_created',
      title: 'New Project Created',
      message: `A new project "${title}" has been created by ${req.user.name}`,
      projectId: project._id.toString(),
      metadata: {
        clientId: targetClientId,
        clientName: actingAsAdmin
          ? selectedClientUser?.name
          : req.user.name,
        projectTitle: title
      }
    });

    // Emit socket event for new project to admin users
    socketService.emitToAdminUsers('global-notification', {
      eventType: 'project_created',
      title: 'New Project Created',
      message: `A new project "${title}" has been created by ${req.user.name}`,
      projectId: project._id.toString(),
      metadata: {
        clientId: targetClientId,
        clientName: actingAsAdmin
          ? selectedClientUser?.name
          : req.user.name,
        projectTitle: title
      }
    });

    // If this project came from a consultation request, mark it completed
    if (consultationId) {
      try {
        const consultation =
          consultationForContext ||
          (await ConsultationRequest.findById(consultationId));

        if (consultation) {
          const isClientOwner =
            consultation.client &&
            consultation.client.toString() === targetClientId.toString();
          const isAssignedAdmin =
            consultation.assignedTo &&
            consultation.assignedTo.toString() === req.user._id.toString();

          const canUpdateConsultation =
            isClientOwner ||
            req.user.role === USER_ROLES.SUPERADMIN ||
            (req.user.role === USER_ROLES.ADMIN && isAssignedAdmin);

          if (canUpdateConsultation) {
            consultation.status = 'completed';
            consultation.project = project._id;
            consultation.convertedAt = new Date();
            await consultation.save();

            const populatedConsultation = await ConsultationRequest.findById(
              consultationId
            )
              .populate('client', 'name email company phone')
              .populate('assignedTo', 'name email role')
              .populate('assignedBy', 'name email role')
              .populate('project', 'title status');

            socketService.emitToAdminUsers('consultation-updated', {
              consultation: populatedConsultation
            });
          }
        }
      } catch (consultationUpdateError) {
        console.error(
          'Failed to update consultation after project creation:',
          consultationUpdateError
        );
      }
    }

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Handle file uploads if any
    const newAttachments = processAttachments(req.files, req.body.attachments);
    if (req.body.attachments) {
      delete req.body.attachments;
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // If new files were uploaded, merge with existing attachments
    if (newAttachments && newAttachments.length > 0) {
      const existingAttachments = project.attachments || [];
      updateData.attachments = [...existingAttachments, ...newAttachments];
    }

    // Enforce status flow constraints for clients
    if (req.user.role === 'client' && req.body.status && req.body.status !== project.status) {
      const { CLIENT_ALLOWED_TRANSITIONS } = require('../constants');
      const allowedNextStatuses = CLIENT_ALLOWED_TRANSITIONS[project.status] || [];
      
      if (!allowedNextStatuses.includes(req.body.status)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: `Invalid status transition from ${project.status} to ${req.body.status} for clients.`
        });
      }
    }

    // Handle statusRemarks for hold or cancelled
    if (['hold', 'cancelled'].includes(req.body.status) && !req.body.statusRemarks) {
       return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `Please provide a reason for setting the project to ${req.body.status}.`
      });
    }

    const oldStatus = project.status;
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'name email userID')
     .populate('assignedFreelancer', 'name email userID')
     .populate('assignedAgentId', 'name email userID');

    // Log activity for status changes
    if (oldStatus !== updatedProject.status) {
      const ActivityLogger = require('../services/activityLogger');
      
      // Log specific approval/rejection activities
      if (oldStatus === 'pending_review' && updatedProject.status === 'in_progress') {
        await ActivityLogger.logActivity({
          user: req.user.id,
          project: project._id,
          activityType: 'project_status_changed',
          title: 'Project Approved',
          description: `Project "${updatedProject.title}" was approved by ${req.user.name} and status changed to In Progress`,
          metadata: {
            projectTitle: updatedProject.title,
            oldStatus: oldStatus,
            newStatus: updatedProject.status,
            action: 'approved',
            approvedBy: req.user.name,
            approvedByRole: req.user.role
          },
          tags: ['project', 'approval', 'status', 'change'],
          severity: 'high',
          visibleToClient: true,
          visibleToAdmin: true
        }, req);
      } else if (oldStatus === 'pending_review' && updatedProject.status === 'rejected') {
        await ActivityLogger.logActivity({
          user: req.user.id,
          project: project._id,
          activityType: 'project_status_changed',
          title: 'Project Rejected',
          description: `Project "${updatedProject.title}" was rejected by ${req.user.name}${req.body.rejectionReason ? `. Reason: ${req.body.rejectionReason}` : ''}`,
          metadata: {
            projectTitle: updatedProject.title,
            oldStatus: oldStatus,
            newStatus: updatedProject.status,
            action: 'rejected',
            rejectedBy: req.user.name,
            rejectedByRole: req.user.role,
            rejectionReason: req.body.rejectionReason || null
          },
          tags: ['project', 'rejection', 'status', 'change'],
          severity: 'high',
          visibleToClient: true,
          visibleToAdmin: true
        }, req);
      } else if (updatedProject.status === 'hold' || updatedProject.status === 'cancelled') {
        await ActivityLogger.logActivity({
          user: req.user.id,
          project: project._id,
          activityType: 'project_status_changed',
          title: `Project ${updatedProject.status.charAt(0).toUpperCase() + updatedProject.status.slice(1)}`,
          description: `Project "${updatedProject.title}" was set to ${updatedProject.status} by ${req.user.name}. Reason: ${req.body.statusRemarks}`,
          metadata: {
            projectTitle: updatedProject.title,
            oldStatus: oldStatus,
            newStatus: updatedProject.status,
            action: updatedProject.status,
            reason: req.body.statusRemarks,
            changedBy: req.user.name,
            changedByRole: req.user.role
          },
          tags: ['project', updatedProject.status, 'status', 'change'],
          severity: 'high',
          visibleToClient: true,
          visibleToAdmin: true
        }, req);
      } else {
        // Log general status change with optional remarks
        const description = `Project "${updatedProject.title}" status changed from "${oldStatus}" to "${updatedProject.status}" by ${req.user.name}${req.body.statusRemarks ? `. Reason: ${req.body.statusRemarks}` : ''}`;
        
        await ActivityLogger.logActivity({
          user: req.user.id,
          project: project._id,
          activityType: 'project_status_changed',
          title: 'Project Status Changed',
          description: description,
          metadata: {
            projectTitle: updatedProject.title,
            oldStatus: oldStatus,
            newStatus: updatedProject.status,
            reason: req.body.statusRemarks || null,
            changedBy: req.user.name,
            changedByRole: req.user.role
          },
          tags: ['project', 'status', 'change'],
          severity: 'medium',
          visibleToClient: true,
          visibleToAdmin: true
        }, req);
      }
    }

    // Emit socket event for status change
    if (oldStatus !== updatedProject.status) {
      // Create notification for admin users when status changes
      await createAdminNotifications({
        type: 'project_updated',
        title: 'Project Status Updated',
        message: `Project "${updatedProject.title}" status changed from ${oldStatus} to ${updatedProject.status} by ${req.user.name}`,
        projectId: project._id.toString(),
        metadata: {
          oldStatus,
          newStatus: updatedProject.status,
          updatedBy: req.user.id,
          updatedByName: req.user.name
        }
      });

      socketService.emitStatusUpdated(
        project._id,
        oldStatus,
        updatedProject.status,
        req.user.id
      );

      // Emit notification to admin users for status change
      socketService.emitToAdminUsers('global-notification', {
        eventType: 'project_updated',
        title: 'Project Status Updated',
        message: `Project "${updatedProject.title}" status changed from ${oldStatus} to ${updatedProject.status} by ${req.user.name}`,
        projectId: project._id.toString(),
        metadata: {
          oldStatus,
          newStatus: updatedProject.status,
          updatedBy: req.user.id,
          updatedByName: req.user.name
        }
      });
    }

    // Emit general project update
    socketService.emitProjectUpdate(project._id, 'project-updated', {
      project: updatedProject,
      updatedBy: req.user.id
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create notification for admin users when project is deleted
    await createAdminNotifications({
      type: 'project_updated',
      title: 'Project Deleted',
      message: `Project "${project.title}" has been deleted by ${req.user.name}`,
      projectId: project._id,
      metadata: {
        deletedBy: req.user.id,
        deletedByName: req.user.name,
        projectTitle: project.title
      }
    });

    await Project.findByIdAndDelete(req.params.id);

    // Emit socket event for project deletion
    socketService.emitProjectUpdate(project._id, 'project-deleted', {
      projectId: project._id,
      deletedBy: req.user.id
    });

    // Emit notification to admin users for project deletion
    socketService.emitToAdminUsers('global-notification', {
      eventType: 'project_deleted',
      title: 'Project Deleted',
      message: `Project "${project.title}" has been deleted by ${req.user.name}`,
      projectId: project._id.toString(),
      metadata: {
        deletedBy: req.user.id,
        deletedByName: req.user.name,
        projectTitle: project.title
      }
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Add additional description to project
// @route   POST /api/projects/:id/descriptions
// @access  Private
const addAdditionalDescription = async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || !description.trim()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Description is required'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add the new description with metadata
    project.additionalDescriptions = project.additionalDescriptions || [];
    const newDescription = {
      description: description.trim(),
      createdAt: new Date(),
      createdBy: req.user.id
    };
    project.additionalDescriptions.push(newDescription);

    await project.save();

    // Log activity
    try {
      await ActivityLogger.logDescriptionAdded(req.params.id, req.user.id, description.trim(), req);
    } catch (activityError) {
      console.error('Failed to log description addition activity:', activityError);
    }

    // Create notification for admin users
    await createAdminNotifications({
      type: 'project_updated',
      title: 'Project Description Added',
      message: `A new description has been added to project "${project.title}" by ${req.user.name}`,
      projectId: project._id,
      metadata: {
        addedBy: req.user.id,
        addedByName: req.user.name,
        projectTitle: project.title
      }
    });

    // Emit socket event for new description
    socketService.emitDescriptionAdded(
      project._id,
      newDescription,
      req.user.id
    );

    // Emit notification to admin users for description addition
    socketService.emitToAdminUsers('global-notification', {
      eventType: 'description_added',
      title: 'Project Description Added',
      message: `A new description has been added to project "${project.title}" by ${req.user.name}`,
      projectId: project._id.toString(),
      metadata: {
        addedBy: req.user.id,
        addedByName: req.user.name,
        projectTitle: project.title
      }
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Additional description added successfully',
      data: project
    });
  } catch (error) {
    console.error('Add additional description error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Delete additional description from project
// @route   DELETE /api/projects/:id/descriptions/:index
// @access  Private
const deleteAdditionalDescription = async (req, res) => {
  try {
    const { index } = req.params;
    const descriptionIndex = parseInt(index);

    if (isNaN(descriptionIndex) || descriptionIndex < 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Invalid description index'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if index is valid
    if (!project.additionalDescriptions || descriptionIndex >= project.additionalDescriptions.length) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Description index out of range'
      });
    }

    // Remove the description at the specified index
    project.additionalDescriptions.splice(descriptionIndex, 1);
    await project.save();

    // Log activity
    try {
      await ActivityLogger.logDescriptionDeleted(req.params.id, req.user.id, descriptionIndex, req);
    } catch (activityError) {
      console.error('Failed to log description deletion activity:', activityError);
    }

    // Emit socket event for description deletion
    socketService.emitProjectUpdate(project._id, 'description-deleted', {
      descriptionIndex,
      deletedBy: req.user.id
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Additional description deleted successfully',
      data: project
    });
  } catch (error) {
    console.error('Delete additional description error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// Placeholder functions for milestone operations
const releaseFunds = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.PROJECT_NOT_FOUND });
    }
    // Only admin or project owner can release funds
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isOwner = String(project.client) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: 'Not authorized to release funds' });
    }
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Milestone not found' });
    }
    milestone.isPaid = true;
    milestone.paymentStatus = 'paid';
    milestone.paymentProcessedAt = new Date();
    await project.save();
    return res.status(STATUS_CODES.OK).json({ success: true, message: 'Funds released', data: project });
  } catch (error) {
    console.error('Release funds error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

const addMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, amount, notes } = req.body || {};

    // Basic validation
    if (!title || !description || !dueDate || amount === undefined) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields: title, description, dueDate, amount'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROJECT_NOT_FOUND
      });
    }

    // Authorization: Admins or project client can add milestones
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isProjectOwner = String(project.client) === String(req.user.id);
    if (!isAdmin && !isProjectOwner) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to add milestones to this project'
      });
    }

    // Create milestone
    const milestone = {
      title: String(title).trim(),
      description: String(description).trim(),
      dueDate: new Date(dueDate),
      amount: Number(amount),
      status: 'active',
      isPaid: false,
      paymentStatus: 'not_requested',
      notes: notes ? String(notes) : undefined
    };

    project.milestones.push(milestone);
    await project.save();

    // Log activity (best-effort)
    try {
      await ActivityLogger.logMilestoneCreated(project._id, req.user.id, milestone.title, milestone.amount, req);
    } catch (activityError) {
      console.error('Failed to log milestone activity:', activityError);
    }

    // Emit realtime update (best-effort)
    try {
      socketService.emitProjectUpdate(project._id, 'milestone-added', {
        milestone: project.milestones[project.milestones.length - 1]
      });
    } catch (emitError) {
      console.error('Failed to emit milestone-added event:', emitError);
    }

    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: 'Milestone added successfully',
      data: project
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

const requestPayment = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.PROJECT_NOT_FOUND });
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: 'Only admins can request payment' });
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Milestone not found' });
    milestone.paymentStatus = 'payment_requested';
    milestone.paymentRequestedAt = new Date();
    await project.save();
    return res.status(STATUS_CODES.OK).json({ success: true, message: 'Payment requested', data: project });
  } catch (error) {
    console.error('Request payment error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

const markPaymentProcessing = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.PROJECT_NOT_FOUND });
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: 'Only admins can mark processing' });
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Milestone not found' });
    milestone.paymentStatus = 'processing';
    await project.save();
    return res.status(STATUS_CODES.OK).json({ success: true, message: 'Payment marked processing', data: project });
  } catch (error) {
    console.error('Mark processing error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

const markPaymentFailed = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.PROJECT_NOT_FOUND });
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: 'Only admins can mark failed' });
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Milestone not found' });
    milestone.paymentStatus = 'failed';
    await project.save();
    return res.status(STATUS_CODES.OK).json({ success: true, message: 'Payment marked failed', data: project });
  } catch (error) {
    console.error('Mark failed error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

const cancelPayment = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.PROJECT_NOT_FOUND });
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: 'Only admins can cancel payment' });
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Milestone not found' });
    milestone.paymentStatus = 'cancelled';
    await project.save();
    return res.status(STATUS_CODES.OK).json({ success: true, message: 'Payment cancelled', data: project });
  } catch (error) {
    console.error('Cancel payment error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

const updateMilestoneStatus = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body || {};
    if (!status) return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: 'Missing status' });
    const project = await Project.findById(id);
    if (!project) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.PROJECT_NOT_FOUND });
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isOwner = String(project.client) === String(req.user.id);
    if (!isAdmin && !isOwner) return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: 'Not authorized' });
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Milestone not found' });
    milestone.status = status;
    if (status === 'completed') milestone.completedAt = new Date();
    await project.save();
    return res.status(STATUS_CODES.OK).json({ success: true, message: 'Milestone status updated', data: project });
  } catch (error) {
    console.error('Update milestone status error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const { title, description, dueDate, amount, notes } = req.body || {};
    const project = await Project.findById(id);
    if (!project) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.PROJECT_NOT_FOUND });
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isOwner = String(project.client) === String(req.user.id);
    if (!isAdmin && !isOwner) return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: 'Not authorized' });
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Milestone not found' });
    if (title !== undefined) milestone.title = String(title).trim();
    if (description !== undefined) milestone.description = String(description).trim();
    if (dueDate !== undefined) milestone.dueDate = new Date(dueDate);
    if (amount !== undefined) milestone.amount = Number(amount);
    if (notes !== undefined) milestone.notes = String(notes);
    await project.save();
    return res.status(STATUS_CODES.OK).json({ success: true, message: 'Milestone updated', data: project });
  } catch (error) {
    console.error('Update milestone error:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

// @desc    Mark project as open for bidding
// @route   PUT /api/projects/:id/bidding
// @access  Private (Admin only)
const markProjectForBidding = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        data: null,
        message: MESSAGES.PROJECT_NOT_FOUND
      });
    }

    // Only admins can mark projects for bidding
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        data: null,
        message: 'Only admins can mark projects for bidding'
      });
    }

    // Mark project as open for bidding
    project.isOpenForBidding = true;
    if (project.status === 'pending' || project.status === 'active') {
      project.status = 'in_bidding';
    }
    
    await project.save();

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user.id,
      action: 'mark_project_for_bidding',
      details: `Marked project "${project.title}" as open for bidding`,
      projectId: project._id
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: project,
      message: 'Project marked as open for bidding'
    });
  } catch (error) {
    console.error('Error marking project for bidding:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      message: MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
};

// @desc    Request consultation (notify all admins)
// @route   POST /api/projects/consultation
// @access  Private (Client only)
const requestConsultation = async (req, res) => {
  try {
    // Fetch fresh user data to ensure we have the latest phone number
    const client = await User.findById(req.user._id).select('-password');
    
    if (!client) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }
    
    // Get client details
    const clientName = client.name || 'Unknown Client';
    const clientEmail = client.email || '';
    // Use phone from request body if provided, otherwise fall back to user profile
    // Check multiple possible sources for phone number
    const clientPhone = req.body.clientPhone || req.body.phone || client.phone || '';
    const clientCompany = client.company || '';
    
    // Get project details if provided
    const { projectTitle, projectDescription, projectBudget, projectTimeline, projectCategory } = req.body;
    
    // Build project details string
    let projectDetails = '';
    if (projectTitle || projectDescription || projectBudget || projectTimeline || projectCategory) {
      projectDetails = `
        ${projectTitle ? `<strong>Title:</strong> ${projectTitle}<br>` : ''}
        ${projectCategory ? `<strong>Category:</strong> ${projectCategory}<br>` : ''}
        ${projectBudget ? `<strong>Budget:</strong> ${projectBudget}<br>` : ''}
        ${projectTimeline ? `<strong>Timeline:</strong> ${projectTimeline}<br>` : ''}
        ${projectDescription ? `<strong>Description:</strong> ${projectDescription.substring(0, 200)}${projectDescription.length > 200 ? '...' : ''}` : ''}
      `;
    }
    
    // Find all admin and superadmin users
    const adminUsers = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    }).select('_id name email');
    
    if (adminUsers.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'No admin users found'
      });
    }
    
    // Create notifications for each admin
    const notifications = adminUsers.map(adminUser => ({
      user: adminUser._id,
      type: NOTIFICATION_TYPES.CONSULTATION_REQUESTED,
      title: `Consultation Request from ${clientName}`,
      message: `${clientName} has requested a consultation. Email: ${clientEmail}${clientPhone ? `, Phone: ${clientPhone}` : ''}${clientCompany ? `, Company: ${clientCompany}` : ''}`,
      metadata: {
        clientId: client._id,
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        projectTitle,
        projectDescription,
        projectBudget,
        projectTimeline,
        projectCategory
      }
    }));
    
    if (notifications.length > 0) {
      const createdNotifications = await Notification.insertMany(notifications);
      
      // Send email to each admin
      for (const adminUser of adminUsers) {
        try {
          await emailService.sendConsultationRequestEmail({
            to: adminUser.email,
            adminName: adminUser.name,
            clientName,
            clientEmail,
            clientPhone,
            clientCompany,
            projectDetails: projectDetails || undefined
          });
        } catch (emailError) {
          console.error(`Failed to send consultation email to ${adminUser.email}:`, emailError);
          // Continue with other admins even if one email fails
        }
      }
      
      // Emit socket notifications to connected admin users
      createdNotifications.forEach((notification, index) => {
        const adminUser = adminUsers[index];
        if (adminUser) {
          socketService.emitNotification(adminUser._id.toString(), {
            _id: notification._id,
            user: notification.user,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt
          });
        }
      });
      
      // Also emit global notification to admin users
      socketService.emitToAdminUsers('global-notification', {
        type: NOTIFICATION_TYPES.CONSULTATION_REQUESTED,
        title: `Consultation Request from ${clientName}`,
        message: `A new consultation request has been received`,
        clientName,
        clientEmail,
        clientPhone,
        clientCompany
      });
    }

    // Persist consultation request for admin tracking
    try {
      const consultationRecord = await ConsultationRequest.create({
        client: client._id,
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        projectTitle,
        projectDescription,
        projectBudget,
        projectTimeline,
        projectCategory,
      });

      const populatedConsultation = await ConsultationRequest.findById(
        consultationRecord._id
      )
        .populate('client', 'name email company phone')
        .populate('assignedTo', 'name email role')
        .populate('assignedBy', 'name email role');

      socketService.emitToAdminUsers('consultation-created', {
        consultation: populatedConsultation
      });
    } catch (consultationError) {
      console.error('Failed to create consultation request record:', consultationError);
    }
    
    // Log activity
    await ActivityLogger.logActivity({
      user: client._id,
      activityType: 'consultation_requested',
      title: 'Consultation Requested',
      description: `${clientName} requested a consultation with the admin team`,
      metadata: {
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        projectTitle,
        projectBudget,
        projectTimeline,
        projectCategory,
      },
      visibleToClient: true,
      visibleToAdmin: true,
      tags: ['consultation', 'client'],
      severity: 'medium',
    });
    
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Consultation request sent to all admins successfully',
      adminsNotified: adminUsers.length
    });
  } catch (error) {
    console.error('Error requesting consultation:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR || 'Failed to send consultation request'
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  releaseFunds,
  addMilestone,
  requestPayment,
  markPaymentProcessing,
  markPaymentFailed,
  cancelPayment,
  updateMilestoneStatus,
  updateMilestone,
  addAdditionalDescription,
  deleteAdditionalDescription,
  markProjectForBidding,
  requestConsultation
};