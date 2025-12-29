const mongoose = require('mongoose');
const { MESSAGES, MILESTONE_STATUS_ARRAY, PAYMENT_STATUS_ARRAY, PROJECT_PRIORITY_ARRAY, PROJECT_STATUS_ARRAY, MILESTONE_STATUS, PAYMENT_STATUS, PROJECT_PRIORITY, PROJECT_STATUS, PROJECT_TYPE } = require('../constants');
const { VALIDATION } = MESSAGES;

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, VALIDATION.MILESTONE.TITLE_REQUIRED],
    trim: true,
    maxlength: [100, VALIDATION.MILESTONE.TITLE_MAX_LENGTH]
  },
  description: {
    type: String,
    required: [true, VALIDATION.MILESTONE.DESCRIPTION_REQUIRED],
    trim: true,
  },
  dueDate: {
    type: Date,
    required: [true, VALIDATION.MILESTONE.DUE_DATE_REQUIRED]
  },
  status: {
    type: String,
    enum: MILESTONE_STATUS_ARRAY,
    default: MILESTONE_STATUS.ACTIVE
  },
  amount: {
    type: Number,
    required: [true, VALIDATION.MILESTONE.AMOUNT_REQUIRED],
    min: [0, VALIDATION.MILESTONE.AMOUNT_MIN]
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUS_ARRAY,
    default: PAYMENT_STATUS.NOT_REQUESTED
  },
  paymentRequestedAt: { type: Date, default: null },
  paymentProcessedAt: { type: Date, default: null },
  completedAt: Date,
  notes: String
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, VALIDATION.PROJECT.TITLE_REQUIRED],
    trim: true,
    maxlength: [100, VALIDATION.PROJECT.TITLE_MAX_LENGTH]
  },
  clientTitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, VALIDATION.PROJECT.DESCRIPTION_REQUIRED],
    trim: true,
  },
  additionalDescriptions: [{
    description: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  budget: {
    type: Number,
    required: [true, VALIDATION.PROJECT.BUDGET_REQUIRED],
    min: [0, VALIDATION.PROJECT.BUDGET_MIN]
  },
  isNegotiableBudget: {
    type: Boolean,
    default: false
  },
  timeline: {
    type: String,
    required: [true, VALIDATION.PROJECT.TIMELINE_REQUIRED],
    trim: true
  },
  category: {
    type: String,
    required: [true, VALIDATION.PROJECT.CATEGORY_REQUIRED],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: PROJECT_PRIORITY_ARRAY,
    default: PROJECT_PRIORITY.MEDIUM
  },
  status: {
    type: String,
    enum: PROJECT_STATUS_ARRAY,
    default: PROJECT_STATUS.DRAFT
  },
  project_type: {
    type: String,
    enum: Object.values(PROJECT_TYPE),
    default: PROJECT_TYPE.FROM_SCRATCH_PROJECT
  },
  statusRemarks: {
    type: String,
    trim: true,
    default: null
  },
  isOpenForBidding: {
    type: Boolean,
    default: false
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, VALIDATION.PROJECT.CLIENT_REQUIRED]
  },
  assignedFreelancer: {
    type: String,
    default: null
  },
  assignedFreelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  milestones: [milestoneSchema],
  attachments: [{
    name: { type: String, required: false },
    originalName: { type: String, required: false },
    size: { type: Number, required: false }, // Original file size
    compressedSize: { type: Number, required: false }, // Compressed file size
    type: { type: String, required: false },
    url: { type: String, required: false },
    isCompressed: { type: Boolean, default: false }, // Whether file is compressed
    uploadedAt: { type: Date, default: Date.now }
  }],
  adminNotes: String,
  completedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ client: 1, status: 1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ assignedFreelancerId: 1, status: 1 });
projectSchema.index({ assignedAgentId: 1, status: 1 });
projectSchema.index({ isOpenForBidding: 1, status: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ client: 1, createdAt: -1 });

projectSchema.pre('save', function(next) {
  if (this.isNew && !this.clientTitle) {
    this.clientTitle = this.title;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
