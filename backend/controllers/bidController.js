const Bid = require('../models/Bid');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const socketService = require('../services/socketService');
const { validationResult } = require('express-validator');
const { processAttachments } = require('../utils/attachmentStorage');
const { createAuditLog } = require('../utils/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/auditMessages');

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
    // Handle both regular JSON and multipart form data
    let bidData;
    if (req.body.bidData) {
      // Multipart form data (with files)
      bidData = JSON.parse(req.body.bidData);
    } else {
      // Regular JSON data
      bidData = req.body;
    }

    const { projectId, bidAmount, timeline, description, attachments, notes } = bidData;
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

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: AUDIT_ACTIONS.BID_PLACED,
        metadata: {
          projectId,
          projectTitle: project.title,
          bidAmount,
          bidId: bid._id
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log bid submission audit:', auditError);
    }

    // Create notifications for bid submission
    try {
      await NotificationService.notifyBidCreated(
        projectId,
        bid._id.toString(),
        bidderId,
        bidAmount,
        req.user
      );

      // Notify stakeholders that a bid was received (client/admin/superadmin/assigned agent)
      await NotificationService.notifyBidReceived(
        projectId,
        bid._id.toString(),
        bidderId,
        bidAmount,
        req.user
      );
    } catch (notificationError) {
      console.error('Failed to create bid notifications:', notificationError);
    }

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'bid',
        action: 'created',
        bidId: bid._id?.toString?.() || bid.id,
        projectId: bid.projectId?.toString?.() || bid.projectId,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

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

    // Agents should only see bids for projects assigned to them
    if (req.user?.role === 'agent') {
      const assignedProjectIds = await Project.find({ assignedAgentId: req.user.id }).distinct('_id');
      query.projectId = { $in: assignedProjectIds };
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
    const bid = await Bid.findById(bidId)
      .populate('projectId')
      .populate('bidderId', 'name email avatar')
      .populate('clientId', 'name email phone company');
    console.log(bid);
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Agents can only access bids for projects assigned to them
    if (req.user?.role === 'agent') {
      const project = bid.projectId;
      const assignedAgentId = project?.assignedAgentId?.toString?.() || project?.assignedAgentId;
      if (!assignedAgentId || assignedAgentId.toString() !== req.user.id) {
        return sendResponse(res, false, null, 'Access denied', 403);
      }
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

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: status === 'accepted' ? AUDIT_ACTIONS.BID_ACCEPTED : (status === 'rejected' ? AUDIT_ACTIONS.BID_REJECTED : AUDIT_ACTIONS.BID_PLACED), // Reusing BID_PLACED for generic updates if needed
        targetUser: { _id: bid.bidderId, name: bid.bidderName, email: bid.bidderEmail },
        metadata: {
          projectId: bid.projectId,
          projectTitle: bid.projectTitle,
          bidId: bid._id,
          status
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log bid status update audit:', auditError);
    }

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'bid',
        action: 'status_updated',
        bidId: bid._id?.toString?.() || bidId,
        projectId: bid.projectId?.toString?.() || bid.projectId,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

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
    
    // Handle both regular JSON and multipart form data
    let updates;
    if (req.body.bidData) {
      // Multipart form data (with files)
      updates = JSON.parse(req.body.bidData);
    } else {
      // Regular JSON data
      updates = req.body;
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Check if user owns this bid or is admin
    if (bid.bidderId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, false, null, 'Not authorized to edit this bid', 403);
    }

    // Get the project to check its status
    const project = await Project.findById(bid.projectId);
    if (!project) {
      return sendResponse(res, false, null, 'Associated project not found', 404);
    }

    // Allow editing only if project status is 'in_bidding'
    if (project.status !== 'in_bidding') {
      return sendResponse(res, false, null, `Cannot edit bid: project status must be 'in_bidding'. Current status: ${project.status}`, 400);
    }

    // Don't allow status changes through this endpoint (use updateBidStatus instead)
    const allowedUpdates = ['bidAmount', 'timeline', 'description', 'attachments', 'notes'];
    const actualUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        actualUpdates[key] = updates[key];
      }
    }

    // Process attachments if files are uploaded
    console.log('Files received:', req.files);
    console.log('Updates.attachments:', updates.attachments);
    console.log('Existing attachments:', bid.attachments);
    
    if (req.files && req.files.length > 0) {
      const processedAttachments = processAttachments(req.files, updates.attachments);
      // Merge new attachments with existing ones
      const existingAttachments = bid.attachments || [];
      actualUpdates.attachments = [...existingAttachments, ...processedAttachments];
      console.log('Merged attachments:', actualUpdates.attachments);
    } else if (updates.attachments !== undefined) {
      // Handle case where attachments are explicitly updated (e.g., removed)
      actualUpdates.attachments = updates.attachments;
    }

    const updatedBid = await Bid.findByIdAndUpdate(bidId, actualUpdates, { new: true });

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: AUDIT_ACTIONS.BID_PLACED, // Reusing BID_PLACED as "Bid Updated" isn't specifically defined but fits
        metadata: {
          projectId: bid.projectId,
          projectTitle: bid.projectTitle,
          bidId: bid._id,
          isUpdate: true
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log bid update audit:', auditError);
    }

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'bid',
        action: 'updated',
        bidId: updatedBid?._id?.toString?.() || bidId,
        projectId: updatedBid?.projectId?.toString?.() || updatedBid?.projectId,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    sendResponse(res, true, updatedBid, 'Bid updated successfully');
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
    // Allow admins to delete any bid, others can only delete pending bids
    if (bid.status !== 'pending' && !['admin', 'superadmin'].includes(req.user.role)) {
      return sendResponse(res, false, null, 'Cannot delete bid in current status', 400);
    }

    await Bid.findByIdAndDelete(bidId);

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'bid',
        action: 'deleted',
        bidId,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

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

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'bid',
        action: 'shortlist_updated',
        bidId: bid._id?.toString?.() || id,
        projectId: bid.projectId?.toString?.() || bid.projectId,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
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

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'bid',
        action: 'acceptance_updated',
        bidId: bid._id?.toString?.() || id,
        projectId: bid.projectId?.toString?.() || bid.projectId,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: isAccepted ? AUDIT_ACTIONS.BID_ACCEPTED : AUDIT_ACTIONS.BID_PLACED,
        targetUser: { _id: bid.bidderId, name: bid.bidderName, email: bid.bidderEmail },
        metadata: {
          projectId: bid.projectId,
          projectTitle: bid.projectTitle,
          bidId: bid._id,
          isAccepted
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log bid acceptance audit:', auditError);
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

    // Trigger dashboard refresh for all connected clients
    try {
      socketService.emitDashboardRefresh({
        entity: 'bid',
        action: 'decline_updated',
        bidId: bid._id?.toString?.() || id,
        projectId: bid.projectId?.toString?.() || bid.projectId,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    // Add Audit Log
    try {
      await createAuditLog({
        performedBy: req.user,
        action: isDeclined ? AUDIT_ACTIONS.BID_REJECTED : AUDIT_ACTIONS.BID_PLACED,
        targetUser: { _id: bid.bidderId, name: bid.bidderName, email: bid.bidderEmail },
        metadata: {
          projectId: bid.projectId,
          projectTitle: bid.projectTitle,
          bidId: bid._id,
          isDeclined
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log bid decline audit:', auditError);
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
