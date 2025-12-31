const mongoose = require('mongoose');
const { MESSAGES, NOTIFICATION_TYPES_ARRAY } = require('../constants');
const { VALIDATION } = MESSAGES;

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, VALIDATION.NOTIFICATION.USER_REQUIRED]
  },
  type: {
    type: String,
    required: [true, VALIDATION.NOTIFICATION.TYPE_REQUIRED]
  },
  title: {
    type: String,
    required: [true, VALIDATION.NOTIFICATION.TITLE_REQUIRED],
    trim: true,
    maxlength: [100, VALIDATION.NOTIFICATION.TITLE_MAX_LENGTH]
  },
  message: {
    type: String,
    required: [true, VALIDATION.NOTIFICATION.MESSAGE_REQUIRED],
    trim: true,
    maxlength: [500, VALIDATION.NOTIFICATION.MESSAGE_MAX_LENGTH]
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
    index: false // Explicitly disable auto-indexing to avoid duplicate with compound index
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
