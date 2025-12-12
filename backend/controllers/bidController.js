const Bid = require('../models/Bid');
const Project = require('../models/Project');
const User = require('../models/User');
const Bidding = require('../models/Bidding');
const DeletionRemark = require('../models/DeletionRemark');
const ActivityLogger = require('../services/activityLogger');
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
const handleError = (res, error, message = 'An error occurred') => {
  console.error('Bid Controller Error:', error);
  sendResponse(res, false, null, message, 500);
};

// @desc    Submit a new bid
// @route   POST /api/bids
// @access  Private (Authenticated users)
const submitBid = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return detailed validation feedback to aid debugging
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
      });
    }

    const {
      projectId,
      projectTitle, // Accept edited project title from request
      bidAmount,
      timeline,
      description,
      attachments = [],
      notes = ''
    } = req.body;

    const bidderId = req.user.id;

    // Only Admin/Superadmin/Agent can post the "admin bid" for a project
    // Freelancers submit proposals via /api/bidding (not /api/bids)
    const canCreateProjectBid = ['admin', 'superadmin', 'agent'].includes(req.user.role);
    if (!canCreateProjectBid) {
      return sendResponse(res, false, null, 'Access denied. Only admin, superadmin, or agent can create project bids.', 403);
    }

    // Verify project exists and is available for bidding
    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, false, null, 'Project not found', 404);
    }

    // Enforce: each project can have ONLY ONE posted bid (by admin/superadmin/assigned agent)
    const existingProjectBid = await Bid.findOne({ projectId }).select('_id bidderId status');
    if (existingProjectBid) {
      return sendResponse(
        res,
        false,
        { bidId: existingProjectBid._id },
        'A bid has already been posted for this project. You cannot create another bid for the same project.',
        400
      );
    }

    // Check if project is still open for bidding
    if (project.status === 'completed' || project.status === 'closed' || project.assignedFreelancer) {
      return sendResponse(res, false, null, 'Project is no longer available for bidding', 400);
    }

    // Get bidder information
    const bidder = await User.findById(bidderId);
    if (!bidder) {
      return sendResponse(res, false, null, 'Bidder not found', 404);
    }

    // Get client information
    const client = await User.findById(project.client);
    if (!client) {
      return sendResponse(res, false, null, 'Client not found', 404);
    }

    // Validate bid amount
    const bidAmountNum = parseFloat(bidAmount);
    if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
      return sendResponse(res, false, null, 'Please enter a valid bid amount', 400);
    }

    // Validate bid amount doesn't exceed client budget
    if (bidAmountNum > project.budget) {
      return sendResponse(res, false, null, `Bid amount (${bidAmountNum.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}) cannot exceed client budget (${project.budget.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })})`, 400);
    }

    // Validate timeline is provided
    if (!timeline || timeline.trim() === '') {
      return sendResponse(res, false, null, 'Please provide a proposed timeline', 400);
    }

    // Use edited project title if provided, otherwise use project's original title
    const finalProjectTitle = projectTitle && projectTitle.trim() !== '' 
      ? projectTitle.trim() 
      : project.title;

    // Update project title in database if it was edited
    if (projectTitle && projectTitle.trim() !== '' && projectTitle.trim() !== project.title) {
      await Project.findByIdAndUpdate(projectId, {
        title: finalProjectTitle
      });
      console.log(`Project title updated from "${project.title}" to "${finalProjectTitle}"`);
    }

    // Create new bid
    const processedAttachments = processAttachments(req.files, attachments);
    if (req.body.attachments) {
      delete req.body.attachments;
    }

    const bidData = {
      projectId,
      projectTitle: finalProjectTitle, // Use the edited or original title
      bidderId,
      bidderName: bidder.name,
      bidderEmail: bidder.email,
      bidAmount: bidAmountNum,
      timeline,
      description,
      attachments: processedAttachments,
      notes,
      clientId: project.client,
      clientName: client.name,
      status: 'pending'
    };

    const bid = new Bid(bidData);
    await bid.save();

    // Populate the bid for response
    await bid.populate([
      { path: 'projectId', select: 'title description budget timeline status' },
      { path: 'bidderId', select: 'name email avatar' },
      { path: 'clientId', select: 'name email' }
    ]);

    sendResponse(res, true, bid.toApiResponse(), 'Bid submitted successfully', 201);
  } catch (error) {
    handleError(res, error, 'Failed to submit bid');
  }
};

