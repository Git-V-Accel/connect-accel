const mongoose = require('mongoose');
const { ACTIVITY_TYPES_ARRAY, MESSAGES, SEVERITY_LEVEL_ARRAY, SEVERITY_LEVEL } = require('../constants');
const { VALIDATION } = MESSAGES;

const activityLogSchema = new mongoose.Schema({
  // User who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, VALIDATION.ACTIVITY_LOG.USER_REQUIRED]
  },
  
  // Project related to this activity (optional for non-project activities)
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  
  // Type of activity
  activityType: {
    type: String,
    required: [true, VALIDATION.ACTIVITY_LOG.ACTIVITY_TYPE_REQUIRED],
    enum: ACTIVITY_TYPES_ARRAY
  },
  
  // Human-readable title for the activity
  title: {
    type: String,
    required: [true, VALIDATION.ACTIVITY_LOG.TITLE_REQUIRED],
    trim: true,
    maxlength: [200, VALIDATION.ACTIVITY_LOG.TITLE_MAX_LENGTH]
  },
  
  // Detailed description of the activity
  description: {
    type: String,
    required: [true, VALIDATION.ACTIVITY_LOG.DESCRIPTION_REQUIRED],
    trim: true,
    maxlength: [1000, VALIDATION.ACTIVITY_LOG.DESCRIPTION_MAX_LENGTH]
  },
  
  // Additional metadata about the activity
  metadata: {
    // For file activities
    fileName: String,
    fileSize: Number,
    fileType: String,
    
    // For payment activities
    amount: Number,
    currency: String,
    paymentMethod: String,
    transactionId: String,
    
    // For project activities
    oldStatus: String,
    newStatus: String,
    oldPriority: String,
    newPriority: String,
    
    // For description activities
    descriptionIndex: Number,
    descriptionLength: Number,
    
    // For milestone activities
    milestoneTitle: String,
    milestoneAmount: Number,
    
    // For user activities
    userRole: String,
    userEmail: String,
    
    // For admin activities
    adminAction: String,
    freelancerName: String,
    
    // Generic metadata
    additionalData: mongoose.Schema.Types.Mixed
  },
  
  // IP address from which the action was performed
  ipAddress: {
    type: String,
    required: false
  },
  
  // User agent string
  userAgent: {
    type: String,
    required: false
  },
  
  // Severity level of the activity
  severity: {
    type: String,
    enum: SEVERITY_LEVEL_ARRAY,
    default: SEVERITY_LEVEL.MEDIUM
  },
  
  // Whether this activity should be visible to the client
  visibleToClient: {
    type: Boolean,
    default: true
  },
  
  // Whether this activity should be visible to admin
  visibleToAdmin: {
    type: Boolean,
    default: true
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Reference to related entities
  references: {
    // Related notification
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    },
    
    // Related milestone
    milestone: {
      type: mongoose.Schema.Types.ObjectId
    },
    
    // Related file
    file: {
      type: mongoose.Schema.Types.ObjectId
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ activityType: 1, createdAt: -1 });
activityLogSchema.index({ visibleToClient: 1, createdAt: -1 });
activityLogSchema.index({ visibleToAdmin: 1, createdAt: -1 });

// Virtual for formatted date
activityLogSchema.virtual('formattedDate').get(function() {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(this.createdAt);
});

// Ensure virtual fields are serialized
activityLogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
