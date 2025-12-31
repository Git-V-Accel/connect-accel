const Bidding = require('../models/Bidding');
const Bid = require('../models/Bid');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const socketService = require('../services/socketService');
const { biddingAcceptedTemplate, biddingDeclinedTemplate } = require('../templates/emailTemplates');
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

// Helper function to create notification for freelancer
const createFreelancerNotification = async (freelancerId, type, title, message, projectId, metadata = {}) => {
  try {
    const notification = new Notification({
      user: freelancerId,
      type,
      title,
      message,
      projectId,
      metadata
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create freelancer notification:', error);
    return null;
  }
};

// Helper function to create notification for admin
const createAdminNotification = async (adminUserId, type, title, message, projectId, metadata = {}) => {
  try {
    const notification = new Notification({
      user: adminUserId,
      // Use a safe, schema-supported type
      type: 'system',
      title,
      message,
      projectId,
      metadata
    });
    await notification.save();
    return notification;
  } catch (error) {
      console.error('Failed to create admin notification:', error);
    return null;
  }
};

// Helper function to send email to freelancer
const sendFreelancerEmail = async (freelancerEmail, freelancerName, subject, message) => {
  try {
    await sendEmail({
      email: freelancerEmail,
      subject,
      message
    });
    console.log(`Email sent to freelancer ${freelancerEmail}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send email to freelancer:', error);
    return false;
  }
};

// @desc    Submit a freelancer bid on admin's bid
// @route   POST /api/bidding
// @access  Private
const submitBidding = async (req, res) => {
  try {
    const { adminBidId, bidAmount, timeline, description, attachments, notes } = req.body;
    const freelancerId = req.user.id;

    // Validate admin bid existence
    const adminBid = await Bid.findById(adminBidId);
    if (!adminBid) {
      return sendResponse(res, false, null, 'Admin bid not found', 404);
    }

    // Check if admin bid is still open for freelancer bidding
    if (adminBid.status !== 'pending') {
      return sendResponse(res, false, null, 'This admin bid is no longer open for freelancer bidding', 400);
    }

    // Check for duplicate bidding from the same freelancer on the same admin bid
    const existingBidding = await Bidding.findOne({ 
      adminBidId, 
      freelancerId, 
      status: { $ne: 'withdrawn' } 
    });
    if (existingBidding) {
      return sendResponse(res, false, null, 'You have already submitted a bid for this admin bid', 400);
    }

    // Get freelancer information
    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
      return sendResponse(res, false, null, 'Freelancer not found', 404);
    }

    // Get project information
    const project = await Project.findById(adminBid.projectId);
    if (!project) {
      return sendResponse(res, false, null, 'Project not found', 404);
    }

    // Get admin information
    const admin = await User.findById(adminBid.bidderId);
    if (!admin) {
      return sendResponse(res, false, null, 'Admin not found', 404);
    }

    // Get client information
    const client = await User.findById(project.client);
    if (!client) {
      return sendResponse(res, false, null, 'Client not found', 404);
    }

    // Create new bidding
    const processedAttachments = processAttachments(req.files, attachments);
    if (req.body.attachments) {
      delete req.body.attachments;
    }

    const biddingData = {
      adminBidId,
      projectId: adminBid.projectId,
      projectTitle: adminBid.projectTitle,
      freelancerId,
      freelancerName: freelancer.name,
      freelancerEmail: freelancer.email,
      bidAmount: parseFloat(bidAmount),
      timeline,
      description,
      attachments: processedAttachments,
      notes,
      status: 'pending',
      adminId: adminBid.bidderId,
      adminName: adminBid.bidderName,
      clientId: project.client,
      clientName: client.name
    };

    const bidding = new Bidding(biddingData);
    await bidding.save();

    // Notify the admin who posted the bid
    try {
      const adminUserId = adminBid.bidderId;
      const notification = await createAdminNotification(
        adminUserId,
        'system',
        'New Freelancer Bid Received',
        `${freelancer.name} submitted a bid for "${project.title}"`,
        project._id,
        {
          adminBidId: adminBid._id,
          biddingId: bidding._id,
          freelancerId,
          freelancerName: freelancer.name,
          bidAmount: bidding.bidAmount,
          timeline: bidding.timeline
        }
      );

      // Emit real-time notification
      if (notification) {
        try {
          socketService.emitNotification(String(adminUserId), {
            id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            projectId: notification.projectId,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            metadata: notification.metadata,
          });
        } catch (e) {
          console.error('Socket emit failed for admin notification:', e?.message || e);
        }
      }
    } catch (e) {
      console.error('Admin notification creation failed:', e?.message || e);
    }

    sendResponse(res, true, bidding.toApiResponse(), 'Bid submitted successfully', 201);
  } catch (error) {
    handleError(res, error, 'Failed to submit bid');
  }
};

// @desc    Get all biddings (Admin only)
// @route   GET /api/bidding
// @access  Private (Admin)
const getAllBiddings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'submittedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const { cursorPaginateWithCount } = require('../utils/pagination');
    const cursor = req.query.cursor || null;
    
    const result = await cursorPaginateWithCount(Bidding, query, {
      cursor: cursor,
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder },
      populate: [
        { path: 'adminBidId', select: 'bidAmount timeline description' },
        { path: 'projectId', select: 'title description' },
        { path: 'freelancerId', select: 'name email' }
      ],
      lean: false, // Need to call toApiResponse method
    });

    const response = {
      biddings: result.data.map(bidding => bidding.toApiResponse()),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      total: result.total
    };

    sendResponse(res, true, response, 'Biddings retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve biddings');
  }
};

// @desc    Get biddings for a specific admin bid
// @route   GET /api/bidding/admin-bid/:adminBidId
// @access  Private (Admin only)
const getBiddingsByAdminBid = async (req, res) => {
  try {
    const { adminBidId } = req.params;

    // Verify admin owns this bid or project is accessible
    const adminBid = await Bid.findById(adminBidId).populate({
      path: 'projectId',
      select: 'title description budget timeline status client assignedAgentId assignedFreelancerId assignedFreelancer'
    });
    if (!adminBid) {
      return sendResponse(res, false, null, 'Admin bid not found', 404);
    }

    const isAdminBidOwner = adminBid.bidderId.toString() === req.user.id;
    const isElevatedAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    let freelancerHasAccess = false;
    let agentHasAccess = false;

    const project = adminBid.projectId;
    
    // Check if agent is assigned to the project
    if (req.user.role === 'agent') {
      agentHasAccess = project?.assignedAgentId?.toString() === req.user.id;
    }

    // Agents must be assigned to the project to view biddings
    if (req.user.role === 'agent' && !agentHasAccess) {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    if (req.user.role === 'freelancer') {
      const isAssignedFreelancer = project?.assignedFreelancerId?.toString() === req.user.id
        || project?.assignedFreelancer?._id?.toString() === req.user.id;
      const isProjectOpen = ['pending', 'active', 'in_progress'].includes(project?.status);
      const existingBid = await Bidding.exists({ adminBidId, freelancerId: req.user.id });

      freelancerHasAccess = isAssignedFreelancer || isProjectOpen || !!existingBid;
    }

    if (!isAdminBidOwner && !isElevatedAdmin && !freelancerHasAccess && !agentHasAccess) {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    const biddings = await Bidding.find({ adminBidId })
      .populate('freelancerId', 'name email')
      .sort({ submittedAt: -1 });

    sendResponse(res, true, biddings.map(b => b.toApiResponse()), 'Biddings retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve biddings');
  }
};

// @desc    Get biddings by a specific freelancer
// @route   GET /api/bidding/freelancer/:freelancerId
// @access  Private (Freelancer's own biddings or Admin)
const getBiddingsByFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // Check if user can access these biddings
    if (req.user.id !== freelancerId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    const biddings = await Bidding.find({ freelancerId })
      .populate('adminBidId', 'bidAmount timeline description')
      .populate('projectId', 'title description')
      .sort({ submittedAt: -1 });

    sendResponse(res, true, biddings.map(b => b.toApiResponse()), 'Biddings retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve biddings');
  }
};

// @desc    Get details of a specific bidding
// @route   GET /api/bidding/:biddingId
// @access  Private (Bidder, Admin bid owner, or Admin)
const getBiddingDetails = async (req, res) => {
  try {
    const { biddingId } = req.params;

    const bidding = await Bidding.findById(biddingId)
      .populate('adminBidId')
      .populate({
        path: 'projectId',
        select: 'title description budget timeline status client assignedAgentId assignedFreelancerId assignedFreelancer'
      })
      .populate('freelancerId', 'name email');

    if (!bidding) {
      return sendResponse(res, false, null, 'Bidding not found', 404);
    }

    // Check access permissions
    const isBidder = bidding.freelancerId._id.toString() === req.user.id;
    const isAdminBidOwner = bidding.adminBidId.bidderId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    
    // Check if agent is assigned to the project
    let agentHasAccess = false;
    if (req.user.role === 'agent') {
      const project = bidding.projectId;
      agentHasAccess = project?.assignedAgentId?.toString() === req.user.id;
    }

    // Agents must be assigned to the project to view bidding details
    if (req.user.role === 'agent' && !agentHasAccess) {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    if (!isBidder && !isAdminBidOwner && !isAdmin && !agentHasAccess) {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    sendResponse(res, true, bidding.toApiResponse(), 'Bidding details retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bidding details');
  }
};

// @desc    Update bidding status (e.g., accept, reject, withdraw)
// @route   PUT /api/bidding/:biddingId/status
// @access  Private (Admin bid owner or Admin)
const updateBiddingStatus = async (req, res) => {
  try {
    const { biddingId } = req.params;
    const { status, notes } = req.body;

    const bidding = await Bidding.findById(biddingId);
    if (!bidding) {
      return sendResponse(res, false, null, 'Bidding not found', 404);
    }

    // Check if user can update this bidding status
    const adminBid = await Bid.findById(bidding.adminBidId);
    const isAdminBidOwner = adminBid.bidderId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isAdminBidOwner && !isAdmin) {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    // Update bidding status
    bidding.status = status;
    if (notes) {
      bidding.notes = notes;
    }
    bidding.reviewedBy = req.user.id;

    await bidding.save();

    sendResponse(res, true, bidding.toApiResponse(), 'Bidding status updated successfully');
  } catch (error) {
    handleError(res, error, 'Failed to update bidding status');
  }
};

// @desc    Update a bidding (only if status is pending)
// @route   PUT /api/bidding/:biddingId
// @access  Private (Bidder only)
const updateBidding = async (req, res) => {
  try {
    const { biddingId } = req.params;
    const { bidAmount, timeline, description, attachments, notes } = req.body;

    const bidding = await Bidding.findById(biddingId);
    if (!bidding) {
      return sendResponse(res, false, null, 'Bidding not found', 404);
    }

    // Check if user is the bidder
    if (bidding.freelancerId.toString() !== req.user.id) {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    // Check if bidding can be updated
    if (!bidding.canUpdate()) {
      return sendResponse(res, false, null, 'Bidding cannot be updated', 400);
    }

    // Update bidding fields
    if (bidAmount !== undefined) bidding.bidAmount = parseFloat(bidAmount);
    if (timeline !== undefined) bidding.timeline = timeline;
    if (description !== undefined) bidding.description = description;
    if (attachments !== undefined) bidding.attachments = attachments;
    if (notes !== undefined) bidding.notes = notes;

    await bidding.save();

    sendResponse(res, true, bidding.toApiResponse(), 'Bidding updated successfully');
  } catch (error) {
    handleError(res, error, 'Failed to update bidding');
  }
};

// @desc    Delete/Withdraw a bidding (only if status is pending)
// @route   DELETE /api/bidding/:biddingId
// @access  Private (Bidder only)
const deleteBidding = async (req, res) => {
  try {
    const { biddingId } = req.params;

    const bidding = await Bidding.findById(biddingId);
    if (!bidding) {
      return sendResponse(res, false, null, 'Bidding not found', 404);
    }

    // Check if user is the bidder
    if (bidding.freelancerId.toString() !== req.user.id) {
      return sendResponse(res, false, null, 'Access denied', 403);
    }

    // Check if bidding can be withdrawn
    if (!bidding.canWithdraw()) {
      return sendResponse(res, false, null, 'Bidding cannot be withdrawn', 400);
    }

    // Mark as withdrawn instead of deleting
    bidding.status = 'withdrawn';
    await bidding.save();

    sendResponse(res, true, null, 'Bidding withdrawn successfully');
  } catch (error) {
    handleError(res, error, 'Failed to withdraw bidding');
  }
};

// @desc    Get bidding statistics
// @route   GET /api/bidding/stats
// @access  Private (Admin only)
const getBiddingStats = async (req, res) => {
  try {
    const stats = await Bidding.getBiddingStatistics();
    const totalBiddings = await Bidding.countDocuments();
    const totalAmount = await Bidding.aggregate([
      { $group: { _id: null, total: { $sum: '$bidAmount' } } }
    ]);

    const response = {
      totalBiddings,
      totalAmount: totalAmount[0]?.total || 0,
      statusBreakdown: stats
    };

    sendResponse(res, true, response, 'Bidding statistics retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve bidding statistics');
  }
};

// @desc    Update proposal shortlist status
// @route   PATCH /api/bidding/:biddingId/shortlist
// @access  Private (Admin or Super Admin)
const updateShortlistStatus = async (req, res) => {
  try {
    const { biddingId } = req.params;
    const { isShortlisted } = req.body;

    const bidding = await Bidding.findById(biddingId)
      .populate('freelancerId', 'name email')
      .populate({
        path: 'projectId',
        select: 'assignedAgentId title'
      });
    if (!bidding) {
      return sendResponse(res, false, null, 'Bidding not found', 404);
    }

    // Check if user is admin, superadmin, or agent assigned to the project
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isAssignedAgent = req.user.role === 'agent' && bidding.projectId?.assignedAgentId?.toString() === req.user.id;
    
    if (!isAdmin && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Access denied. Admin, Super Admin, or assigned Agent role required.', 403);
    }

    // Update shortlist status
    bidding.isShortlisted = isShortlisted;
    if (isShortlisted && bidding.status === 'pending') {
      bidding.status = 'shortlisted';
    } else if (!isShortlisted && bidding.status === 'shortlisted' && !bidding.isAccepted && !bidding.isDeclined) {
      bidding.status = 'pending';
    }
    await bidding.save();

    sendResponse(res, true, { 
      biddingId: bidding._id, 
      isShortlisted: bidding.isShortlisted 
    }, `Proposal ${isShortlisted ? 'shortlisted' : 'removed from shortlist'} successfully`);

    // Notify freelancer when shortlisted
    try {
      if (isShortlisted && bidding?.freelancerId?.email) {
        const { sendShortlistedEmail } = require('../services/emailService');
        await sendShortlistedEmail({
          to: bidding.freelancerId.email,
          freelancerName: bidding.freelancerId.name,
          projectTitle: bidding.projectId?.title || bidding.projectTitle || 'Project',
        });

        // Also create an in-app notification and emit via socket
        const note = await createFreelancerNotification(
          bidding.freelancerId._id,
          'system',
          'Your Proposal Was Shortlisted',
          `Your proposal for ${bidding.projectId?.title || bidding.projectTitle || 'a project'} has been shortlisted by the admin.`,
          bidding.projectId,
          { biddingId: bidding._id }
        );
        if (note) {
          try {
            socketService.emitNotification(String(bidding.freelancerId._id), {
              id: note._id,
              type: 'system',
              title: note.title,
              message: note.message,
              projectId: note.projectId,
              isRead: note.isRead,
              createdAt: note.createdAt,
              metadata: note.metadata,
            });
          } catch (e) {
            console.error('Socket emit failed (shortlisted):', e?.message || e);
          }
        }
      }
    } catch (mailErr) {
      console.error('Shortlist email failed (bidding):', mailErr?.message || mailErr);
    }

  } catch (error) {
    handleError(res, error, 'Failed to update shortlist status');
  }
};

// @desc    Update proposal acceptance status
// @route   PATCH /api/bidding/:id/accept
// @access  Private (Admin or Super Admin)
const updateAcceptanceStatus = async (req, res) => {
  try {
    const { biddingId } = req.params;
    const { isAccepted } = req.body;

    const bidding = await Bidding.findById(biddingId)
      .populate('freelancerId', 'name email')
      .populate({
        path: 'projectId',
        select: 'title assignedAgentId'
      });
    
    if (!bidding) {
      return sendResponse(res, false, null, 'Bidding not found', 404);
    }

    // Check if user is admin, superadmin, or agent assigned to the project
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isAssignedAgent = req.user.role === 'agent' && bidding.projectId?.assignedAgentId?.toString() === req.user.id;
    
    if (!isAdmin && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Access denied. Admin, Super Admin, or assigned Agent role required.', 403);
    }

    // Business rule: Only one freelancer can be accepted per project
    if (isAccepted) {
      // Check if there's already an accepted freelancer for this project
      const existingAcceptedBidding = await Bidding.findOne({
        projectId: bidding.projectId,
        isAccepted: true,
        _id: { $ne: biddingId } // Exclude current bidding
      });

      if (existingAcceptedBidding) {
        return sendResponse(res, false, null, 'Another freelancer has already been accepted for this project. Only one freelancer can be accepted per project.', 400);
      }
    }

    // Update acceptance status
    bidding.isAccepted = isAccepted;
    if (isAccepted) {
      bidding.status = 'accepted';
      bidding.isDeclined = false; // Remove from declined if accepting
    } else {
      bidding.status = 'pending'; // Reset to pending if unaccepting
    }
    
    await bidding.save();

    // Also reflect acceptance on the parent Admin Bid so UI shows Accepted
    try {
      const parentAdminBid = await Bid.findById(bidding.adminBidId);
      if (parentAdminBid) {
        parentAdminBid.status = isAccepted ? 'accepted' : 'pending';
        await parentAdminBid.save();
      }
    } catch (e) {
      console.error('Failed to update parent admin bid status for acceptance:', e?.message || e);
    }

    // Update project's assignedFreelancerId when bidding is accepted/unaccepted
    if (bidding.projectId) {
      try {
        const ActivityLogger = require('../services/activityLogger');
        const projectId = bidding.projectId._id || bidding.projectId;
        
        if (isAccepted) {
          // Assign freelancer to project
          await Project.findByIdAndUpdate(projectId, {
            assignedFreelancer: bidding.freelancerId.name,
            assignedFreelancerId: bidding.freelancerId._id,
            status: 'in_progress' // Set to 'in_progress' when freelancer is accepted
          });

          // Log assignment activity
          try {
            await ActivityLogger.logFreelancerAssigned(
              projectId,
              req.user.id,
              bidding.freelancerId.name,
              req
            );
          } catch (e) {
            console.error('Failed to log freelancer assignment activity:', e?.message || e);
          }

          // Log proposal acceptance activity
          try {
            await ActivityLogger.logActivity({
              user: req.user.id,
              project: projectId,
              activityType: 'proposal_accepted',
              title: 'Proposal Accepted',
              description: `Freelancer "${bidding.freelancerId.name}"'s proposal was accepted for project "${bidding.projectId?.title || 'Project'}". Bid Amount: ₹${bidding.bidAmount?.toLocaleString() || 'N/A'}, Timeline: ${bidding.timeline || 'N/A'}`,
              metadata: {
                freelancerId: bidding.freelancerId._id,
                freelancerName: bidding.freelancerId.name,
                biddingId: bidding._id,
                bidAmount: bidding.bidAmount,
                timeline: bidding.timeline,
                proposal: bidding.proposal || bidding.description || '',
                acceptedBy: req.user.id,
                acceptedByName: req.user.name,
                acceptedByRole: req.user.role
              },
              tags: ['proposal', 'acceptance', 'freelancer', 'bidding'],
              severity: 'high'
            }, req);
          } catch (e) {
            console.error('Failed to log proposal acceptance activity:', e?.message || e);
          }

          // Emit realtime update
          try {
            socketService.emitProjectUpdate(projectId, 'freelancer-assigned', {
              freelancerName: bidding.freelancerId.name,
              freelancerId: bidding.freelancerId._id
            });
          } catch (e) {
            console.error('Failed to emit freelancer-assigned event:', e?.message || e);
          }
        } else {
          // Unassign freelancer from project
          await Project.findByIdAndUpdate(projectId, {
            $unset: { assignedFreelancer: '', assignedFreelancerId: '' }
          });
        }
      } catch (e) {
        console.error('Failed to update project assignedFreelancerId:', e?.message || e);
      }
    }

    // If bid is accepted, send notification and email to freelancer
    if (isAccepted) {
      const freelancer = bidding.freelancerId;
      const project = bidding.projectId;
      const adminName = req.user.name;

      // Create notification for freelancer
      const notification = await createFreelancerNotification(
        freelancer._id,
        'bidding_accepted',
        '🎉 Your Bid Has Been Accepted!',
        `Congratulations! Your bid for project "${project.title}" has been accepted by ${adminName}. You can now start working on this project.`,
        project._id,
        {
          biddingId: bidding._id,
          projectTitle: project.title,
          adminName: adminName,
          bidAmount: bidding.bidAmount,
          timeline: bidding.timeline
        }
      );

      // Send real-time notification via socket
      if (notification) {
        socketService.emitNotification(freelancer._id.toString(), {
          id: notification._id,
          type: 'system',
          title: notification.title,
          message: notification.message,
          projectId: notification.projectId,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          metadata: notification.metadata
        });
      }

      // Send email to accepted freelancer
      const emailMessage = biddingAcceptedTemplate(
        freelancer.name,
        project.title,
        adminName,
        bidding.bidAmount,
        bidding.timeline
      );

      await sendFreelancerEmail(
        freelancer.email,
        freelancer.name,
        '🎉 Congratulations! Your Bid Has Been Accepted -Connect-Accel',
        emailMessage
      );

      // Notify other freelancers as "Not Shortlisted"
      try {
        const { sendNotSelectedEmail } = require('../services/emailService');
        const otherBiddings = await Bidding.find({
          projectId: project._id,
          _id: { $ne: biddingId },
        }).populate('freelancerId', 'name email');

        for (const ob of otherBiddings) {
          if (ob?.freelancerId?.email) {
            await sendNotSelectedEmail({
              to: ob.freelancerId.email,
              freelancerName: ob.freelancerId.name,
              projectTitle: project.title,
            });
          }
        }
      } catch (mailErr) {
        console.error('Not-selected emails failed (bidding):', mailErr?.message || mailErr);
      }
    }

    sendResponse(res, true, { 
      biddingId: bidding._id, 
      isAccepted: bidding.isAccepted,
      status: bidding.status
    }, `Proposal ${isAccepted ? 'accepted' : 'unaccepted'} successfully`);

  } catch (error) {
    handleError(res, error, 'Failed to update acceptance status');
  }
};