// @desc    Get all bids (Admin only)
// @route   GET /api/bids
// @access  Private (Admin)
const getAllBids = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      projectId,
      bidderId,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (projectId) filter.projectId = projectId;
    if (bidderId) filter.bidderId = bidderId;

    // For agents, filter bids to only show bids for projects assigned to them
    if (req.user.role === 'agent') {
      const assignedProjects = await Project.find({ assignedAgentId: req.user.id }).select('_id');
      const assignedProjectIds = assignedProjects.map(p => p._id);
      filter.projectId = { $in: assignedProjectIds };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bids with pagination
    let bids = await Bid.find(filter)
      .populate({
        path: 'projectId',
        select: 'title description budget timeline status client assignedFreelancer assignedFreelancerId',
        populate: { path: 'assignedFreelancerId', select: 'name email userID' }
      })
      .populate('bidderId', 'name email avatar userID role')
      .populate('clientId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Backfill legacy records for all-bids listing
    const isObjectIdStringAll = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
    bids = await Promise.all(
      bids.map(async (bid) => {
        const proj = bid.projectId;
        if (proj && !proj.assignedFreelancerId && isObjectIdStringAll(proj.assignedFreelancer)) {
          try {
            const u = await User.findById(proj.assignedFreelancer).select('name email userID');
            if (u) {
              proj.assignedFreelancerId = u;
            }
          } catch (e) {
            console.error('Backfill assignedFreelancerId failed:', e?.message || e);
          }
        }
        return bid;
      })
    );

    // Get total count for pagination
    const total = await Bid.countDocuments(filter);

    // Format response
    const formattedBids = bids.map(bid => bid.toApiResponse());

    sendResponse(res, true, {
      bids: formattedBids,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBids: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    }, 'Bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bids');
  }
};

// @desc    Get bids for a specific project
// @route   GET /api/bids/project/:projectId
// @access  Private (Project owner or Admin)
const getProjectBids = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, false, null, 'Project not found', 404);
    }

    // Check if user has permission to view bids
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isProjectOwner = project.client.toString() === req.user.id;
    const isAssignedAgent = req.user.role === 'agent' && project.assignedAgentId && project.assignedAgentId.toString() === req.user.id;
    
    if (!isAdmin && !isProjectOwner && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Unauthorized to view project bids', 403);
    }

    // Build filter
    const filter = { projectId };
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let bids = await Bid.find(filter)
      .populate('bidderId', 'name email avatar rating completedProjects userID role')
      .populate('reviewedBy', 'name email')
      .populate({
        path: 'projectId',
        select: 'title description budget timeline status client assignedFreelancer assignedFreelancerId',
        populate: { path: 'assignedFreelancerId', select: 'name email userID' }
      })
      .sort(sort);

    // Backfill legacy records where only project.assignedFreelancer (ObjectId string) exists
    const isObjectIdString = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
    bids = await Promise.all(
      bids.map(async (bid) => {
        const proj = bid.projectId;
        if (proj && !proj.assignedFreelancerId && isObjectIdString(proj.assignedFreelancer)) {
          try {
            const u = await User.findById(proj.assignedFreelancer).select('name email userID');
            if (u) {
              // attach enriched user (not persisted) so API consumers can read name/userID
              proj.assignedFreelancerId = u;
            }
          } catch (e) {
            console.error('Backfill assignedFreelancerId failed:', e?.message || e);
          }
        }
        return bid;
      })
    );

    const formattedBids = bids.map(bid => bid.toApiResponse());

    sendResponse(res, true, formattedBids, 'Project bids retrieved successfully');
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
    const { status, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

    // Check if user has permission to view these bids
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isOwnBids = userId === req.user.id;
    // Agents can view bids for users if they have assigned projects
    const isAgent = req.user.role === 'agent';
    
    if (!isAdmin && !isOwnBids && !isAgent) {
      return sendResponse(res, false, null, 'Unauthorized to view user bids', 403);
    }

    // Build filter
    const filter = { bidderId: userId };
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let bids = await Bid.find(filter)
      .populate({
        path: 'projectId',
        select: 'title description budget timeline status client assignedFreelancer assignedFreelancerId',
        populate: { path: 'assignedFreelancerId', select: 'name email userID' }
      })
      .populate('clientId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort(sort);

    // Backfill legacy records where only project.assignedFreelancer (ObjectId string) exists
    const isObjectIdString2 = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
    bids = await Promise.all(
      bids.map(async (bid) => {
        const proj = bid.projectId;
        if (proj && !proj.assignedFreelancerId && isObjectIdString2(proj.assignedFreelancer)) {
          try {
            const u = await User.findById(proj.assignedFreelancer).select('name email userID');
            if (u) {
              proj.assignedFreelancerId = u;
            }
          } catch (e) {
            console.error('Backfill assignedFreelancerId failed:', e?.message || e);
          }
        }
        return bid;
      })
    );

    const formattedBids = bids.map(bid => bid.toApiResponse());

    sendResponse(res, true, formattedBids, 'User bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve user bids');
  }
};

