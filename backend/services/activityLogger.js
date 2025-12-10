const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const User = require('../models/User');

class ActivityLogger {
  
  /**
   * Log a new activity
   * @param {Object} activityData - Activity data
   * @param {Object} req - Express request object (optional)
   */
  static async logActivity(activityData, req = null) {
    try {
      // Extract IP and User Agent from request if provided
      const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
      const userAgent = req?.get('User-Agent') || 'unknown';
      
      // Create activity log entry
      const activityLog = new ActivityLog({
        user: activityData.user,
        project: activityData.project || null,
        activityType: activityData.activityType,
        title: activityData.title,
        description: activityData.description,
        metadata: activityData.metadata || {},
        ipAddress,
        userAgent,
        severity: activityData.severity || 'medium',
        visibleToClient: activityData.visibleToClient !== undefined ? activityData.visibleToClient : true,
        visibleToAdmin: activityData.visibleToAdmin !== undefined ? activityData.visibleToAdmin : true,
        tags: activityData.tags || [],
        references: activityData.references || {}
      });
      
      await activityLog.save();
      return activityLog;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }
  
  /**
   * Log project creation
   */
  static async logProjectCreated(projectId, userId, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'project_created',
      title: 'Project Created',
      description: `New project "${project.title}" was created by ${project.client?.name || 'Unknown'}`,
      metadata: {
        projectTitle: project.title,
        projectBudget: project.budget,
        projectPriority: project.priority,
        projectCategory: project.category,
        projectTimeline: project.timeline
      },
      tags: ['project', 'creation', 'client'],
      severity: 'medium'
    }, req);
  }
  
  /**
   * Log project update
   */
  static async logProjectUpdated(projectId, userId, updateData, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    const changes = [];
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== project[key]) {
        changes.push(`${key}: ${project[key]} → ${updateData[key]}`);
      }
    });
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'project_updated',
      title: 'Project Updated',
      description: `Project "${project.title}" was updated. Changes: ${changes.join(', ')}`,
      metadata: {
        projectTitle: project.title,
        changes: updateData,
        changeCount: changes.length
      },
      tags: ['project', 'update'],
      severity: 'medium'
    }, req);
  }
  
  /**
   * Log project status change
   */
  static async logProjectStatusChanged(projectId, userId, oldStatus, newStatus, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'project_status_changed',
      title: 'Project Status Changed',
      description: `Project "${project.title}" status changed from "${oldStatus}" to "${newStatus}"`,
      metadata: {
        projectTitle: project.title,
        oldStatus,
        newStatus
      },
      tags: ['project', 'status', 'change'],
      severity: 'high'
    }, req);
  }
  
  /**
   * Log description addition
   */
  static async logDescriptionAdded(projectId, userId, description, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'description_added',
      title: 'Description Added',
      description: `Additional description added to project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        descriptionLength: description.length,
        descriptionPreview: description.substring(0, 100) + (description.length > 100 ? '...' : '')
      },
      tags: ['project', 'description', 'content'],
      severity: 'low'
    }, req);
  }
  
  /**
   * Log description deletion
   */
  static async logDescriptionDeleted(projectId, userId, descriptionIndex, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'description_deleted',
      title: 'Description Deleted',
      description: `Description ${descriptionIndex + 1} was deleted from project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        descriptionIndex
      },
      tags: ['project', 'description', 'deletion'],
      severity: 'medium'
    }, req);
  }
  
  /**
   * Log file upload
   */
  static async logFileUploaded(projectId, userId, fileName, fileSize, fileType, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'file_uploaded',
      title: 'File Uploaded',
      description: `File "${fileName}" was uploaded to project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        fileName,
        fileSize,
        fileType
      },
      tags: ['project', 'file', 'upload'],
      severity: 'medium'
    }, req);
  }
  
  /**
   * Log file download
   */
  static async logFileDownloaded(projectId, userId, fileName, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'file_downloaded',
      title: 'File Downloaded',
      description: `File "${fileName}" was downloaded from project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        fileName
      },
      tags: ['project', 'file', 'download'],
      severity: 'low'
    }, req);
  }
  
  /**
   * Log payment initiation
   */
  static async logPaymentInitiated(projectId, userId, amount, milestoneTitle = null, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'payment_initiated',
      title: 'Payment Initiated',
      description: `Payment of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)} was initiated${milestoneTitle ? ` for milestone "${milestoneTitle}"` : ''} for project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        amount,
        currency: 'INR',
        milestoneTitle
      },
      tags: ['project', 'payment', 'initiated'],
      severity: 'high'
    }, req);
  }
  
  /**
   * Log payment completion
   */
  static async logPaymentCompleted(projectId, userId, amount, transactionId = null, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'payment_completed',
      title: 'Payment Completed',
      description: `Payment of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)} was completed for project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        amount,
        currency: 'INR',
        transactionId
      },
      tags: ['project', 'payment', 'completed'],
      severity: 'high'
    }, req);
  }
  
  /**
   * Log payment failure
   */
  static async logPaymentFailed(projectId, userId, amount, reason = null, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'payment_failed',
      title: 'Payment Failed',
      description: `Payment of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)} failed for project "${project.title}"${reason ? `. Reason: ${reason}` : ''}`,
      metadata: {
        projectTitle: project.title,
        amount,
        currency: 'INR',
        failureReason: reason
      },
      tags: ['project', 'payment', 'failed'],
      severity: 'critical'
    }, req);
  }
  
  /**
   * Log milestone creation
   */
  static async logMilestoneCreated(projectId, userId, milestoneTitle, milestoneAmount, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'milestone_created',
      title: 'Milestone Created',
      description: `Milestone "${milestoneTitle}" with amount ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(milestoneAmount)} was created for project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        milestoneTitle,
        milestoneAmount,
        currency: 'INR'
      },
      tags: ['project', 'milestone', 'creation'],
      severity: 'medium'
    }, req);
  }
  
  /**
   * Log milestone completion
   */
  static async logMilestoneCompleted(projectId, userId, milestoneTitle, milestoneAmount, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: userId,
      project: projectId,
      activityType: 'milestone_completed',
      title: 'Milestone Completed',
      description: `Milestone "${milestoneTitle}" was completed for project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        milestoneTitle,
        milestoneAmount,
        currency: 'INR'
      },
      tags: ['project', 'milestone', 'completed'],
      severity: 'high'
    }, req);
  }
  
  /**
   * Log admin assignment of freelancer
   */
  static async logFreelancerAssigned(projectId, adminId, freelancerName, req = null) {
    const project = await Project.findById(projectId).populate('client');
    if (!project) return;
    
    return await this.logActivity({
      user: adminId,
      project: projectId,
      activityType: 'admin_assigned_freelancer',
      title: 'Freelancer Assigned',
      description: `Admin assigned freelancer "${freelancerName}" to project "${project.title}"`,
      metadata: {
        projectTitle: project.title,
        freelancerName
      },
      tags: ['project', 'admin', 'freelancer', 'assignment'],
      severity: 'high',
      visibleToClient: true
    }, req);
  }
  
  /**
   * Log user login
   */
  static async logUserLogin(userId, userRole, req = null) {
    return await this.logActivity({
      user: userId,
      activityType: 'user_logged_in',
      title: 'User Logged In',
      description: `User logged into the system`,
      metadata: {
        userRole
      },
      tags: ['user', 'authentication', 'login'],
      severity: 'low',
      visibleToClient: false,
      visibleToAdmin: true
    }, req);
  }
  
  /**
   * Get activity logs for a client
   */
  static async getClientActivityLogs(clientId, options = {}) {
    const {
      limit = 50,
      skip = 0,
      cursor = null,
      activityTypes = [],
      startDate = null,
      endDate = null,
      includeProjectActivities = true
    } = options;
    
    try {
      // Get all projects for the client
      const projects = await Project.find({ client: clientId }).select('_id').lean();
      const projectIds = projects.map(p => p._id);
      
      // Build query
      const query = {
        $or: [
          { user: clientId }, // Client's own activities
          ...(includeProjectActivities ? [{ project: { $in: projectIds }, visibleToClient: true }] : [])
        ]
      };
      
      // Add activity type filter
      if (activityTypes.length > 0) {
        query.activityType = { $in: activityTypes };
      }
      
      // Add date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const { cursorPaginate } = require('../utils/pagination');
      
      const result = await cursorPaginate(ActivityLog, query, {
        cursor: cursor,
        limit: limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'user', select: 'name email role' },
          { path: 'project', select: 'title' }
        ],
        lean: true,
      });
      
      return result.data;
    } catch (error) {
      console.error('Error fetching client activity logs:', error);
      throw error;
    }
  }
  
  /**
   * Get activity logs for a project
   */
  static async getProjectActivityLogs(projectId, options = {}) {
    const {
      limit = 50,
      skip = 0,
      cursor = null,
      activityTypes = [],
      startDate = null,
      endDate = null
    } = options;
    
    try {
      const query = { project: projectId };
      
      // Add activity type filter
      if (activityTypes.length > 0) {
        query.activityType = { $in: activityTypes };
      }
      
      // Add date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const { cursorPaginate } = require('../utils/pagination');
      
      const result = await cursorPaginate(ActivityLog, query, {
        cursor: cursor,
        limit: limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'user', select: 'name email role' },
          { path: 'project', select: 'title' }
        ],
        lean: true,
      });
      
      return result.data;
    } catch (error) {
      console.error('Error fetching project activity logs:', error);
      throw error;
    }
  }

  /**
   * Log milestone released activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logMilestoneReleased(projectId, milestoneId, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'milestone_released',
        description: 'Milestone funds released',
        metadata: {
          milestoneId: milestoneId
        }
      }, req);
    } catch (error) {
      console.error('Error logging milestone released activity:', error);
    }
  }

  /**
   * Log milestone added activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logMilestoneAdded(projectId, milestoneId, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'milestone_added',
        description: 'New milestone added to project',
        metadata: {
          milestoneId: milestoneId
        }
      }, req);
    } catch (error) {
      console.error('Error logging milestone added activity:', error);
    }
  }

  /**
   * Log payment requested activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logPaymentRequested(projectId, milestoneId, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'payment_requested',
        description: 'Payment requested for milestone',
        metadata: {
          milestoneId: milestoneId
        }
      }, req);
    } catch (error) {
      console.error('Error logging payment requested activity:', error);
    }
  }

  /**
   * Log payment processing activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logPaymentProcessing(projectId, milestoneId, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'payment_processing',
        description: 'Payment marked as processing',
        metadata: {
          milestoneId: milestoneId
        }
      }, req);
    } catch (error) {
      console.error('Error logging payment processing activity:', error);
    }
  }

  /**
   * Log payment failed activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logPaymentFailed(projectId, milestoneId, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'payment_failed',
        description: 'Payment marked as failed',
        metadata: {
          milestoneId: milestoneId
        }
      }, req);
    } catch (error) {
      console.error('Error logging payment failed activity:', error);
    }
  }

  /**
   * Log payment cancelled activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logPaymentCancelled(projectId, milestoneId, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'payment_cancelled',
        description: 'Payment cancelled',
        metadata: {
          milestoneId: milestoneId
        }
      }, req);
    } catch (error) {
      console.error('Error logging payment cancelled activity:', error);
    }
  }

  /**
   * Log milestone status updated activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} oldStatus - Old status
   * @param {String} newStatus - New status
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logMilestoneStatusUpdated(projectId, milestoneId, oldStatus, newStatus, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'milestone_status_updated',
        description: `Milestone status changed from ${oldStatus} to ${newStatus}`,
        metadata: {
          milestoneId: milestoneId,
          oldStatus: oldStatus,
          newStatus: newStatus
        }
      }, req);
    } catch (error) {
      console.error('Error logging milestone status updated activity:', error);
    }
  }

  /**
   * Log milestone updated activity
   * @param {String} projectId - Project ID
   * @param {String} milestoneId - Milestone ID
   * @param {String} userId - User ID
   * @param {Object} req - Express request object (optional)
   */
  static async logMilestoneUpdated(projectId, milestoneId, userId, req = null) {
    try {
      await this.logActivity({
        user: userId,
        project: projectId,
        activityType: 'milestone_updated',
        description: 'Milestone details updated',
        metadata: {
          milestoneId: milestoneId
        }
      }, req);
    } catch (error) {
      console.error('Error logging milestone updated activity:', error);
    }
  }
}

module.exports = ActivityLogger;
