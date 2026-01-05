// Audit Log Messages
const AUDIT_MESSAGES = {
  // User Creation
  USER_CREATED: (performedBy, targetUser) =>
    `${performedBy} created a new user account for ${targetUser}`,

  // User Updates
  USER_UPDATED: (performedBy, targetUser) =>
    `${performedBy} updated user profile for ${targetUser}`,

  USER_PROFILE_UPDATED: (performedBy, targetUser) =>
    `${performedBy} updated profile information for ${targetUser}`,

  USER_ROLE_UPDATED: (performedBy, targetUser, oldRole, newRole) =>
    `${performedBy} changed role for ${targetUser} from ${oldRole} to ${newRole}`,

  USER_STATUS_UPDATED: (performedBy, targetUser, oldStatus, newStatus) =>
    `${performedBy} changed status for ${targetUser} from ${oldStatus} to ${newStatus}`,

  USER_PASSWORD_CHANGED: (performedBy, targetUser) =>
    `${performedBy} changed password for ${targetUser}`,

  // User Deletion
  USER_DELETED: (performedBy, targetUser) =>
    `${performedBy} deleted user account for ${targetUser}`,

  // Authentication
  USER_REGISTERED: (targetUser) =>
    `${targetUser} registered a new account`,

  USER_LOGIN: (targetUser) =>
    `${targetUser} logged in`,

  USER_LOGOUT: (targetUser) =>
    `${targetUser} logged out`,

  // Project Actions
  PROJECT_CREATED: (performedBy, projectTitle) =>
    `${performedBy} created project: ${projectTitle}`,

  PROJECT_UPDATED: (performedBy, projectTitle) =>
    `${performedBy} updated project: ${projectTitle}`,

  PROJECT_APPROVED: (performedBy, projectTitle) =>
    `${performedBy} approved project: ${projectTitle}`,

  PROJECT_REJECTED: (performedBy, projectTitle, reason) =>
    `${performedBy} rejected project: ${projectTitle}${reason ? `. Reason: ${reason}` : ''}`,

  PROJECT_STATUS_CHANGED: (performedBy, projectTitle, oldStatus, newStatus) =>
    `${performedBy} changed status of ${projectTitle} from ${oldStatus} to ${newStatus}`,

  PROJECT_DELETED: (performedBy, projectTitle) =>
    `${performedBy} deleted project: ${projectTitle}`,

  // Bid Actions
  BID_PLACED: (performedBy, projectTitle, amount) =>
    `${performedBy} placed a bid of ${amount} on project: ${projectTitle}`,

  BID_ACCEPTED: (performedBy, projectTitle, freelancerName) =>
    `${performedBy} accepted ${freelancerName}'s bid on project: ${projectTitle}`,

  BID_REJECTED: (performedBy, projectTitle, freelancerName) =>
    `${performedBy} rejected ${freelancerName}'s bid on project: ${projectTitle}`,

  // Payment Actions
  PAYMENT_INITIATED: (performedBy, projectTitle, amount) =>
    `${performedBy} initiated a payment of ${amount} for project: ${projectTitle}`,

  PAYMENT_COMPLETED: (performedBy, projectTitle, amount) =>
    `${performedBy} completed a payment of ${amount} for project: ${projectTitle}`,

  PAYMENT_FAILED: (performedBy, projectTitle, amount, reason) =>
    `${performedBy} failed to pay ${amount} for project: ${projectTitle}${reason ? `. Reason: ${reason}` : ''}`,

  // Milestone Actions
  MILESTONE_CREATED: (performedBy, projectTitle, milestoneTitle) =>
    `${performedBy} added milestone "${milestoneTitle}" to project: ${projectTitle}`,

  MILESTONE_UPDATED: (performedBy, projectTitle, milestoneTitle) =>
    `${performedBy} updated milestone "${milestoneTitle}" on project: ${projectTitle}`,

  MILESTONE_COMPLETED: (performedBy, projectTitle, milestoneTitle) =>
    `${performedBy} marked milestone "${milestoneTitle}" as completed on project: ${projectTitle}`,

  MILESTONE_PAID: (performedBy, projectTitle, milestoneTitle, amount) =>
    `${performedBy} paid ${amount} for milestone "${milestoneTitle}" on project: ${projectTitle}`,

  // Consultation Actions
  CONSULTATION_ASSIGNED: (performedBy, clientName, assigneeName) =>
    `${performedBy} assigned consultation request for ${clientName} to ${assigneeName}`,

  // Notification Actions
  NOTIFICATION_SENT: (targetUser, title) =>
    `Notification sent to ${targetUser}: ${title}`,

  // Field-specific updates
  EMAIL_UPDATED: (performedBy, targetUser, oldEmail, newEmail) =>
    `${performedBy} updated email for ${targetUser} from ${oldEmail} to ${newEmail}`,

  PHONE_UPDATED: (performedBy, targetUser) =>
    `${performedBy} updated phone number for ${targetUser}`,

  COMPANY_UPDATED: (performedBy, targetUser) =>
    `${performedBy} updated company information for ${targetUser}`,

  SKILLS_UPDATED: (performedBy, targetUser) =>
    `${performedBy} updated skills for ${targetUser}`,

  AVATAR_UPDATED: (performedBy, targetUser) =>
    `${performedBy} updated avatar for ${targetUser}`,

  AVATAR_REMOVED: (performedBy, targetUser) =>
    `${performedBy} removed avatar for ${targetUser}`,
};