// @desc    Get bid details
// @route   GET /api/bids/:bidId
// @access  Private (Bid owner, Project owner, or Admin)
const getBidDetails = async (req, res) => {
  try {
    const { bidId } = req.params;

    let bid = await Bid.findById(bidId)
      .populate('bidderId', 'name email avatar rating completedProjects userID role')
      .populate('clientId', 'name email')
      .populate('reviewedBy', 'name email')
      .populate({
        path: 'projectId',
        select: 'title description budget timeline status client assignedFreelancer assignedFreelancerId',
        populate: { path: 'assignedFreelancerId', select: 'name email userID' }
      });

    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Check if user has permission to view this bid
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isBidOwner = bid.bidderId._id.toString() === req.user.id;

    let isProjectOwner = false;
    let isAssignedAgent = false;
    if (!isAdmin && !isBidOwner) {
      const project = await Project.findById(bid.projectId);
      if (project) {
        if (project.client.toString() === req.user.id) {
          isProjectOwner = true;
        }
        // Check if agent is assigned to this project
        if (req.user.role === 'agent' && project.assignedAgentId && project.assignedAgentId.toString() === req.user.id) {
          isAssignedAgent = true;
        }
      }
    }

    let canAccess = isAdmin || isBidOwner || isProjectOwner || isAssignedAgent;

    // Allow freelancers to view open admin bids so they can submit proposals
    if (!canAccess && req.user.role === 'freelancer') {
      const project = bid.projectId && bid.projectId.client ? bid.projectId : await Project.findById(bid.projectId);
      const projectStatus = project?.status;
      const isProjectOpenForBidding = project?.isOpenForBidding !== false && ['pending', 'active', 'in_progress'].includes(projectStatus);
      if (bid.status === 'pending' && isProjectOpenForBidding) {
        canAccess = true;
      } else {
        // As a fallback, allow if freelancer already submitted a bidding proposal for this admin bid
        const existingBidding = await Bidding.findOne({
          adminBidId: bid._id,
          freelancerId: req.user.id,
          status: { $ne: 'withdrawn' },
        }).select('_id');
        if (existingBidding) {
          canAccess = true;
        }
      }
    }

    if (!canAccess) {
      return sendResponse(res, false, null, 'Unauthorized to view bid details', 403);
    }

    // Backfill single bid details if necessary
    const proj = bid?.projectId;
    if (proj && !proj.assignedFreelancerId && typeof proj.assignedFreelancer === 'string' && /^[a-f\d]{24}$/i.test(proj.assignedFreelancer)) {
      try {
        const u = await User.findById(proj.assignedFreelancer).select('name email userID');
        if (u) {
          proj.assignedFreelancerId = u;
        }
      } catch (e) {
        console.error('Backfill assignedFreelancerId failed:', e?.message || e);
      }
    }

    sendResponse(res, true, bid.toApiResponse(), 'Bid details retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bid details');
  }
};

