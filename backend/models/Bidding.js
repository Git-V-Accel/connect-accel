const mongoose = require('mongoose');
const { MESSAGES, BID_STATUS_ARRAY, BID_STATUS } = require('../constants');
const { VALIDATION } = MESSAGES;

const attachmentSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  originalName: { type: String, trim: true },
  fileName: { type: String, trim: true },
  url: { type: String, trim: true },
  fileUrl: { type: String, trim: true },
  path: { type: String, trim: true },
  size: { type: Number },
  fileSize: { type: Number },
  compressedSize: { type: Number },
  type: { type: String, trim: true },
  fileType: { type: String, trim: true },
  isCompressed: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
});

const biddingSchema = new mongoose.Schema({
  // Reference to the admin's bid
  adminBidId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bid', 
    required: [true, VALIDATION.BIDDING.ADMIN_BID_ID_REQUIRED]
  },
  
  // Project information (copied from admin bid for reference)
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: [true, VALIDATION.BIDDING.PROJECT_ID_REQUIRED]
  },
  projectTitle: { 
    type: String, 
    required: [true, VALIDATION.BIDDING.PROJECT_TITLE_REQUIRED]
  },
  
  // Freelancer information
  freelancerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, VALIDATION.BIDDING.FREELANCER_ID_REQUIRED]
  },
  freelancerName: { 
    type: String, 
    required: [true, VALIDATION.BIDDING.FREELANCER_NAME_REQUIRED]
  },
  freelancerEmail: { 
    type: String, 
    required: [true, VALIDATION.BIDDING.FREELANCER_EMAIL_REQUIRED]
  },
  
  // Bidding details
  bidAmount: { 
    type: Number, 
    required: [true, VALIDATION.BIDDING.BID_AMOUNT_REQUIRED], 
    min: 0 
  },
  timeline: { 
    type: String, 
    required: [true, VALIDATION.BIDDING.TIMELINE_REQUIRED]
  },
  description: { 
    type: String, 
    required: [true, VALIDATION.BIDDING.DESCRIPTION_REQUIRED]
  },
  attachments: [attachmentSchema],
  notes: { 
    type: String 
  },
  
  // Status tracking
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
  
  // Timestamps
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Admin information (for reference, but not shown to freelancers)
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, VALIDATION.BIDDING.ADMIN_ID_REQUIRED]
  },
  adminName: { 
    type: String, 
    required: [true, VALIDATION.BIDDING.ADMIN_NAME_REQUIRED]
  },
  
  // Client information (for reference, but not shown to freelancers)
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, VALIDATION.BIDDING.CLIENT_ID_REQUIRED]
  },
  clientName: { 
    type: String, 
    required: [true, VALIDATION.BIDDING.CLIENT_NAME_REQUIRED]
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
biddingSchema.index({ adminBidId: 1, status: 1 });
biddingSchema.index({ freelancerId: 1, status: 1 });
biddingSchema.index({ projectId: 1, isShortlisted: 1 });
biddingSchema.index({ projectId: 1, isAccepted: 1 });
biddingSchema.index({ projectId: 1, isDeclined: 1 });
biddingSchema.index({ submittedAt: -1 });
biddingSchema.index({ freelancerId: 1, submittedAt: -1 });
biddingSchema.index({ adminBidId: 1, freelancerId: 1 });
biddingSchema.index({ status: 1, submittedAt: -1 });

// Virtual for formatted amount
biddingSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.bidAmount);
});

// Virtual for time since submission
biddingSchema.virtual('timeSinceSubmission').get(function() {
  const now = new Date();
  const diff = now - this.submittedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
});

// Static methods
biddingSchema.statics.getBiddingsByAdminBid = function(adminBidId) {
  return this.find({ adminBidId }).sort({ submittedAt: -1 });
};

biddingSchema.statics.getBiddingsByFreelancer = function(freelancerId) {
  return this.find({ freelancerId }).sort({ submittedAt: -1 });
};

biddingSchema.statics.getBiddingStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$bidAmount' }
      }
    }
  ]);
};

// Instance methods
biddingSchema.methods.canWithdraw = function() {
  return this.status === 'pending';
};

biddingSchema.methods.canUpdate = function() {
  return this.status === 'pending';
};

biddingSchema.methods.toApiResponse = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  obj.formattedAmount = this.formattedAmount;
  obj.timeSinceSubmission = this.timeSinceSubmission;
  obj.attachments = Array.isArray(obj.attachments)
    ? obj.attachments.map((attachment = {}) => {
        const baseName =
          attachment.originalName ||
          attachment.name ||
          attachment.fileName ||
          'attachment';
        const size =
          attachment.size ||
          attachment.fileSize ||
          attachment.compressedSize ||
          0;
        const url = attachment.url || attachment.fileUrl || '';
        const type =
          attachment.type ||
          attachment.fileType ||
          'application/octet-stream';
        return {
          ...attachment,
          name: attachment.name || baseName,
          originalName: attachment.originalName || baseName,
          fileName: attachment.fileName || attachment.name || baseName,
          url,
          fileUrl: attachment.fileUrl || url,
          size,
          fileSize: attachment.fileSize || size,
          compressedSize: attachment.compressedSize || size,
          type,
          fileType: attachment.fileType || type,
          uploadedAt: attachment.uploadedAt || new Date(),
        };
      })
    : [];
  return obj;
};

// Middleware to update reviewedAt when status changes
biddingSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Bidding', biddingSchema);
