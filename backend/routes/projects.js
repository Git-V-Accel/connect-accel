const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadFiles } = require('../middleware/upload');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  releaseFunds,
  addMilestone,
  requestPayment,
  markPaymentProcessing,
  markPaymentFailed,
  cancelPayment,
  updateMilestoneStatus,
  updateMilestone,
  addAdditionalDescription,
  deleteAdditionalDescription,
  markProjectForBidding,
  requestConsultation
} = require('../controllers/projectController');
const {
  getProjectNotes,
  addProjectNote,
  updateProjectNote,
  deleteProjectNote
} = require('../controllers/projectNoteController');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', getProjects);

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', getProject);

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Client only)
router.post('/', uploadFiles, createProject);

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', uploadFiles, updateProject);

// @desc    Update project (PATCH for partial updates)
// @route   PATCH /api/projects/:id
// @access  Private
router.patch('/:id', uploadFiles, updateProject);

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', deleteProject);

// @desc    Release funds for milestone
// @route   PUT /api/projects/:id/milestones/:milestoneId/release
// @access  Private (Client only)
router.put('/:id/milestones/:milestoneId/release', releaseFunds);

// @desc    Add milestone to project
// @route   POST /api/projects/:id/milestones
// @access  Private (Admin or Client owner)
router.post('/:id/milestones', addMilestone);

// @desc    Request payment for a milestone
// @route   PUT /api/projects/:id/milestones/:milestoneId/request-payment
// @access  Private (Admin only)
router.put('/:id/milestones/:milestoneId/request-payment', requestPayment);

// @desc    Mark milestone payment as processing
// @route   PUT /api/projects/:id/milestones/:milestoneId/processing
// @access  Private (Admin only)
router.put('/:id/milestones/:milestoneId/processing', markPaymentProcessing);

// @desc    Mark milestone payment as failed
// @route   PUT /api/projects/:id/milestones/:milestoneId/failed
// @access  Private (Admin only)
router.put('/:id/milestones/:milestoneId/failed', markPaymentFailed);

// @desc    Cancel milestone payment
// @route   PUT /api/projects/:id/milestones/:milestoneId/cancel
// @access  Private (Admin only)
router.put('/:id/milestones/:milestoneId/cancel', cancelPayment);

// @desc    Update milestone status
// @route   PUT /api/projects/:id/milestones/:milestoneId/status
// @access  Private (Admin only)
router.put('/:id/milestones/:milestoneId/status', updateMilestoneStatus);

// @desc    Update milestone fields
// @route   PUT /api/projects/:id/milestones/:milestoneId
// @access  Private (Admin only)
router.put('/:id/milestones/:milestoneId', updateMilestone);

// @desc    Add additional description to project
// @route   POST /api/projects/:id/descriptions
// @access  Private
router.post('/:id/descriptions', addAdditionalDescription);

// @desc    Delete additional description from project
// @route   DELETE /api/projects/:id/descriptions/:index
// @access  Private
router.delete('/:id/descriptions/:index', deleteAdditionalDescription);

// @desc    Mark project as open for bidding
// @route   PUT /api/projects/:id/bidding
// @access  Private (Admin only)
router.put('/:id/bidding', markProjectForBidding);

// @desc    Request consultation (notify all admins)
// @route   POST /api/projects/consultation
// @access  Private (Client only)
router.post('/consultation', requestConsultation);

// @desc    Get all notes for a project
// @route   GET /api/projects/:id/notes
// @access  Private (Admin and Freelancer only)
router.get('/:id/notes', getProjectNotes);

// @desc    Add a note to a project
// @route   POST /api/projects/:id/notes
// @access  Private (Admin and Freelancer only)
router.post('/:id/notes', addProjectNote);

// @desc    Update a project note
// @route   PUT /api/projects/:id/notes/:noteId
// @access  Private (Admin and Freelancer only)
router.put('/:id/notes/:noteId', updateProjectNote);

// @desc    Delete a project note
// @route   DELETE /api/projects/:id/notes/:noteId
// @access  Private (Admin and Freelancer only)
router.delete('/:id/notes/:noteId', deleteProjectNote);

module.exports = router;