// @desc    Update bid status (Accept/Reject)
// @route   PUT /api/bids/:bidId/status
// @access  Private (Project owner or Admin)
const updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status, reviewNotes } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return sendResponse(res, false, null, 'Invalid status. Must be "accepted" or "rejected"', 400);
    }

    const bid = await Bid.findById(bidId)
      .populate('projectId')
      .populate('bidderId', 'name email role');

    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Check if user has permission to update bid status
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isProjectOwner = bid.projectId.client.toString() === req.user.id;
    const isAssignedAgent = req.user.role === 'agent' && bid.projectId.assignedAgentId && bid.projectId.assignedAgentId.toString() === req.user.id;
    
    if (!isAdmin && !isProjectOwner && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Unauthorized to update bid status', 403);
    }

    // Check if bid can be updated
    if (bid.status !== 'pending') {
      return sendResponse(res, false, null, 'Bid status cannot be changed', 400);
    }

    // Update bid status
    bid.status = status;
    bid.reviewedBy = req.user.id;
    bid.reviewNotes = reviewNotes || '';
    bid.reviewedAt = new Date();

    await bid.save();

    // If bid is accepted, update project
    if (status === 'accepted') {
      await Project.findByIdAndUpdate(bid.projectId._id, {
        assignedFreelancer: bid.bidderId.name,
        assignedFreelancerId: bid.bidderId._id,
        status: 'active'
      });

      // Reject all other pending bids for this project
      await Bid.updateMany(
        { 
          projectId: bid.projectId._id, 
          _id: { $ne: bidId }, 
          status: 'pending' 
        },
        { 
          status: 'rejected',
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          reviewNotes: 'Project assigned to another freelancer'
        }
      );
    }

    // Populate updated bid
    await bid.populate([
      { path: 'projectId', select: 'title description budget timeline status' },
      { path: 'bidderId', select: 'name email avatar' },
      { path: 'reviewedBy', select: 'name email' }
    ]);

    sendResponse(res, true, bid.toApiResponse(), `Bid ${status} successfully`);
  } catch (error) {
    handleError(res, error, 'Failed to update bid status');
  }
};

// @desc    Update bid details
// @route   PUT /api/bids/:bidId
// @access  Private (Bid owner only)
const updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { bidAmount, timeline, description, notes } = req.body;

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Check if user is the bid owner
    if (bid.bidderId.toString() !== req.user.id) {
      return sendResponse(res, false, null, 'Unauthorized to update this bid', 403);
    }

    // Check if bid can be updated
    if (!bid.canUpdate()) {
      return sendResponse(res, false, null, 'Bid cannot be updated', 400);
    }

    // Update bid
    if (bidAmount !== undefined) bid.bidAmount = parseFloat(bidAmount);
    if (timeline !== undefined) bid.timeline = timeline;
    if (description !== undefined) bid.description = description;
    if (notes !== undefined) bid.notes = notes;

    const hasAttachmentPayload = req.body.attachments !== undefined;
    const processedAttachments = processAttachments(req.files, req.body.attachments);
    if (req.body.attachments !== undefined) {
      delete req.body.attachments;
    }

    if (hasAttachmentPayload) {
      bid.attachments = processedAttachments;
    } else if (processedAttachments && processedAttachments.length > 0) {
      bid.attachments = [...(bid.attachments || []), ...processedAttachments];
    }

    await bid.save();

    // Populate updated bid
    await bid.populate([
      { path: 'projectId', select: 'title description budget timeline status' },
      { path: 'bidderId', select: 'name email avatar' }
    ]);

    sendResponse(res, true, bid.toApiResponse(), 'Bid updated successfully');
  } catch (error) {
    handleError(res, error, 'Failed to update bid');
  }
};

