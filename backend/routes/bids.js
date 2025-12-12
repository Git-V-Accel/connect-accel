const express = require('express');
const router = express.Router();
const {
  submitBid,
  getAllBids,
  getAvailableAdminBids,
  getProjectBids,
  getUserBids,
  getBidDetails,
  updateBidStatus,
  updateBid,
  deleteBid,
  getBidStats,
  updateShortlistStatus,
  updateAcceptanceStatus,
  updateDeclineStatus,
  getShortlistedProposals
} = require('../controllers/bidController');
const { protect: auth } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateBidSubmission = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('bidAmount')
    .isFloat({ min: 0 })
    .withMessage('Bid amount must be a positive number'),
  body('timeline')
    .notEmpty()
    .withMessage('Timeline is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Timeline must be between 1 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
   
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  body('attachments.*.name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Attachment name must be between 1 and 255 characters'),
  // Allow regular URLs or base64 data URLs (used by the app)
  body('attachments.*.url')
    .optional()
    .custom((value) => {
      if (typeof value !== 'string') return false;
      if (value.startsWith('data:')) return true; // accept data URLs
      // basic URL validation fallback
      try { new URL(value); return true; } catch { return false; }
    })
    .withMessage('Invalid attachment URL (must be a valid URL or data URL)'),
  body('attachments.*.size')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Attachment size must be a positive integer'),
  body('attachments.*.type')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Attachment type must be between 1 and 100 characters')
];

const validateBidUpdate = [
  body('bidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bid amount must be a positive number'),
  body('timeline')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Timeline must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

const validateStatusUpdate = [
  body('status')
    .isIn(['accepted', 'rejected'])
    .withMessage('Status must be either "accepted" or "rejected"'),
  body('reviewNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review notes must not exceed 500 characters')
];

const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`)
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('Invalid status filter'),
  query('sortBy')
    .optional()
    .isIn(['submittedAt', 'bidAmount', 'status', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"')
];

// @route   POST /api/bids
// @desc    Submit a new bid
// @access  Private
router.post('/', auth, validateBidSubmission, submitBid);

// @route   GET /api/bids
// @desc    Get all bids (Admin only)
// @access  Private (Admin)
router.get('/', auth, validatePagination, getAllBids);

// @route   GET /api/bids/available
// @desc    Get available admin bids for freelancers
// @access  Private (Freelancer)
router.get('/available', auth, validatePagination, getAvailableAdminBids);

// @route   GET /api/bids/stats
// @desc    Get bid statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', auth, getBidStats);

// @route   GET /api/bids/project/:projectId
// @desc    Get bids for a specific project
// @access  Private (Project owner or Admin)
router.get('/project/:projectId', auth, validateMongoId('projectId'), validatePagination, getProjectBids);

// @route   GET /api/bids/user/:userId
// @desc    Get bids by a specific user
// @access  Private (User's own bids or Admin)
router.get('/user/:userId', auth, validateMongoId('userId'), validatePagination, getUserBids);

// @route   GET /api/bids/:bidId
// @desc    Get bid details
// @access  Private (Bid owner, Project owner, or Admin)
router.get('/:bidId', auth, validateMongoId('bidId'), getBidDetails);

// @route   PUT /api/bids/:bidId/status
// @desc    Update bid status (Accept/Reject)
// @access  Private (Project owner or Admin)
router.put('/:bidId/status', auth, validateMongoId('bidId'), validateStatusUpdate, updateBidStatus);

// @route   PUT /api/bids/:bidId
// @desc    Update bid details
// @access  Private (Bid owner only)
router.put('/:bidId', auth, validateMongoId('bidId'), validateBidUpdate, updateBid);

// @route   DELETE /api/bids/:bidId
// @desc    Delete/Withdraw a bid
// @access  Private (Bid owner OR Admin/Superadmin)
router.delete('/:bidId', auth, validateMongoId('bidId'), [
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Deletion reason must be between 1 and 500 characters')
], deleteBid);

// @route   PATCH /api/bids/:id/shortlist
// @desc    Update proposal shortlist status
// @access  Private (Admin or Super Admin)
router.patch('/:id/shortlist', auth, validateMongoId('id'), [
  body('isShortlisted')
    .isBoolean()
    .withMessage('isShortlisted must be a boolean value')
], updateShortlistStatus);

// @route   PATCH /api/bids/:id/accept
// @desc    Update proposal acceptance status
// @access  Private (Admin or Super Admin)
router.patch('/:id/accept', auth, validateMongoId('id'), [
  body('isAccepted')
    .isBoolean()
    .withMessage('isAccepted must be a boolean value')
], updateAcceptanceStatus);

// @route   PATCH /api/bids/:id/decline
// @desc    Update proposal decline status
// @access  Private (Admin or Super Admin)
router.patch('/:id/decline', auth, validateMongoId('id'), [
  body('isDeclined')
    .isBoolean()
    .withMessage('isDeclined must be a boolean value')
], updateDeclineStatus);

// @route   GET /api/bids/project/:projectId/shortlisted
// @desc    Get shortlisted proposals for a project
// @access  Private (Admin or Super Admin)
router.get('/project/:projectId/shortlisted', auth, validateMongoId('projectId'), getShortlistedProposals);

module.exports = router;
