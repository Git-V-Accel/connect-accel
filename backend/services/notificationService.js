const Notification = require('../models/Notification');
const User = require('../models/User');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const socketService = require('./socketService');
const { getNotificationConfig, formatNotificationMessage } = require('../constants/notificationConfig');
const { USER_ROLES } = require('../constants');
const { createAuditLog } = require('../utils/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/auditMessages');

class NotificationService {
  static looksLikeObjectId(value) {
    return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
  }
  static toUiType(rawType) {
    const t = String(rawType || '').toLowerCase();
    if (t.includes('milestone')) return 'milestone';
    if (t.includes('payment')) return 'payment';
    if (t.includes('message')) return 'message';
    if (t.includes('bid') || t.includes('bidding')) return 'bid';
    if (t.includes('dispute')) return 'dispute';
    if (t.includes('user')) return 'project';
    return 'project';
  }

  static toLink(data, notification) {
    const projectId = data?.projectId || notification?.projectId;
    if (projectId) return `/projects/${projectId.toString()}`;
    return undefined;
  }
  /**
   * Create and send notifications based on event type
   * @param {string} eventType - The event type (e.g., 'PROJECT_CREATED', 'BID_ACCEPTED')
   * @param {Object} data - Event data containing relevant information
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Array of created notifications
   */
  static async createNotification(eventType, data, options = {}) {
    try {
      const { excludeUserIds = [], specificUserIds = [], projectId = null, performedBy = null } = options;

      // Get all notification configs for this event type
      const notifications = [];

      // Find all relevant notification configs for this event
      const relevantConfigs = this.getRelevantConfigs(eventType);

      for (const config of relevantConfigs) {
        // Get target users based on roles and specific conditions
        const targetUsers = await this.getTargetUsers(config, data, specificUserIds, excludeUserIds);

        for (const user of targetUsers) {
          // Skip if user is in exclude list
          if (excludeUserIds.includes(user._id.toString())) continue;

          // Format message with user-specific data
          const notificationData = await this.prepareNotificationData(config, data, user);
          const { title, message } = formatNotificationMessage(config.template, notificationData);

          // Create notification
          const uiType = this.toUiType(config.type);
          const notification = new Notification({
            user: user._id,
            // Store UI category in `type` so existing frontend notification panels keep working
            type: uiType,
            title,
            message,
            projectId: projectId || data.projectId || null,
            metadata: {
              priority: config.priority,
              eventType,
              notificationType: config.type,
              ...notificationData,
              socketEvent: config.socketEvent
            }
          });

          await notification.save();
          notifications.push(notification);

          // Log audit entry for notification sent
          try {
            await createAuditLog({
              performedBy: performedBy,
              action: AUDIT_ACTIONS.NOTIFICATION_SENT,
              targetUser: user,
              metadata: {
                title,
                eventType,
                projectId: projectId || data.projectId
              }
            });
          } catch (auditError) {
            console.error('Audit log for notification failed:', auditError);
          }

          // Send real-time notification
          this.sendRealTimeNotification(user._id.toString(), notification, config.socketEvent);
        }
      }

      console.log(`Created ${notifications.length} notifications for event: ${eventType}`);
      return notifications;

    } catch (error) {
      console.error('Error creating notifications:', error);
      throw error;
    }
  }