// @desc    Delete/Withdraw a bid
// @route   DELETE /api/bids/:bidId
// @access  Private (Bid owner OR Admin/Superadmin)
const deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const reasonRaw = req.body?.reason;
    const reason = typeof reasonRaw === 'string' ? reasonRaw.trim() : '';

    const bid = await Bid.findById(bidId).populate('projectId', 'title');

    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isOwner = bid.bidderId.toString() === req.user.id;
    const isAssignedAgent = req.user.role === 'agent' && bid.projectId.assignedAgentId && bid.projectId.assignedAgentId.toString() === req.user.id;
    
    if (!isAdmin && !isOwner && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Unauthorized to delete this bid', 403);
    }

    // Require deletion reason for admin/superadmin/agent deletes (tracked)
    if ((isAdmin || isAssignedAgent) && !reason) {
      return sendResponse(res, false, null, 'Deletion reason is required', 400);
    }

    // Owners can only withdraw if pending; Admin/Superadmin can delete regardless of status
    if (!isAdmin && !bid.canWithdraw()) {
      return sendResponse(res, false, null, 'Bid cannot be withdrawn', 400);
    }

    // Track deletion remark + activity log for admin/superadmin/agent deletes
    if (isAdmin || isAssignedAgent) {
      try {
        await DeletionRemark.create({
          entityType: 'bid',
          entityId: bid._id,
          projectId: bid.projectId?._id || undefined,
          reason,
          deletedBy: req.user.id,
          deletedByRole: req.user.role,
          metadata: {
            bidId: bid._id,
            projectId: bid.projectId?._id,
            projectTitle: bid.projectId?.title,
            bidderId: bid.bidderId,
          },
        });
      } catch (e) {
        console.error('Failed to store deletion remark:', e?.message || e);
      }

      try {
        await ActivityLogger.logBidDeleted(bid.projectId?._id || null, req.user.id, bid._id, reason, req);
      } catch (e) {
        console.error('Failed to log bid deletion activity:', e?.message || e);
      }
    }

    await Bid.findByIdAndDelete(bidId);

    sendResponse(res, true, null, isAdmin ? 'Bid deleted successfully' : 'Bid withdrawn successfully');
  } catch (error) {
    handleError(res, error, 'Failed to withdraw bid');
  }
};

// @desc    Get bid statistics
// @route   GET /api/bids/stats
// @access  Private (Admin)
const getBidStats = async (req, res) => {
  try {
    const { projectId, bidderId, dateFrom, dateTo } = req.query;

    const filters = {};
    if (projectId) filters.projectId = projectId;
    if (bidderId) filters.bidderId = bidderId;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const stats = await Bid.getBidStats(filters);

    // Get additional statistics
    const totalBids = await Bid.countDocuments();
    const pendingBids = await Bid.countDocuments({ status: 'pending' });
    const acceptedBids = await Bid.countDocuments({ status: 'accepted' });
    const rejectedBids = await Bid.countDocuments({ status: 'rejected' });

    sendResponse(res, true, {
      statusBreakdown: stats,
      totals: {
        totalBids,
        pendingBids,
        acceptedBids,
        rejectedBids
      }
    }, 'Bid statistics retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bid statistics');
  }
};

