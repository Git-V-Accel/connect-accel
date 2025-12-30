const Bid = require('../models/Bid');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const socketService = require('../services/socketService');
const { validationResult } = require('express-validator');
const { processAttachments } = require('../utils/attachmentStorage');

// Helper function to handle API responses
const sendResponse = (res, success, data = null, message = '', statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message
  });
};

// Helper function to handle errors
const handleError = (res, error, message = 'Internal server error') => {
  console.error(message, error);
  sendResponse(res, false, null, message, 500);
};

// @desc    Submit a new bid
// @route   POST /api/bids
// @access  Private
const submitBid = async (req, res) => {
  try {
    const { projectId, bidAmount, timeline, description, attachments, notes } = req.body;
    const bidderId = req.user.id;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, false, null, 'Project not found', 404);
    }

    // Check if user is the client of the project (cannot bid on own project)
    if (project.client.toString() === bidderId) {
      return sendResponse(res, false, null, 'Cannot bid on your own project', 400);
    }

    // Check for existing bid
    const existingBid = await Bid.findOne({ projectId, bidderId, status: { $ne: 'withdrawn' } });
    if (existingBid) {
      return sendResponse(res, false, null, 'You have already submitted a bid for this project', 400);
    }

    const bidder = await User.findById(bidderId);

    // Process attachments
    const processedAttachments = processAttachments(req.files, attachments);

    // Create new bid
    const bid = new Bid({
      projectId,
      projectTitle: project.title,
      bidderId,
      bidderName: bidder.name,
      bidderEmail: bidder.email,
      bidAmount: parseFloat(bidAmount),
      timeline,
      description,
      attachments: processedAttachments,
      notes,
      status: 'pending',
      clientId: project.client, // Assuming project has client field
      clientName: project.clientTitle || 'Client' // Fallback
    });

    await bid.save();

    // Notify client
    // Implementation of notification logic here (omitted for brevity but placeholder good practice)

    sendResponse(res, true, bid, 'Bid submitted successfully', 201);
  } catch (error) {
    handleError(res, error, 'Failed to submit bid');
  }
};

const getAllBids = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // If user is agent, only show bids for projects assigned to them
    if (req.user.role === 'agent') {
      const projects = await Project.find({ assignedAgentId: req.user.id }).select('_id');
      const projectIds = projects.map(p => p._id);
      query.projectId = { $in: projectIds };
    }

    const total = await Bid.countDocuments(query);
    const bids = await Bid.find(query)
      .populate('projectId')
      .populate('bidderId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    sendResponse(res, true, {
      bids,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    }, 'Bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bids');
  }
};

// @desc    Get available admin bids for freelancers
// @route   GET /api/bids/available
// @access  Private (Freelancer)
const getAvailableAdminBids = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const query = { status: 'pending' };

    const total = await Bid.countDocuments(query);
    const bids = await Bid.find(query)
      .populate('projectId')
      .populate('bidderId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    sendResponse(res, true, {
      bids,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    }, 'Available bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve available bids');
  }
};

// @desc    Get bids for a specific project
// @route   GET /api/bids/project/:projectId
// @access  Private (Project owner or Admin)
const getProjectBids = async (req, res) => {
  try {
    const { projectId } = req.params;
    const bids = await Bid.getBidsByProject(projectId);
    sendResponse(res, true, bids, 'Project bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve project bids');
  }
};

// @desc    Get bids by a specific user
// @route   GET /api/bids/user/:userId
// @access  Private (User's own bids or Admin)
const getUserBids = async (req, res) => {
  try {
    const { userId } = req.params;
    const bids = await Bid.getBidsByUser(userId);
    sendResponse(res, true, bids, 'User bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve user bids');
  }
};

// @desc    Get bid details
// @route   GET /api/bids/:bidId
// @access  Private
const getBidDetails = async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId).populate('projectId').populate('bidderId');
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }
    sendResponse(res, true, bid, 'Bid details retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bid details');
  }
};

// @desc    Update bid status
// @route   PUT /api/bids/:bidId/status
// @access  Private
const updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status, reviewNotes } = req.body;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    bid.status = status;
    if (reviewNotes) bid.reviewNotes = reviewNotes;
    bid.reviewedBy = req.user.id;

    await bid.save();

    sendResponse(res, true, bid, 'Bid status updated successfully');
  } catch (error) {
    handleError(res, error, 'Failed to update bid status');
  }
};

// @desc    Update bid
// @route   PUT /api/bids/:bidId
// @access  Private
const updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const updates = req.body;

    const bid = await Bid.findByIdAndUpdate(bidId, updates, { new: true });
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    sendResponse(res, true, bid, 'Bid updated successfully');
  } catch (error) {
    handleError(res, error, 'Failed to update bid');
  }
};

// @desc    Delete bid
// @route   DELETE /api/bids/:bidId
// @access  Private
const deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    // Check if reason is provided, for logging/withdraw logic

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Instead of hard delete, maybe withdraw? 
    // But route says DELETE. Let's do hard delete for now or check status.
    // If pending, allow delete.
    if (bid.status !== 'pending' && req.user.role !== 'admin') {
      return sendResponse(res, false, null, 'Cannot delete bid in current status', 400);
    }

    await Bid.findByIdAndDelete(bidId);

    sendResponse(res, true, null, 'Bid deleted successfully');
  } catch (error) {
    handleError(res, error, 'Failed to delete bid');
  }
};

// @desc    Get bid stats
// @route   GET /api/bids/stats
// @access  Private
const getBidStats = async (req, res) => {
  try {
    const stats = await Bid.getBidStats(req.query);
    sendResponse(res, true, stats, 'Bid stats retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bid stats');
  }
};

// @desc    Update proposal shortlist status
// @route   PATCH /api/bids/:id/shortlist
// @access  Private
const updateShortlistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isShortlisted } = req.body;

    const bid = await Bid.findByIdAndUpdate(id, { isShortlisted }, { new: true });
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    sendResponse(res, true, bid, 'Bid shortlist status updated');
  } catch (error) {
    handleError(res, error, 'Failed to update shortlist status');
  }
};

// @desc    Update proposal acceptance status
// @route   PATCH /api/bids/:id/accept
// @access  Private
const updateAcceptanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAccepted } = req.body;

    const bid = await Bid.findByIdAndUpdate(id, { isAccepted }, { new: true });
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    sendResponse(res, true, bid, 'Bid acceptance status updated');
  } catch (error) {
    handleError(res, error, 'Failed to update acceptance status');
  }
};

// @desc    Update proposal decline status
// @route   PATCH /api/bids/:id/decline
// @access  Private
const updateDeclineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDeclined } = req.body;

    const bid = await Bid.findByIdAndUpdate(id, { isDeclined }, { new: true });
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    sendResponse(res, true, bid, 'Bid decline status updated');
  } catch (error) {
    handleError(res, error, 'Failed to update decline status');
  }
};

// @desc    Get shortlisted proposals for a project
// @route   GET /api/bids/project/:projectId/shortlisted
// @access  Private
const getShortlistedProposals = async (req, res) => {
  try {
    const { projectId } = req.params;
    const bids = await Bid.find({ projectId, isShortlisted: true }).populate('bidderId');
    sendResponse(res, true, bids, 'Shortlisted bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve shortlisted bids');
  }
};

module.exports = {
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
};
