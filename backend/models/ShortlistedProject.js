const mongoose = require('mongoose');
const { Schema } = mongoose;

const shortlistedProjectSchema = new Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  adminBidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: true
  },
  shortlistedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
shortlistedProjectSchema.index({ freelancerId: 1, shortlistedAt: -1 });
shortlistedProjectSchema.index({ projectId: 1 });
shortlistedProjectSchema.index({ adminBidId: 1 });

module.exports = mongoose.model('ShortlistedProject', shortlistedProjectSchema);
