const mongoose = require('mongoose');

const inHouseSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'on_hold'],
    default: 'pending'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
inHouseSchema.index({ project: 1, status: 1 });
inHouseSchema.index({ assignedAgentId: 1, status: 1 });
inHouseSchema.index({ status: 1, createdAt: -1 });
inHouseSchema.index({ assignedBy: 1, createdAt: -1 });

module.exports = mongoose.model('InHouse', inHouseSchema);