// Audit Action Types
const AUDIT_ACTIONS = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ROLE_UPDATED: 'USER_ROLE_UPDATED',
  USER_STATUS_UPDATED: 'USER_STATUS_UPDATED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  USER_PASSWORD_CHANGED: 'USER_PASSWORD_CHANGED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTERED: 'USER_REGISTERED',

  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_APPROVED: 'PROJECT_APPROVED',
  PROJECT_REJECTED: 'PROJECT_REJECTED',
  PROJECT_STATUS_CHANGED: 'PROJECT_STATUS_CHANGED',
  PROJECT_DELETED: 'PROJECT_DELETED',

  BID_PLACED: 'BID_PLACED',
  BID_ACCEPTED: 'BID_ACCEPTED',
  BID_REJECTED: 'BID_REJECTED',

  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  MILESTONE_CREATED: 'MILESTONE_CREATED',
  MILESTONE_UPDATED: 'MILESTONE_UPDATED',
  MILESTONE_COMPLETED: 'MILESTONE_COMPLETED',
  MILESTONE_PAID: 'MILESTONE_PAID',

  CONSULTATION_ASSIGNED: 'CONSULTATION_ASSIGNED',

  NOTIFICATION_SENT: 'NOTIFICATION_SENT'
};

// Severity levels for different actions
const AUDIT_SEVERITY = {
  USER_CREATED: 'medium',
  USER_UPDATED: 'low',
  USER_DELETED: 'high',
  USER_ROLE_UPDATED: 'high',
  USER_STATUS_UPDATED: 'medium',
  USER_PROFILE_UPDATED: 'low',
  USER_PASSWORD_CHANGED: 'medium',
  USER_LOGIN: 'low',
  USER_LOGOUT: 'low',
  USER_REGISTERED: 'medium',

  PROJECT_CREATED: 'medium',
  PROJECT_UPDATED: 'low',
  PROJECT_APPROVED: 'high',
  PROJECT_REJECTED: 'high',
  PROJECT_STATUS_CHANGED: 'medium',
  PROJECT_DELETED: 'high',

  BID_PLACED: 'low',
  BID_ACCEPTED: 'medium',
  BID_REJECTED: 'low',

  PAYMENT_INITIATED: 'medium',
  PAYMENT_COMPLETED: 'high',
  PAYMENT_FAILED: 'high',

  MILESTONE_CREATED: 'medium',
  MILESTONE_UPDATED: 'low',
  MILESTONE_COMPLETED: 'medium',
  MILESTONE_PAID: 'medium',

  CONSULTATION_ASSIGNED: 'low',

  NOTIFICATION_SENT: 'low'
};

module.exports = {
  AUDIT_MESSAGES,
  AUDIT_ACTIONS,
  AUDIT_SEVERITY
};
