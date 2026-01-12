const express = require('express');
const router = express.Router();
const {
  submitBidding,
  getAllBiddings,
  getBiddingsByAdminBid,
  getBiddingsByFreelancer,
  getBiddingDetails,
  updateBiddingStatus,
  updateBidding,
  deleteBidding,
  undoWithdrawal,
  getBiddingStats,
  updateShortlistStatus,
  updateAcceptanceStatus,
  updateDeclineStatus,
  getShortlistedProposals
} = require('../controllers/biddingController');
const { protect: auth } = require('../middleware/auth');
const { uploadFiles } = require('../middleware/upload');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateBiddingSubmission = [
  body('adminBidId').notEmpty().withMessage('Admin bid ID is required').isMongoId().withMessage('Invalid Admin bid ID'),
  body('bidAmount').notEmpty().withMessage('Bid amount is required').isFloat({ gt: 0 }).withMessage('Bid amount must be a positive number'),
  body('timeline').notEmpty().withMessage('Timeline is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
];

const validateBiddingId = [
  param('biddingId').notEmpty().withMessage('Bidding ID is required').isMongoId().withMessage('Invalid Bidding ID'),
];

const validateBiddingUpdate = [
  ...validateBiddingId,
  body('bidAmount').optional().isFloat({ gt: 0 }).withMessage('Bid amount must be a positive number'),
  body('timeline').optional().trim(),
  body('description').optional().trim(),
];

const validateBiddingStatus = [
  ...validateBiddingId,
  body('status').notEmpty().withMessage('Status is required').isIn(['accepted', 'rejected', 'withdrawn']).withMessage('Invalid bidding status'),
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  query('status').optional().isIn(['pending', 'accepted', 'rejected', 'withdrawn']).withMessage('Invalid status filter'),
  query('sortBy').optional().isIn(['submittedAt', 'bidAmount']).withMessage('Invalid sortBy field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder'),
];

// @route   POST /api/bidding
// @desc    Submit a freelancer bid on admin's bid
// @access  Private
router.post('/', auth, uploadFiles, validateBiddingSubmission, submitBidding);

// @route   GET /api/bidding
// @desc    Get all biddings (Admin only)
// @access  Private (Admin)
router.get('/', auth, validatePagination, getAllBiddings);

// @route   GET /api/bidding/stats
// @desc    Get bidding statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', auth, getBiddingStats);

// @route   GET /api/bidding/admin-bid/:adminBidId
// @desc    Get all biddings for a specific admin bid
// @access  Private (Admin bid owner or Admin)
router.get('/admin-bid/:adminBidId', auth, param('adminBidId').isMongoId().withMessage('Invalid Admin bid ID'), getBiddingsByAdminBid);

// @route   GET /api/bidding/freelancer/:freelancerId
// @desc    Get all biddings by a specific freelancer
// @access  Private (Freelancer's own biddings or Admin)
router.get('/freelancer/:freelancerId', auth, param('freelancerId').isMongoId().withMessage('Invalid Freelancer ID'), getBiddingsByFreelancer);

// @route   GET /api/bidding/:biddingId
// @desc    Get details of a specific bidding
// @access  Private (Bidder, Admin bid owner or Admin)
router.get('/:biddingId', auth, validateBiddingId, getBiddingDetails);

// @route   PUT /api/bidding/:biddingId/status
// @desc    Update bidding status (e.g., accept, reject, withdraw)
// @access  Private (Admin bid owner or Admin)
router.put('/:biddingId/status', auth, validateBiddingStatus, updateBiddingStatus);

// @route   PUT /api/bidding/:biddingId
// @desc    Update a bidding (only if status is pending)
// @access  Private (Bidder only)
router.put('/:biddingId', auth, uploadFiles, validateBiddingUpdate, updateBidding);

// @route   GET /api/bidding/project/:projectId/shortlisted
// @desc    Get shortlisted proposals for a project
// @access  Private (Admin or Super Admin)
router.get('/project/:projectId/shortlisted', auth, param('projectId').isMongoId().withMessage('Invalid Project ID'), getShortlistedProposals);

// @route   PATCH /api/bidding/:biddingId/shortlist
// @desc    Update proposal shortlist status
// @access  Private (Admin or Super Admin)
router.patch('/:biddingId/shortlist', auth, validateBiddingId, [
  body('isShortlisted')
    .isBoolean()
    .withMessage('isShortlisted must be a boolean value')
], updateShortlistStatus);

// @route   PATCH /api/bidding/:biddingId/accept
// @desc    Update proposal acceptance status
// @access  Private (Admin or Super Admin)
router.patch('/:biddingId/accept', auth, validateBiddingId, [
  body('isAccepted')
    .isBoolean()
    .withMessage('isAccepted must be a boolean value')
], updateAcceptanceStatus);

// @route   PATCH /api/bidding/:biddingId/decline
// @desc    Update proposal decline status
// @access  Private (Admin or Super Admin)
router.patch('/:biddingId/decline', auth, validateBiddingId, [
  body('isDeclined')
    .isBoolean()
    .withMessage('isDeclined must be a boolean value')
], updateDeclineStatus);

// @route   DELETE /api/bidding/:biddingId
// @desc    Delete/Withdraw a bidding (only if status is pending)
// @access  Private (Bidder only)
router.delete('/:biddingId', auth, validateBiddingId, deleteBidding);

// @route   PUT /api/bidding/:biddingId/undo-withdrawal
// @desc    Undo withdrawal - Restore a withdrawn bidding to pending status
// @access  Private (Bidder only)
router.put('/:biddingId/undo-withdrawal', auth, validateBiddingId, undoWithdrawal);

module.exports = router;
