const mongoose = require('mongoose');

const ConsultationRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    clientCompany: {
      type: String,
      trim: true,
    },
    projectTitle: {
      type: String,
      trim: true,
    },
    projectDescription: {
      type: String,
      trim: true,
    },
    projectBudget: {
      type: String,
      trim: true,
    },
    projectTimeline: {
      type: String,
      trim: true,
    },
    projectCategory: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    meetingNotes: {
      type: String,
      trim: true,
    },
    outcome: {
      type: String,
      trim: true,
    },
    actionItems: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConsultationRequest', ConsultationRequestSchema);

