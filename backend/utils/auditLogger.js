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
  targetUser = null,
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
    const performerName = performedBy?.name || 'System';
    const targetName = targetUser?.name || 'N/A';

    switch (action) {
      case AUDIT_ACTIONS.USER_CREATED:
        description = AUDIT_MESSAGES.USER_CREATED(performerName, targetName);
        break;
      case AUDIT_ACTIONS.USER_UPDATED:
        description = AUDIT_MESSAGES.USER_UPDATED(performerName, targetName);
        break;
      case AUDIT_ACTIONS.USER_PROFILE_UPDATED:
        description = AUDIT_MESSAGES.USER_PROFILE_UPDATED(performerName, targetName);
        break;
      case AUDIT_ACTIONS.USER_ROLE_UPDATED:
        description = AUDIT_MESSAGES.USER_ROLE_UPDATED(
          performerName,
          targetName,
          previousValues.role,
          newValues.role
        );
        break;
      case AUDIT_ACTIONS.USER_STATUS_UPDATED:
        description = AUDIT_MESSAGES.USER_STATUS_UPDATED(
          performerName,
          targetName,
          previousValues.status,
          newValues.status
        );
        break;
      case AUDIT_ACTIONS.USER_PASSWORD_CHANGED:
        description = AUDIT_MESSAGES.USER_PASSWORD_CHANGED(performerName, targetName);
        break;
      case AUDIT_ACTIONS.USER_DELETED:
        description = AUDIT_MESSAGES.USER_DELETED(performerName, targetName);
        break;
      case AUDIT_ACTIONS.USER_REGISTERED:
        description = AUDIT_MESSAGES.USER_REGISTERED(targetName);
        break;
      case AUDIT_ACTIONS.USER_LOGIN:
        description = AUDIT_MESSAGES.USER_LOGIN(targetName);
        break;
      case AUDIT_ACTIONS.USER_LOGOUT:
        description = AUDIT_MESSAGES.USER_LOGOUT(targetName);
        break;

      // Project Actions
      case AUDIT_ACTIONS.PROJECT_CREATED:
        description = AUDIT_MESSAGES.PROJECT_CREATED(performerName, metadata.projectTitle || 'Unknown Project');
        break;
      case AUDIT_ACTIONS.PROJECT_UPDATED:
        description = AUDIT_MESSAGES.PROJECT_UPDATED(performerName, metadata.projectTitle || 'Unknown Project');
        break;
      case AUDIT_ACTIONS.PROJECT_APPROVED:
        description = AUDIT_MESSAGES.PROJECT_APPROVED(performerName, metadata.projectTitle || 'Unknown Project');
        break;
      case AUDIT_ACTIONS.PROJECT_REJECTED:
        description = AUDIT_MESSAGES.PROJECT_REJECTED(performerName, metadata.projectTitle || 'Unknown Project', metadata.remark || metadata.reason);
        break;
      case AUDIT_ACTIONS.PROJECT_STATUS_CHANGED:
        description = AUDIT_MESSAGES.PROJECT_STATUS_CHANGED(
          performerName,
          metadata.projectTitle || 'Unknown Project',
          previousValues.status,
          newValues.status
        );
        break;
      case AUDIT_ACTIONS.PROJECT_DELETED:
        description = AUDIT_MESSAGES.PROJECT_DELETED(performerName, metadata.projectTitle || 'Unknown Project');
        break;

      // Bid Actions
      case AUDIT_ACTIONS.BID_PLACED:
        description = AUDIT_MESSAGES.BID_PLACED(performerName, metadata.projectTitle || 'Project', metadata.amount);
        break;
      case AUDIT_ACTIONS.BID_ACCEPTED:
        description = AUDIT_MESSAGES.BID_ACCEPTED(performerName, metadata.projectTitle || 'Project', targetName);
        break;
      case AUDIT_ACTIONS.BID_REJECTED:
        description = AUDIT_MESSAGES.BID_REJECTED(performerName, metadata.projectTitle || 'Project', targetName);
        break;

      // Payment Actions
      case AUDIT_ACTIONS.PAYMENT_INITIATED:
        description = AUDIT_MESSAGES.PAYMENT_INITIATED(performerName, metadata.projectTitle || 'Project', metadata.amount);
        break;
      case AUDIT_ACTIONS.PAYMENT_COMPLETED:
        description = AUDIT_MESSAGES.PAYMENT_COMPLETED(performerName, metadata.projectTitle || 'Project', metadata.amount);
        break;
      case AUDIT_ACTIONS.PAYMENT_FAILED:
        description = AUDIT_MESSAGES.PAYMENT_FAILED(performerName, metadata.projectTitle || 'Project', metadata.amount, metadata.reason);
        break;

      // Milestone Actions
      case AUDIT_ACTIONS.MILESTONE_CREATED:
        description = AUDIT_MESSAGES.MILESTONE_CREATED(performerName, metadata.projectTitle || 'Project', metadata.milestoneTitle || 'Milestone');
        break;
      case AUDIT_ACTIONS.MILESTONE_UPDATED:
        description = AUDIT_MESSAGES.MILESTONE_UPDATED(performerName, metadata.projectTitle || 'Project', metadata.milestoneTitle || 'Milestone');
        break;
      case AUDIT_ACTIONS.MILESTONE_COMPLETED:
        description = AUDIT_MESSAGES.MILESTONE_COMPLETED(performerName, metadata.projectTitle || 'Project', metadata.milestoneTitle || 'Milestone');
        break;
      case AUDIT_ACTIONS.MILESTONE_PAID:
        description = AUDIT_MESSAGES.MILESTONE_PAID(performerName, metadata.projectTitle || 'Project', metadata.milestoneTitle || 'Milestone', metadata.amount);
        break;

      case AUDIT_ACTIONS.CONSULTATION_ASSIGNED:
        description = AUDIT_MESSAGES.CONSULTATION_ASSIGNED(performerName, metadata.clientName || 'Client', metadata.assigneeName || 'Admin');
        break;

      case AUDIT_ACTIONS.NOTIFICATION_SENT:
        description = AUDIT_MESSAGES.NOTIFICATION_SENT(targetName, metadata.title || 'Notification');
        break;

      default:
        description = `${performerName} performed ${action}${targetUser ? ` on ${targetName}` : ''}`;
    }

    // Get IP address and user agent from request
    const ipAddress = req ? (req.ip || req.connection?.remoteAddress) : (metadata.ipAddress || null);
    const userAgent = req ? req.get('user-agent') : (metadata.userAgent || null);

    // Create audit log entry
    const auditLogData = {
      performedBy: performedBy?._id || performedBy?.id || null,
      performedByName: performerName,
      performedByEmail: performedBy?.email || 'system@connect-accel.com',
      performedByRole: performedBy?.role || 'system',
      action,
      description,
      changes,
      previousValues,
      newValues,
      ipAddress,
      userAgent,
      severity: AUDIT_SEVERITY[action] || 'medium',
      metadata
    };

    if (targetUser) {
      auditLogData.targetUser = targetUser._id || targetUser.id;
      auditLogData.targetUserName = targetUser.name;
      auditLogData.targetUserEmail = targetUser.email;
      auditLogData.targetUserRole = targetUser.role;
    }

    const auditLog = await AuditLog.create(auditLogData);

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