// @desc    Update proposal decline status
// @route   PATCH /api/bidding/:id/decline
// @access  Private (Admin or Super Admin)
const updateDeclineStatus = async (req, res) => {
  try {
    const { biddingId } = req.params;
    const { isDeclined } = req.body;

    const bidding = await Bidding.findById(biddingId)
      .populate('freelancerId', 'name email')
      .populate({
        path: 'projectId',
        select: 'title assignedAgentId'
      });
    
    if (!bidding) {
      return sendResponse(res, false, null, 'Bidding not found', 404);
    }

    // Check if user is admin, superadmin, or agent assigned to the project
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isAssignedAgent = req.user.role === 'agent' && bidding.projectId?.assignedAgentId?.toString() === req.user.id;
    
    if (!isAdmin && !isAssignedAgent) {
      return sendResponse(res, false, null, 'Access denied. Admin, Super Admin, or assigned Agent role required.', 403);
    }

    // Update decline status
    bidding.isDeclined = isDeclined;
    if (isDeclined) {
      bidding.status = 'rejected';
      bidding.isAccepted = false; // Remove from accepted if declining
    } else {
      bidding.status = 'pending'; // Reset to pending if un-declining
    }
    
    await bidding.save();

    // If bid is declined, send notification and email to freelancer
    if (isDeclined) {
      const freelancer = bidding.freelancerId;
      const project = bidding.projectId;
      const adminName = req.user.name;

      // Create notification for freelancer
      const notification = await createFreelancerNotification(
        freelancer._id,
        'bidding_declined',
        'Bid Update',
        `Your bid for project "${project.title}" has been declined by ${adminName}. Don't worry, there are many other opportunities available!`,
        project._id,
        {
          biddingId: bidding._id,
          projectTitle: project.title,
          adminName: adminName,
          bidAmount: bidding.bidAmount,
          timeline: bidding.timeline
        }
      );

      // Send real-time notification via socket
      if (notification) {
        socketService.emitNotification(freelancer._id.toString(), {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          projectId: notification.projectId,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          metadata: notification.metadata
        });
      }

      // Send email to freelancer
      const emailMessage = biddingDeclinedTemplate(
        freelancer.name,
        project.title,
        adminName
      );

      await sendFreelancerEmail(
        freelancer.email,
        freelancer.name,
        'Bid Update -Connect-Accel',
        emailMessage
      );
    }

    sendResponse(res, true, { 
      biddingId: bidding._id, 
      isDeclined: bidding.isDeclined,
      status: bidding.status
    }, `Proposal ${isDeclined ? 'declined' : 'un-declined'} successfully`);

  } catch (error) {
    handleError(res, error, 'Failed to update decline status');
  }
};

// @desc    Get shortlisted proposals for a project
// @route   GET /api/bidding/project/:projectId/shortlisted
// @access  Private (Admin or Super Admin)
const getShortlistedProposals = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user is admin or superadmin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return sendResponse(res, false, null, 'Access denied. Admin or Super Admin role required.', 403);
    }

    const shortlistedBiddings = await Bidding.find({ 
      projectId, 
      isShortlisted: true 
    })
    .populate('freelancerId', 'name email avatar')
    .sort({ submittedAt: -1 });

    sendResponse(res, true, shortlistedBiddings, 'Shortlisted proposals retrieved successfully');

  } catch (error) {
    handleError(res, error, 'Failed to retrieve shortlisted proposals');
  }
};

module.exports = {
  submitBidding,
  getAllBiddings,
  getBiddingsByAdminBid,
  getBiddingsByFreelancer,
  getBiddingDetails,
  updateBiddingStatus,
  updateBidding,
  deleteBidding,
  getBiddingStats,
  updateShortlistStatus,
  updateAcceptanceStatus,
  updateDeclineStatus,
  getShortlistedProposals
};