// @desc    Get available admin bids for freelancers
// @route   GET /api/bids/available
// @access  Private (Freelancer)
const getAvailableAdminBids = async (req, res) => {
  try {
    // Only freelancers can access this endpoint
    if (req.user.role !== 'freelancer') {
      return sendResponse(res, false, null, 'Access denied. This endpoint is for freelancers only.', 403);
    }

    const {
      page = 1,
      limit = 10,
      status = 'pending', // Only show pending bids by default
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only show pending admin bids
    const filter = {
      status: status,
      // Only show bids that are open for freelancer bidding
    };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bids with pagination
    const bids = await Bid.find(filter)
      .populate('projectId', 'title description budget timeline status')
      .populate('bidderId', 'name email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Bid.countDocuments(filter);

    // Remove sensitive information (client details) for freelancers
    const sanitizedBids = bids.map(bid => {
      const bidObj = bid.toObject();
      // Remove client information to maintain privacy
      delete bidObj.clientId;
      delete bidObj.clientName;
      return bidObj;
    });

    const response = {
      bids: sanitizedBids,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    };

    sendResponse(res, true, response, 'Available admin bids retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve available admin bids');
  }
};

// @desc    Update proposal shortlist status
// @route   PATCH /api/bids/:id/shortlist
// @access  Private (Admin, Super Admin, or Assigned Agent)
const updateShortlistStatus = async (req, res) => {
  try {
    const id = req.params.id || req.params.bidId;
    const { isShortlisted } = req.body;

    const bid = await Bid.findById(id).populate('projectId', 'assignedAgentId');
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Check if user is admin, superadmin, or assigned agent
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isAssignedAgent = req.user.role === 'agent' && bid.projectId.assignedAgentId && bid.projectId.assignedAgentId.toString() === req.user.id;
    
    if (!isAdmin && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Access denied. Admin, Super Admin, or Assigned Agent role required.', 403);
    }

    // Update shortlist status
    bid.isShortlisted = isShortlisted;
    await bid.save();

    sendResponse(res, true, { 
      bidId: bid._id, 
      isShortlisted: bid.isShortlisted 
    }, `Proposal ${isShortlisted ? 'shortlisted' : 'removed from shortlist'} successfully`);

    // Send email notification to freelancer when shortlisted
    try {
      if (isShortlisted) {
        const { sendShortlistedEmail } = require('../services/emailService');
        // Ensure bidder and project info loaded
        const populatedBid = await Bid.findById(id)
          .populate('bidderId', 'name email role')
          .populate('projectId', 'title');
        if (populatedBid?.bidderId?.email) {
          await sendShortlistedEmail({
            to: populatedBid.bidderId.email,
            freelancerName: populatedBid.bidderId.name,
            projectTitle: populatedBid.projectId?.title || populatedBid.projectTitle || 'Project',
          });
        } else {
          console.warn('Cannot send shortlisted email: bidder email not found for bid', id);
        }
      }
    } catch (mailErr) {
      console.error('Shortlist email failed:', mailErr?.message || mailErr);
    }

  } catch (error) {
    handleError(res, error, 'Failed to update shortlist status');
  }
};

// @desc    Update proposal acceptance status
// @route   PATCH /api/bids/:id/accept
// @access  Private (Admin, Super Admin, or Assigned Agent)
const updateAcceptanceStatus = async (req, res) => {
  try {
    const id = req.params.id || req.params.bidId;
    const { isAccepted } = req.body;

    const bid = await Bid.findById(id).populate('projectId', 'assignedAgentId').populate('bidderId', 'name email');
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Check if user is admin, superadmin, or assigned agent
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isAssignedAgent = req.user.role === 'agent' && bid.projectId.assignedAgentId && bid.projectId.assignedAgentId.toString() === req.user.id;
    
    if (!isAdmin && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Access denied. Admin, Super Admin, or Assigned Agent role required.', 403);
    }

    // Update acceptance status
    bid.isAccepted = isAccepted;
    if (isAccepted) {
      bid.status = 'accepted';
      bid.isDeclined = false; // Remove from declined if accepting
    } else {
      bid.status = 'pending'; // Reset to pending if unaccepting
    }
    
    await bid.save();

    // If accepted, assign freelancer to project and log activity
    if (isAccepted) {
      if (bid.projectId) {
        await Project.findByIdAndUpdate(bid.projectId._id, {
          assignedFreelancer: bid.bidderId.name,
          assignedFreelancerId: bid.bidderId._id,
          status: 'active'
        });

        // Log assignment activity (best-effort)
        try {
          await ActivityLogger.logFreelancerAssigned(bid.projectId._id, req.user.id, bid.bidderId.name, req);
        } catch (e) {
          console.error('Failed to log freelancer assignment activity:', e);
        }

        // Emit realtime update (best-effort)
        try {
          socketService.emitProjectUpdate(bid.projectId._id, 'freelancer-assigned', {
            freelancerName: bid.bidderId.name,
            freelancerId: bid.bidderId._id
          });
        } catch (e) {
          console.error('Failed to emit freelancer-assigned event:', e);
        }

        // Send email to accepted freelancer
        try {
          const { sendAcceptedEmail, sendNotSelectedEmail } = require('../services/emailService');
          if (bid.bidderId?.email) {
            await sendAcceptedEmail({
              to: bid.bidderId.email,
              freelancerName: bid.bidderId.name,
              projectTitle: bid.projectId.title,
            });
          }

          // Notify other freelancers (not selected)
          const otherBids = await Bid.find({
            projectId: bid.projectId._id,
            _id: { $ne: id },
          }).populate('bidderId', 'name email');
          for (const ob of otherBids) {
            if (ob?.bidderId?.email) {
              await sendNotSelectedEmail({
                to: ob.bidderId.email,
                freelancerName: ob.bidderId.name,
                projectTitle: bid.projectId.title,
              });
            }
          }
        } catch (mailErr) {
          console.error('Acceptance email dispatch failed:', mailErr?.message || mailErr);
        }
      }
    }

    sendResponse(res, true, { 
      bidId: bid._id, 
      isAccepted: bid.isAccepted,
      status: bid.status
    }, `Proposal ${isAccepted ? 'accepted' : 'unaccepted'} successfully`);

  } catch (error) {
    handleError(res, error, 'Failed to update acceptance status');
  }
};

// @desc    Update proposal decline status
// @route   PATCH /api/bids/:id/decline
// @access  Private (Admin, Super Admin, or Assigned Agent)
const updateDeclineStatus = async (req, res) => {
  try {
    const id = req.params.id || req.params.bidId;
    const { isDeclined } = req.body;

    const bid = await Bid.findById(id).populate('projectId', 'assignedAgentId');
    if (!bid) {
      return sendResponse(res, false, null, 'Bid not found', 404);
    }

    // Check if user is admin, superadmin, or assigned agent
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isAssignedAgent = req.user.role === 'agent' && bid.projectId.assignedAgentId && bid.projectId.assignedAgentId.toString() === req.user.id;
    
    if (!isAdmin && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Access denied. Admin, Super Admin, or Assigned Agent role required.', 403);
    }

    // Update decline status
    bid.isDeclined = isDeclined;
    if (isDeclined) {
      bid.status = 'rejected';
      bid.isAccepted = false; // Remove from accepted if declining
    } else {
      bid.status = 'pending'; // Reset to pending if un-declining
    }
    
    await bid.save();

    sendResponse(res, true, { 
      bidId: bid._id, 
      isDeclined: bid.isDeclined,
      status: bid.status
    }, `Proposal ${isDeclined ? 'declined' : 'un-declined'} successfully`);

  } catch (error) {
    handleError(res, error, 'Failed to update decline status');
  }
};

// @desc    Get shortlisted proposals for a project
// @route   GET /api/bids/project/:projectId/shortlisted
// @access  Private (Admin, Super Admin, or Assigned Agent)
const getShortlistedProposals = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and check if user has access
    const project = await Project.findById(projectId).select('assignedAgentId');
    if (!project) {
      return sendResponse(res, false, null, 'Project not found', 404);
    }

    // Check if user is admin, superadmin, or assigned agent
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isAssignedAgent = req.user.role === 'agent' && project.assignedAgentId && project.assignedAgentId.toString() === req.user.id;
    
    if (!isAdmin && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Access denied. Admin, Super Admin, or Assigned Agent role required.', 403);
    }

    const shortlistedBids = await Bid.find({ 
      projectId, 
      isShortlisted: true 
    })
    .populate('bidderId', 'name email avatar')
    .sort({ submittedAt: -1 });

    sendResponse(res, true, shortlistedBids, 'Shortlisted proposals retrieved successfully');

  } catch (error) {
    handleError(res, error, 'Failed to retrieve shortlisted proposals');
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
