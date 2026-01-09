const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const { body, param } = require('express-validator');
const {
  addToShortlist,
  removeFromShortlist,
  getShortlistedProjects,
  checkShortlistStatus
} = require('../controllers/shortlistedProjectController');

// Validation middleware
const validateShortlistInput = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required'),
  body('adminBidId')
    .notEmpty()
    .withMessage('Admin Bid ID is required')
];

const validateProjectId = [
  param('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
];

// @route   POST /api/shortlisted-projects
// @desc    Add project to freelancer's shortlist
// @access  Private (Freelancer only)
router.post('/', auth, validateShortlistInput, addToShortlist);

// @route   DELETE /api/shortlisted-projects/:projectId
// @desc    Remove project from freelancer's shortlist
// @access  Private (Freelancer only)
router.delete('/:projectId', auth, validateProjectId, removeFromShortlist);

// @route   GET /api/shortlisted-projects
// @desc    Get freelancer's shortlisted projects
// @access  Private (Freelancer only)
router.get('/', auth, getShortlistedProjects);

// @route   GET /api/shortlisted-projects/check/:projectId
// @desc    Check if project is shortlisted
// @access  Private (Freelancer only)
router.get('/check/:projectId', auth, validateProjectId, checkShortlistStatus);

module.exports = router;
