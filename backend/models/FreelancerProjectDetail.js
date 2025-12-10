const mongoose = require('mongoose');

const freelancerProjectDetailSchema = new mongoose.Schema({
  // Reference to the project
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: false // Explicitly disable - we have compound indexes below
  },
  
  // Reference to the freelancer bidding
  freelancerBiddingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidding',
    required: false,
    default: null
  },
  
  // Admin-managed details
  adminNotes: {
    type: String,
    default: ''
  },
  
  // Bid details that admin can modify
  bidDetails: {
    bidAmount: {
      type: Number,
      min: 0
    },
    timeline: {
      type: String
    },
    description: {
      type: String
    },
    notes: {
      type: String
    }
  },
  
  // Milestones managed by admin
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    dueDate: {
      type: Date
    },
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'hold'],
      default: 'pending'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Attachments managed by admin
  attachments: [{
    name: {
      type: String,
      required: false
    },
    originalName: {
      type: String,
      required: false
    },
    size: {
      type: Number,
      required: false
    },
    compressedSize: {
      type: Number,
      required: false
    },
    type: {
      type: String,
      required: false
    },
    url: {
      type: String,
      required: false
    },
    isCompressed: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Progress tracking
  progress: {
    completedMilestones: {
      type: Number,
      default: 0
    },
    totalMilestones: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Last updated by admin
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'in_progress', 'completed', 'hold', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// Compound index covers queries on projectId alone (MongoDB can use prefix of compound index)
freelancerProjectDetailSchema.index({ projectId: 1, freelancerBiddingId: 1 });
// Single field index not needed - compound index above covers it

module.exports = mongoose.model('FreelancerProjectDetail', freelancerProjectDetailSchema);

