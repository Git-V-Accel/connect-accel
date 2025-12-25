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
  USER_REGISTERED: 'USER_REGISTERED'
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
  USER_REGISTERED: 'medium'
};

module.exports = {
  AUDIT_MESSAGES,
  AUDIT_ACTIONS,
  AUDIT_SEVERITY
};
