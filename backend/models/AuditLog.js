const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedByName: {
    type: String,
    required: true
  },
  performedByEmail: {
    type: String,
    required: true
  },
  performedByRole: {
    type: String,
    required: true
  },
  
  // What action was performed
  action: {
    type: String,
    required: true,
    enum: [
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_ROLE_UPDATED',
      'USER_STATUS_UPDATED',
      'USER_PROFILE_UPDATED',
      'USER_PASSWORD_CHANGED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTERED'
    ]
  },
  
  // Target user (who was affected)
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUserName: {
    type: String,
    required: true
  },
  targetUserEmail: {
    type: String,
    required: true
  },
  targetUserRole: {
    type: String,
    required: true
  },
  
  // Details of the change
  description: {
    type: String,
    required: true
  },
  
  // What changed (for updates)
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Previous values (for updates/deletes)
  previousValues: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // New values (for creates/updates)
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Severity level
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetUser: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedByRole: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
