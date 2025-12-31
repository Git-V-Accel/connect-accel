const { USER_ROLES } = require('./index');

// Role-based notification configuration
const NOTIFICATION_CONFIG = {
  // CLIENT NOTIFICATIONS
  CLIENT: {
    PROJECT_CREATED: {
      type: 'project_created',
      event: 'PROJECT_CREATED',
      roles: ['client'],
      priority: 'medium',
      template: {
        title: 'Project Created Successfully',
        message: 'Your project "{projectTitle}" has been created and is now {status}.',
        data: ['projectTitle', 'status']
      },
      socketEvent: 'notification:client:project_created'
    },
    PROJECT_UPDATED: {
      type: 'project_updated',
      event: 'PROJECT_UPDATED',
      roles: ['client'],
      priority: 'medium',
      template: {
        title: 'Project Updated',
        message: 'Your project "{projectTitle}" has been updated.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:client:project_updated'
    },
    PROJECT_STATUS_CHANGED: {
      type: 'project_status_changed',
      event: 'PROJECT_STATUS_CHANGED',
      roles: ['client'],
      priority: 'high',
      template: {
        title: 'Project Status Changed',
        message: 'Your project "{projectTitle}" status changed from {oldStatus} to {newStatus}.',
        data: ['projectTitle', 'oldStatus', 'newStatus']
      },
      socketEvent: 'notification:client:status_changed'
    },
    PROJECT_DELETED: {
      type: 'project_deleted',
      event: 'PROJECT_DELETED',
      roles: ['client'],
      priority: 'high',
      template: {
        title: 'Project Deleted',
        message: 'Your project "{projectTitle}" has been deleted.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:client:project_deleted'
    },
    MILESTONE_CREATED: {
      type: 'milestone_created',
      event: 'MILESTONE_CREATED',
      roles: ['client'],
      priority: 'medium',
      template: {
        title: 'New Milestone Added',
        message: 'New milestone "{milestoneTitle}" added to project "{projectTitle}".',
        data: ['milestoneTitle', 'projectTitle']
      },
      socketEvent: 'notification:client:milestone_created'
    },
    MILESTONE_UPDATED: {
      type: 'milestone_updated',
      event: 'MILESTONE_UPDATED',
      roles: ['client'],
      priority: 'medium',
      template: {
        title: 'Milestone Updated',
        message: 'Milestone "{milestoneTitle}" in project "{projectTitle}" has been updated.',
        data: ['milestoneTitle', 'projectTitle']
      },
      socketEvent: 'notification:client:milestone_updated'
    },
    MILESTONE_COMPLETED: {
      type: 'milestone_completed',
      event: 'MILESTONE_COMPLETED',
      roles: ['client'],
      priority: 'high',
      template: {
        title: 'Milestone Completed',
        message: 'Milestone "{milestoneTitle}" in project "{projectTitle}" has been marked as completed.',
        data: ['milestoneTitle', 'projectTitle']
      },
      socketEvent: 'notification:client:milestone_completed'
    },
    BID_RECEIVED: {
      type: 'bid_received',
      event: 'BID_RECEIVED',
      roles: ['client'],
      priority: 'medium',
      template: {
        title: 'New Bid Received',
        message: '{freelancerName} has placed a bid of ${bidAmount} on your project "{projectTitle}".',
        data: ['freelancerName', 'bidAmount', 'projectTitle']
      },
      socketEvent: 'notification:client:bid_received'
    }
  },

  // FREELANCER NOTIFICATIONS
  FREELANCER: {
    BID_CREATED: {
      type: 'bid_created',
      event: 'BID_CREATED',
      roles: ['freelancer'],
      priority: 'medium',
      template: {
        title: 'Bid Submitted',
        message: 'Your bid of ${bidAmount} has been submitted for project "{projectTitle}".',
        data: ['bidAmount', 'projectTitle']
      },
      socketEvent: 'notification:freelancer:bid_created'
    },
    BID_UPDATED: {
      type: 'bid_updated',
      event: 'BID_UPDATED',
      roles: ['freelancer'],
      priority: 'medium',
      template: {
        title: 'Bid Updated',
        message: 'Your bid for project "{projectTitle}" has been updated.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:freelancer:bid_updated'
    },
    BID_WITHDRAWN: {
      type: 'bid_withdrawn',
      event: 'BID_WITHDRAWN',
      roles: ['freelancer'],
      priority: 'low',
      template: {
        title: 'Bid Withdrawn',
        message: 'Your bid for project "{projectTitle}" has been withdrawn.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:freelancer:bid_withdrawn'
    },
    BID_ACCEPTED: {
      type: 'bid_accepted',
      event: 'BID_ACCEPTED',
      roles: ['freelancer'],
      priority: 'high',
      template: {
        title: 'Bid Accepted! 🎉',
        message: 'Congratulations! Your bid for project "{projectTitle}" has been accepted.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:freelancer:bid_accepted'
    },
    BID_REJECTED: {
      type: 'bid_rejected',
      event: 'BID_REJECTED',
      roles: ['freelancer'],
      priority: 'medium',
      template: {
        title: 'Bid Not Selected',
        message: 'Your bid for project "{projectTitle}" was not selected.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:freelancer:bid_rejected'
    },
    BID_SHORTLISTED: {
      type: 'bid_shortlisted',
      event: 'BID_SHORTLISTED',
      roles: ['freelancer'],
      priority: 'high',
      template: {
        title: 'Bid Shortlisted',
        message: 'Your bid for project "{projectTitle}" has been shortlisted!',
        data: ['projectTitle']
      },
      socketEvent: 'notification:freelancer:bid_shortlisted'
    },
    PROJECT_ASSIGNED: {
      type: 'project_assigned',
      event: 'PROJECT_ASSIGNED',
      roles: ['freelancer'],
      priority: 'high',
      template: {
        title: 'Project Assigned',
        message: 'You have been assigned to project "{projectTitle}".',
        data: ['projectTitle']
      },
      socketEvent: 'notification:freelancer:project_assigned'
    },
    // When shortlisted, freelancer gets milestone updates
    MILESTONE_CREATED_SHORTLISTED: {
      type: 'milestone_created_shortlisted',
      event: 'MILESTONE_CREATED',
      roles: ['freelancer'],
      priority: 'medium',
      template: {
        title: 'Milestone Update',
        message: 'New milestone "{milestoneTitle}" added to project "{projectTitle}" you are shortlisted for.',
        data: ['milestoneTitle', 'projectTitle']
      },
      socketEvent: 'notification:freelancer:milestone_created'
    },
    MILESTONE_UPDATED_SHORTLISTED: {
      type: 'milestone_updated_shortlisted',
      event: 'MILESTONE_UPDATED',
      roles: ['freelancer'],
      priority: 'medium',
      template: {
        title: 'Milestone Update',
        message: 'Milestone "{milestoneTitle}" updated in project "{projectTitle}" you are shortlisted for.',
        data: ['milestoneTitle', 'projectTitle']
      },
      socketEvent: 'notification:freelancer:milestone_updated'
    }
  },

  // ADMIN NOTIFICATIONS (includes SuperAdmin)
  ADMIN: {
    USER_CREATED: {
      type: 'user_created',
      event: 'USER_CREATED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'New User Created',
        message: 'New user {userName} ({email}) has been created as {role} by {createdBy}.',
        data: ['userName', 'email', 'role', 'createdBy']
      },
      socketEvent: 'notification:admin:user_created'
    },
    USER_UPDATED: {
      type: 'user_updated',
      event: 'USER_UPDATED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'User Updated',
        message: 'User {userName} ({email}) has been updated by {updatedBy}.',
        data: ['userName', 'email', 'updatedBy']
      },
      socketEvent: 'notification:admin:user_updated'
    },
    USER_VERIFICATION_CHANGED: {
      type: 'user_verification_changed',
      event: 'USER_VERIFICATION_CHANGED',
      roles: ['admin', 'superadmin'],
      priority: 'high',
      template: {
        title: 'User Verification Status Changed',
        message: 'User {userName} verification status changed to {verificationStatus}.',
        data: ['userName', 'verificationStatus']
      },
      socketEvent: 'notification:admin:verification_changed'
    },
    USER_DELETED: {
      type: 'user_deleted',
      event: 'USER_DELETED',
      roles: ['admin', 'superadmin'],
      priority: 'high',
      template: {
        title: 'User Deleted',
        message: 'User {userName} ({email}) has been deleted by {deletedBy}.',
        data: ['userName', 'email', 'deletedBy']
      },
      socketEvent: 'notification:admin:user_deleted'
    },
    USER_SUSPENDED: {
      type: 'user_suspended',
      event: 'USER_SUSPENDED',
      roles: ['admin', 'superadmin'],
      priority: 'high',
      template: {
        title: 'User Suspended',
        message: 'User {userName} ({email}) has been suspended by {suspendedBy}.',
        data: ['userName', 'email', 'suspendedBy']
      },
      socketEvent: 'notification:admin:user_suspended'
    },

    BID_RECEIVED_ADMIN: {
      type: 'bid_received_admin',
      event: 'BID_RECEIVED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'New Bid Received',
        message: '{freelancerName} submitted a bid of ${bidAmount} on project "{projectTitle}".',
        data: ['freelancerName', 'bidAmount', 'projectTitle']
      },
      socketEvent: 'notification:admin:bid_received'
    },
    PROJECT_REVIEW_PENDING: {
      type: 'project_review_pending',
      event: 'PROJECT_REVIEW_PENDING',
      roles: ['admin', 'superadmin'],
      priority: 'high',
      template: {
        title: 'Project Review Required',
        message: 'Project "{projectTitle}" by {clientName} is pending review.',
        data: ['projectTitle', 'clientName']
      },
      socketEvent: 'notification:admin:project_review_pending'
    },
    PROJECT_CREATED_ADMIN: {
      type: 'project_created_admin',
      event: 'PROJECT_CREATED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'New Project Created',
        message: 'New project "{projectTitle}" created by {clientName}.',
        data: ['projectTitle', 'clientName']
      },
      socketEvent: 'notification:admin:project_created'
    },
    PROJECT_UPDATED_ADMIN: {
      type: 'project_updated_admin',
      event: 'PROJECT_UPDATED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'Project Updated',
        message: 'Project "{projectTitle}" has been updated.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:admin:project_updated'
    },
    PROJECT_STATUS_CHANGED_ADMIN: {
      type: 'project_status_changed_admin',
      event: 'PROJECT_STATUS_CHANGED',
      roles: ['admin', 'superadmin'],
      priority: 'high',
      template: {
        title: 'Project Status Changed',
        message: 'Project "{projectTitle}" status changed from {oldStatus} to {newStatus}.',
        data: ['projectTitle', 'oldStatus', 'newStatus']
      },
      socketEvent: 'notification:admin:status_changed'
    },
    PROJECT_DELETED_ADMIN: {
      type: 'project_deleted_admin',
      event: 'PROJECT_DELETED',
      roles: ['admin', 'superadmin'],
      priority: 'high',
      template: {
        title: 'Project Deleted',
        message: 'Project "{projectTitle}" has been deleted.',
        data: ['projectTitle']
      },
      socketEvent: 'notification:admin:project_deleted'
    },
    MILESTONE_UPDATED_ADMIN: {
      type: 'milestone_updated_admin',
      event: 'MILESTONE_UPDATED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'Milestone Updated',
        message: 'Milestone "{milestoneTitle}" in project "{projectTitle}" has been updated.',
        data: ['milestoneTitle', 'projectTitle']
      },
      socketEvent: 'notification:admin:milestone_updated'
    },
    FREELANCER_ASSIGNED: {
      type: 'freelancer_assigned',
      event: 'FREELANCER_ASSIGNED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'Freelancer Assigned',
        message: 'Freelancer {freelancerName} has been assigned to project "{projectTitle}".',
        data: ['freelancerName', 'projectTitle']
      },
      socketEvent: 'notification:admin:freelancer_assigned'
    },
    FREELANCER_UNASSIGNED: {
      type: 'freelancer_unassigned',
      event: 'FREELANCER_UNASSIGNED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'Freelancer Unassigned',
        message: 'Freelancer {freelancerName} has been unassigned from project "{projectTitle}".',
        data: ['freelancerName', 'projectTitle']
      },
      socketEvent: 'notification:admin:freelancer_unassigned'
    },
    AGENT_ASSIGNED: {
      type: 'agent_assigned',
      event: 'AGENT_ASSIGNED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'Agent Assigned',
        message: 'Agent {agentName} has been assigned to project "{projectTitle}".',
        data: ['agentName', 'projectTitle']
      },
      socketEvent: 'notification:admin:agent_assigned'
    },
    AGENT_UNASSIGNED: {
      type: 'agent_unassigned',
      event: 'AGENT_UNASSIGNED',
      roles: ['admin', 'superadmin'],
      priority: 'medium',
      template: {
        title: 'Agent Unassigned',
        message: 'Agent {agentName} has been unassigned from project "{projectTitle}".',
        data: ['agentName', 'projectTitle']
      },
      socketEvent: 'notification:admin:agent_unassigned'
    }
  },

  // AGENT NOTIFICATIONS
  AGENT: {
    PROJECT_STATUS_CHANGED_AGENT: {
      type: 'project_status_changed_agent',
      event: 'PROJECT_STATUS_CHANGED',
      roles: ['agent'],
      priority: 'high',
      template: {
        title: 'Assigned Project Status Changed',
        message: 'Your assigned project "{projectTitle}" status changed from {oldStatus} to {newStatus}.',
        data: ['projectTitle', 'oldStatus', 'newStatus']
      },
      socketEvent: 'notification:agent:status_changed'
    },
    PROJECT_ASSIGNED_AGENT: {
      type: 'project_assigned_agent',
      event: 'PROJECT_ASSIGNED',
      roles: ['agent'],
      priority: 'high',
      template: {
        title: 'Project Assigned to You',
        message: 'You have been assigned to manage project "{projectTitle}".',
        data: ['projectTitle']
      },
      socketEvent: 'notification:agent:project_assigned'
    },
    BID_RECEIVED_AGENT: {
      type: 'bid_received_agent',
      event: 'BID_RECEIVED',
      roles: ['agent'],
      priority: 'medium',
      template: {
        title: 'New Bid Received',
        message: '{freelancerName} submitted a bid of ${bidAmount} on your assigned project "{projectTitle}".',
        data: ['freelancerName', 'bidAmount', 'projectTitle']
      },
      socketEvent: 'notification:agent:bid_received'
    }
  }
};

// Helper function to get notification config by type and role
const getNotificationConfig = (eventType, userRole) => {
  for (const role in NOTIFICATION_CONFIG) {
    if (NOTIFICATION_CONFIG[role][eventType]) {
      const config = NOTIFICATION_CONFIG[role][eventType];
      if (config.roles.includes(userRole)) {
        return config;
      }
    }
  }
  return null;
};

// Helper function to get all notification configs for a role
const getRoleNotifications = (userRole) => {
  const roleNotifications = {};
  
  for (const role in NOTIFICATION_CONFIG) {
    for (const eventType in NOTIFICATION_CONFIG[role]) {
      const config = NOTIFICATION_CONFIG[role][eventType];
      if (config.roles.includes(userRole)) {
        roleNotifications[eventType] = config;
      }
    }
  }
  
  return roleNotifications;
};

// Helper function to format notification message
const formatNotificationMessage = (template, data) => {
  let { title, message } = template;
  
  // Replace placeholders in title and message
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    title = title.replace(new RegExp(placeholder, 'g'), value);
    message = message.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return { title, message };
};

module.exports = {
  NOTIFICATION_CONFIG,
  getNotificationConfig,
  getRoleNotifications,
  formatNotificationMessage
};
