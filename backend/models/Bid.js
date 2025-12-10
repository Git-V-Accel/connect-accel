const mongoose = require('mongoose');
const { MESSAGES, BID_STATUS_ARRAY, SOURCE_TYPE_ARRAY, BID_STATUS, SOURCE_TYPE } = require('../constants');
const { VALIDATION } = MESSAGES;

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: [true, VALIDATION.BID.ATTACHMENT_NAME_REQUIRED] },
  url: { type: String, required: [true, VALIDATION.BID.ATTACHMENT_URL_REQUIRED] },
  size: { type: Number, required: [true, VALIDATION.BID.ATTACHMENT_SIZE_REQUIRED] },
  type: { type: String, required: [true, VALIDATION.BID.ATTACHMENT_TYPE_REQUIRED] },
  uploadedAt: { type: Date, default: Date.now }
});

const bidSchema = new mongoose.Schema({
  // Project Information
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: [true, VALIDATION.BID.PROJECT_ID_REQUIRED]
  },
  projectTitle: { 
    type: String, 
    required: [true, VALIDATION.BID.PROJECT_TITLE_REQUIRED]
  },
  
  // Bidder Information
  bidderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, VALIDATION.BID.BIDDER_ID_REQUIRED]
  },
  bidderName: { 
    type: String, 
    required: [true, VALIDATION.BID.BIDDER_NAME_REQUIRED]
  },
  bidderEmail: { 
    type: String, 
    required: [true, VALIDATION.BID.BIDDER_EMAIL_REQUIRED]
  },
  
  // Bid Details
  bidAmount: { 
    type: Number, 
    required: [true, VALIDATION.BID.BID_AMOUNT_REQUIRED],
    min: 0
  },
  timeline: { 
    type: String, 
    required: [true, VALIDATION.BID.TIMELINE_REQUIRED]
  },
  description: { 
    type: String, 
    required: [true, VALIDATION.BID.DESCRIPTION_REQUIRED]
  },
  
  // Attachments
  attachments: [attachmentSchema],
  
  // Additional Information
  notes: { 
    type: String, 
    default: '' 
  },
  
  // Status Management
  status: { 
    type: String, 
    enum: BID_STATUS_ARRAY, 
    default: BID_STATUS.PENDING
  },
  
  // Admin Management
  isShortlisted: { 
    type: Boolean, 
    default: false 
  },
  isAccepted: { 
    type: Boolean, 
    default: false 
  },
  isDeclined: { 
    type: Boolean, 
    default: false 
  },
  
  // Client Information (for reference)
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  clientName: { 
    type: String 
  },
  
  // Timestamps
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date 
  },
  
  // Review Information
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewNotes: { 
    type: String 
  },
  
  // Additional Metadata
  isLocal: { 
    type: Boolean, 
    default: false 
  },
  source: { 
    type: String, 
    enum: SOURCE_TYPE_ARRAY, 
    default: SOURCE_TYPE.WEB
  }
}, {
  timestamps: true
});

// Indexes for better performance
bidSchema.index({ projectId: 1, status: 1 });
bidSchema.index({ bidderId: 1, status: 1 });
bidSchema.index({ submittedAt: -1 });
bidSchema.index({ status: 1, submittedAt: -1 });
bidSchema.index({ projectId: 1, isShortlisted: 1 });
bidSchema.index({ projectId: 1, isAccepted: 1 });
bidSchema.index({ projectId: 1, isDeclined: 1 });

// Virtual for formatted bid amount
bidSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(this.bidAmount);
});

// Virtual for time since submission
bidSchema.virtual('timeSinceSubmission').get(function() {
  const now = new Date();
  const diffInMs = now - this.submittedAt;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
});

// Pre-save middleware to update updatedAt
bidSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to update reviewedAt when status changes
bidSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewedAt = new Date();
  }
  next();
});

// Static method to get bids by project
bidSchema.statics.getBidsByProject = function(projectId, options = {}) {
  const query = { projectId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('bidderId', 'name email avatar')
    .populate('reviewedBy', 'name email')
    .sort({ submittedAt: -1 });
};

// Static method to get bids by user
bidSchema.statics.getBidsByUser = function(bidderId, options = {}) {
  const query = { bidderId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('projectId', 'title description budget timeline status')
    .populate('clientId', 'name email')
    .sort({ submittedAt: -1 });
};

// Static method to get bid statistics
bidSchema.statics.getBidStats = function(filters = {}) {
  const matchStage = {};
  
  if (filters.projectId) matchStage.projectId = filters.projectId;
  if (filters.bidderId) matchStage.bidderId = filters.bidderId;
  if (filters.status) matchStage.status = filters.status;
  if (filters.dateFrom) matchStage.submittedAt = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) {
    matchStage.submittedAt = { 
      ...matchStage.submittedAt, 
      $lte: new Date(filters.dateTo) 
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$bidAmount' },
        avgAmount: { $avg: '$bidAmount' }
      }
    }
  ]);
};

// Instance method to check if bid can be withdrawn
bidSchema.methods.canWithdraw = function() {
  return this.status === 'pending';
};

// Instance method to check if bid can be updated
bidSchema.methods.canUpdate = function() {
  return this.status === 'pending';
};

// Instance method to format bid for API response
bidSchema.methods.toApiResponse = function() {
  const bid = this.toObject();
  bid.formattedAmount = this.formattedAmount;
  bid.timeSinceSubmission = this.timeSinceSubmission;
  bid.canWithdraw = this.canWithdraw();
  bid.canUpdate = this.canUpdate();
  return bid;
};

module.exports = mongoose.model('Bid', bidSchema);