  /**
   * Get relevant notification configs for an event type
   */
  static getRelevantConfigs(eventType) {
    const { NOTIFICATION_CONFIG } = require('../constants/notificationConfig');
    const configs = [];

    for (const role in NOTIFICATION_CONFIG) {
      const roleConfig = NOTIFICATION_CONFIG[role];
      if (!roleConfig) continue;

      // Backwards-compatible: support configs indexed by eventType key
      if (roleConfig[eventType]) {
        configs.push(roleConfig[eventType]);
      }

      // Primary: also match by `config.event` so keys can be arbitrary (e.g. PROJECT_CREATED_ADMIN)
      for (const key of Object.keys(roleConfig)) {
        const cfg = roleConfig[key];
        if (cfg && cfg.event === eventType) {
          configs.push(cfg);
        }
      }
    }

    // Deduplicate by type+socketEvent to avoid duplicates when both branches match
    const seen = new Set();
    return configs.filter((cfg) => {
      const k = `${cfg.type}::${cfg.socketEvent || ''}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  /**
   * Get target users based on notification config and event data
   */
  static async getTargetUsers(config, data, specificUserIds = [], excludeUserIds = []) {
    // If specific users are provided, use them
    if (specificUserIds.length > 0) {
      return await User.find({
        _id: { $in: specificUserIds },
        role: { $in: config.roles },
        status: 'active'
      });
    }

    let query = {
      role: { $in: config.roles },
      status: 'active'
    };

    // Apply role-specific filtering based on event data
    query = await this.applyRoleSpecificFiltering(query, config, data);

    return await User.find(query);
  }

  /**
   * Apply role-specific filtering to user query
   */
  static async applyRoleSpecificFiltering(query, config, data) {
    // CLIENT: Only notify the specific client who owns the project
    if (config.roles.includes('client') && data.projectId) {
      const project = await Project.findById(data.projectId);
      if (project) {
        query._id = project.client;
      }
    }

    // AGENT: Only notify agents assigned to specific projects
    if (config.roles.includes('agent') && data.projectId) {
      const project = await Project.findById(data.projectId);
      if (project && project.assignedAgentId) {
        query._id = project.assignedAgentId;
      }
    }

    // FREELANCER: Specific freelancer notifications
    if (config.roles.includes('freelancer')) {
      if (data.freelancerId) {
        query._id = data.freelancerId;
      } else if (data.bidderId) {
        query._id = data.bidderId;
      } else if (config.event === 'BID_SHORTLISTED' && data.projectId) {
        // For shortlisted bids, get all shortlisted freelancers
        const shortlistedBids = await Bid.find({
          projectId: data.projectId,
          status: 'shortlisted'
        }).select('bidderId');

        query._id = { $in: shortlistedBids.map(bid => bid.bidderId) };
      }
    }

    return query;
  }

  /**
   * Prepare notification data with user-specific information
   */
  static async prepareNotificationData(config, data, user) {
    const notificationData = { ...data };

    // Add user-specific data
    if (user) {
      notificationData.userName = user.name;
      notificationData.userEmail = user.email;
      notificationData.userRole = user.role;
    }

    // Fetch related data if needed
    if (data.projectId && !notificationData.projectTitle) {
      const project = await Project.findById(data.projectId);
      if (project) {
        notificationData.projectTitle = project.title;
        notificationData.clientName = await this.getUserName(project.client);
        notificationData.status = project.status;
      }
    }

    // User management: hydrate created/updated user fields for templates
    if (data.userId && (!notificationData.userName || !notificationData.email || !notificationData.role)) {
      try {
        const targetUser = await User.findById(data.userId).select('name email role');
        if (targetUser) {
          notificationData.userName = notificationData.userName || targetUser.name;
          notificationData.email = notificationData.email || targetUser.email;
          notificationData.role = notificationData.role || targetUser.role;
        }
      } catch (_) {
        // ignore
      }
    }

    // Resolve actor fields into human-readable names (never show raw Mongo ObjectIds)
    if (data.createdBy && (this.looksLikeObjectId(String(notificationData.createdBy || '')) || !notificationData.createdBy)) {
      notificationData.createdBy = await this.getUserName(data.createdBy);
    }

    if (data.updatedBy && (this.looksLikeObjectId(String(notificationData.updatedBy || '')) || !notificationData.updatedBy)) {
      notificationData.updatedBy = await this.getUserName(data.updatedBy);
    }

    if (data.deletedBy && (this.looksLikeObjectId(String(notificationData.deletedBy || '')) || !notificationData.deletedBy)) {
      notificationData.deletedBy = await this.getUserName(data.deletedBy);
    }

    if (data.suspendedBy && (this.looksLikeObjectId(String(notificationData.suspendedBy || '')) || !notificationData.suspendedBy)) {
      notificationData.suspendedBy = await this.getUserName(data.suspendedBy);
    }

    if (data.freelancerId && !notificationData.freelancerName) {
      notificationData.freelancerName = await this.getUserName(data.freelancerId);
    }

    if (data.clientId && !notificationData.clientName) {
      notificationData.clientName = await this.getUserName(data.clientId);
    }

    if (data.agentId && !notificationData.agentName) {
      notificationData.agentName = await this.getUserName(data.agentId);
    }

    // Bid events: ensure freelancerName is available for BID_RECEIVED templates
    if (data.bidderId && !notificationData.freelancerName) {
      notificationData.freelancerName = await this.getUserName(data.bidderId);
    }

    return notificationData;
  }

  /**
   * Get user name by ID
   */
  static async getUserName(userId) {
    try {
      const user = await User.findById(userId).select('name');
      return user ? user.name : 'Unknown User';
    } catch (error) {
      return 'Unknown User';
    }
  }

  /**
   * Send real-time notification via socket
   */
  static sendRealTimeNotification(userId, notification, socketEvent) {
    try {
      const socketData = {
        id: notification._id,
        user_id: userId,
        type: notification.type,
        title: notification.title,
        // FE expects `description` in many places; keep `message` for backward compatibility
        description: notification.message,
        message: notification.message,
        projectId: notification.projectId,
        link: this.toLink(notification.metadata || {}, notification),
        priority: notification.metadata.priority,
        read: notification.isRead,
        created_at: notification.createdAt,
        metadata: notification.metadata
      };

      // Always emit the generic event used across the app UI
      socketService.emitToUser(userId, 'notification:created', socketData);

      // Also emit role-specific event (if configured)
      if (socketEvent && socketEvent !== 'notification:created') {
        socketService.emitToUser(userId, socketEvent, socketData);
      }

    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  /**
   * Convenience methods for common notification types
   */

  // Project notifications
  static async notifyProjectCreated(projectId, clientId, performedBy) {
    return this.createNotification('PROJECT_CREATED', {
      projectId,
      clientId
    }, { performedBy });
  }

  static async notifyProjectUpdated(projectId, updatedBy, performedBy) {
    return this.createNotification('PROJECT_UPDATED', {
      projectId,
      updatedBy
    }, { performedBy });
  }

  static async notifyProjectStatusChanged(projectId, oldStatus, newStatus, changedBy, performedBy) {
    return this.createNotification('PROJECT_STATUS_CHANGED', {
      projectId,
      oldStatus,
      newStatus,
      changedBy
    }, { performedBy });
  }

  static async notifyProjectDeleted(projectId, deletedBy, performedBy) {
    return this.createNotification('PROJECT_DELETED', {
      projectId,
      deletedBy
    }, { performedBy });
  }

  // Milestone notifications
  static async notifyMilestoneCreated(projectId, milestoneId, milestoneTitle, createdBy, performedBy) {
    return this.createNotification('MILESTONE_CREATED', {
      projectId,
      milestoneId,
      milestoneTitle,
      createdBy
    }, { performedBy });
  }

  static async notifyMilestoneUpdated(projectId, milestoneId, milestoneTitle, updatedBy, performedBy) {
    return this.createNotification('MILESTONE_UPDATED', {
      projectId,
      milestoneId,
      milestoneTitle,
      updatedBy
    }, { performedBy });
  }

  static async notifyMilestoneCompleted(projectId, milestoneId, milestoneTitle, completedBy, performedBy) {
    return this.createNotification('MILESTONE_COMPLETED', {
      projectId,
      milestoneId,
      milestoneTitle,
      completedBy
    }, { performedBy });
  }

  // Bid notifications
  static async notifyBidCreated(projectId, bidId, bidderId, bidAmount, performedBy) {
    return this.createNotification('BID_CREATED', {
      projectId,
      bidId,
      bidderId,
      bidAmount
    }, { performedBy });
  }

  static async notifyBidReceived(projectId, bidId, bidderId, bidAmount, performedBy) {
    return this.createNotification('BID_RECEIVED', {
      projectId,
      bidId,
      bidderId,
      bidAmount
    }, { performedBy });
  }

  static async notifyBidAccepted(projectId, bidId, bidderId, acceptedBy, performedBy) {
    return this.createNotification('BID_ACCEPTED', {
      projectId,
      bidId,
      bidderId,
      acceptedBy
    }, { performedBy });
  }

  static async notifyBidRejected(projectId, bidId, bidderId, rejectedBy, performedBy) {
    return this.createNotification('BID_REJECTED', {
      projectId,
      bidId,
      bidderId,
      rejectedBy
    }, { performedBy });
  }

  static async notifyBidShortlisted(projectId, bidId, bidderId, shortlistedBy, performedBy) {
    return this.createNotification('BID_SHORTLISTED', {
      projectId,
      bidId,
      bidderId,
      shortlistedBy
    }, { performedBy });
  }

  // User management notifications
  static async notifyUserCreated(userId, createdBy, role, auditLogId, performedBy) {
    return this.createNotification('USER_CREATED', {
      userId,
      createdBy,
      role,
      auditLogId
    }, { performedBy });
  }

  static async notifyUserUpdated(userId, updatedBy, auditLogId, performedBy) {
    return this.createNotification('USER_UPDATED', {
      userId,
      updatedBy,
      auditLogId
    }, { performedBy });
  }

  static async notifyUserVerificationChanged(userId, verificationStatus, changedBy, auditLogId, performedBy) {
    return this.createNotification('USER_VERIFICATION_CHANGED', {
      userId,
      verificationStatus,
      changedBy,
      auditLogId
    }, { performedBy });
  }

  static async notifyUserDeleted(userId, deletedBy, auditLogId, performedBy) {
    return this.createNotification('USER_DELETED', {
      userId,
      deletedBy,
      auditLogId
    }, { performedBy });
  }

  static async notifyUserSuspended(userId, suspendedBy, auditLogId, performedBy) {
    return this.createNotification('USER_SUSPENDED', {
      userId,
      suspendedBy,
      auditLogId
    }, { performedBy });
  }

  // Assignment notifications
  static async notifyFreelancerAssigned(projectId, freelancerId, assignedBy, performedBy) {
    return this.createNotification('FREELANCER_ASSIGNED', {
      projectId,
      freelancerId,
      assignedBy
    }, { performedBy });
  }

  static async notifyAgentAssigned(projectId, agentId, assignedBy, performedBy) {
    return this.createNotification('AGENT_ASSIGNED', {
      projectId,
      agentId,
      assignedBy
    }, { performedBy });
  }

  static async notifyAgentUnassigned(projectId, agentId, unassignedBy, performedBy) {
    return this.createNotification('AGENT_UNASSIGNED', {
      projectId,
      agentId,
      unassignedBy
    }, { performedBy });
  }

  static async notifyProjectAssigned(projectId, agentId, assignedBy, performedBy) {
    return this.createNotification('PROJECT_ASSIGNED', {
      projectId,
      agentId,
      assignedBy
    }, { performedBy });
  }

  // Project review notifications
  static async notifyProjectReviewPending(projectId, performedBy) {
    return this.createNotification('PROJECT_REVIEW_PENDING', {
      projectId
    }, { performedBy });
  }
}

module.exports = NotificationService;
