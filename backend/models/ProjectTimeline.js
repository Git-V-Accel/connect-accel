const mongoose = require('mongoose');
const { PROJECT_STATUS_ARRAY, USER_ROLE_ARRAY } = require('../constants');

/**
 * ProjectTimeline Model
 * Tracks all status changes and key actions for projects
 */
const projectTimelineSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userRole: {
    type: String,
    enum: USER_ROLE_ARRAY,
    required: [true, 'User role is required']
  },
  oldStatus: {
    type: String,
    enum: PROJECT_STATUS_ARRAY,
    default: null
  },
  newStatus: {
    type: String,
    enum: PROJECT_STATUS_ARRAY,
    required: [true, 'New status is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  remark: {
    type: String,
    trim: true,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
projectTimelineSchema.index({ projectId: 1, timestamp: -1 });
projectTimelineSchema.index({ userId: 1, timestamp: -1 });

// Virtual for user details
projectTimelineSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
projectTimelineSchema.set('toJSON', { virtuals: true });
projectTimelineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProjectTimeline', projectTimelineSchema);

