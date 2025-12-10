const mongoose = require('mongoose');

const projectNoteSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  attachments: [{
    name: { type: String },
    originalName: { type: String },
    size: { type: Number },
    compressedSize: { type: Number },
    type: { type: String },
    url: { type: String },
    isCompressed: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
projectNoteSchema.index({ project: 1, createdAt: -1 });
projectNoteSchema.index({ createdBy: 1 });

module.exports = mongoose.model('ProjectNote', projectNoteSchema);

