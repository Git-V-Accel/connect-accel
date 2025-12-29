const AuditLog = require('../models/AuditLog');
const { AUDIT_MESSAGES, AUDIT_ACTIONS, AUDIT_SEVERITY } = require('../constants/auditMessages');

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {Object} params.performedBy - User who performed the action
 * @param {Object} params.targetUser - User who was affected
 * @param {String} params.action - Action type (from AUDIT_ACTIONS)
 * @param {Object} params.changes - Changes made (optional)
 * @param {Object} params.previousValues - Previous values (optional)
 * @param {Object} params.newValues - New values (optional)
 * @param {Object} params.req - Express request object (optional, for IP and user agent)
 * @param {Object} params.metadata - Additional metadata (optional)
 */
const createAuditLog = async ({
  performedBy,
  targetUser,
  action,
  changes = {},
  previousValues = {},
  newValues = {},
  req = null,
  metadata = {}
}) => {
  try {
    // Generate description based on action
    let description = '';
    
    switch (action) {
      case AUDIT_ACTIONS.USER_CREATED:
        description = AUDIT_MESSAGES.USER_CREATED(performedBy.name, targetUser.name);
        break;
      case AUDIT_ACTIONS.USER_UPDATED:
        description = AUDIT_MESSAGES.USER_UPDATED(performedBy.name, targetUser.name);
        break;
      case AUDIT_ACTIONS.USER_PROFILE_UPDATED:
        description = AUDIT_MESSAGES.USER_PROFILE_UPDATED(performedBy.name, targetUser.name);
        break;
      case AUDIT_ACTIONS.USER_ROLE_UPDATED:
        description = AUDIT_MESSAGES.USER_ROLE_UPDATED(
          performedBy.name,
          targetUser.name,
          previousValues.role,
          newValues.role
        );
        break;
      case AUDIT_ACTIONS.USER_STATUS_UPDATED:
        description = AUDIT_MESSAGES.USER_STATUS_UPDATED(
          performedBy.name,
          targetUser.name,
          previousValues.status,
          newValues.status
        );
        break;
      case AUDIT_ACTIONS.USER_PASSWORD_CHANGED:
        description = AUDIT_MESSAGES.USER_PASSWORD_CHANGED(performedBy.name, targetUser.name);
        break;
      case AUDIT_ACTIONS.USER_DELETED:
        description = AUDIT_MESSAGES.USER_DELETED(performedBy.name, targetUser.name);
        break;
      case AUDIT_ACTIONS.USER_REGISTERED:
        description = AUDIT_MESSAGES.USER_REGISTERED(targetUser.name);
        break;
      case AUDIT_ACTIONS.USER_LOGIN:
        description = AUDIT_MESSAGES.USER_LOGIN(targetUser.name);
        break;
      case AUDIT_ACTIONS.USER_LOGOUT:
        description = AUDIT_MESSAGES.USER_LOGOUT(targetUser.name);
        break;
      default:
        description = `${performedBy.name} performed ${action} on ${targetUser.name}`;
    }

    // Get IP address and user agent from request
    const ipAddress = req ? (req.ip || req.connection?.remoteAddress) : null;
    const userAgent = req ? req.get('user-agent') : null;

    // Create audit log entry
    const auditLog = await AuditLog.create({
      performedBy: performedBy._id || performedBy.id,
      performedByName: performedBy.name,
      performedByEmail: performedBy.email,
      performedByRole: performedBy.role,
      targetUser: targetUser._id || targetUser.id,
      targetUserName: targetUser.name,
      targetUserEmail: targetUser.email,
      targetUserRole: targetUser.role,
      action,
      description,
      changes,
      previousValues,
      newValues,
      ipAddress,
      userAgent,
      severity: AUDIT_SEVERITY[action] || 'medium',
      metadata
    });

    console.log(`Audit log created: ${action} - ${description}`);
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break the main operation
    return null;
  }
};

/**
 * Helper function to detect changes between old and new objects
 * @param {Object} oldObj - Old object
 * @param {Object} newObj - New object
 * @param {Array} fieldsToCheck - Fields to check for changes
 * @returns {Object} Object containing changes, previousValues, and newValues
 */
const detectChanges = (oldObj, newObj, fieldsToCheck) => {
  const changes = {};
  const previousValues = {};
  const newValues = {};

  fieldsToCheck.forEach(field => {
    const oldValue = oldObj[field];
    const newValue = newObj[field];

    // Handle array comparison
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[field] = { from: oldValue, to: newValue };
        previousValues[field] = oldValue;
        newValues[field] = newValue;
      }
    } 
    // Handle object comparison
    else if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[field] = { from: oldValue, to: newValue };
        previousValues[field] = oldValue;
        newValues[field] = newValue;
      }
    }
    // Handle primitive comparison
    else if (oldValue !== newValue && newValue !== undefined) {
      changes[field] = { from: oldValue, to: newValue };
      previousValues[field] = oldValue;
      newValues[field] = newValue;
    }
  });

  return { changes, previousValues, newValues };
};

module.exports = {
  createAuditLog,
  detectChanges
};
