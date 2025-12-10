const FreelancerProjectDetail = require('../models/FreelancerProjectDetail');
const Project = require('../models/Project');
const Bidding = require('../models/Bidding');
const { MESSAGES, STATUS_CODES } = require('../constants');
const { processAttachments } = require('../utils/attachmentStorage');

const populateDetailReferences = async (detail) => {
  if (!detail) return detail;
  await detail.populate('projectId');
  await detail.populate('freelancerBiddingId');
  await detail.populate('lastUpdatedBy', 'name email');
  await detail.populate('attachments.uploadedBy', 'name email');
  return detail;
};

const recalculateProgress = (detail) => {
  const completed = detail.milestones.filter((m) => m.status === 'completed').length;
  detail.progress = {
    completedMilestones: completed,
    totalMilestones: detail.milestones.length,
    percentage:
      detail.milestones.length > 0
        ? Math.round((completed / detail.milestones.length) * 100)
        : 0
  };
};

const getOrCreateProjectDetail = async (projectId, userId, { populate = false } = {}) => {
  let detail = await FreelancerProjectDetail.findOne({ projectId });

  if (!detail) {
    const project = await Project.findById(projectId);
    if (!project) {
      return null;
    }

    const bidding = await Bidding.findOne({
      projectId,
      isAccepted: true
    });

    detail = await FreelancerProjectDetail.create({
      projectId,
      freelancerBiddingId: bidding ? bidding._id : null,
      bidDetails: bidding
        ? {
            bidAmount: bidding.bidAmount,
            timeline: bidding.timeline,
            description: bidding.description,
            notes: bidding.notes || ''
          }
        : {},
      milestones: [],
      attachments: [],
      progress: {
        completedMilestones: 0,
        totalMilestones: 0,
        percentage: 0
      },
      status: 'active',
      lastUpdatedBy: userId
    });
  } else if (!detail.freelancerBiddingId) {
    const bidding = await Bidding.findOne({
      projectId,
      isAccepted: true
    });

    if (bidding) {
      detail.freelancerBiddingId = bidding._id;
      if (!detail.bidDetails || Object.keys(detail.bidDetails).length === 0) {
        detail.bidDetails = {
          bidAmount: bidding.bidAmount,
          timeline: bidding.timeline,
          description: bidding.description,
          notes: bidding.notes || ''
        };
      }
      detail.lastUpdatedBy = userId;
      await detail.save();
    }
  }

  if (populate) {
    await populateDetailReferences(detail);
  }

  return detail;
};

// @desc    Get freelancer project detail by project ID
// @route   GET /api/freelancer-project-details/:projectId
// @access  Private (Admin)
const getFreelancerProjectDetail = async (req, res) => {
  try {
    const { projectId } = req.params;

    const detail = await getOrCreateProjectDetail(projectId, req.user.id, {
      populate: true
    });

    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error getting freelancer project detail:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to get freelancer project detail'
    });
  }
};

// @desc    Update freelancer project detail
// @route   PUT /api/freelancer-project-details/:projectId
// @access  Private (Admin)
const updateFreelancerProjectDetail = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    let detail = await getOrCreateProjectDetail(projectId, req.user.id);

    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    Object.assign(detail, updateData);
    detail.lastUpdatedBy = req.user.id;

    // Update progress if milestones changed
    if (updateData.milestones) {
      recalculateProgress(detail);
    }

    await detail.save();
    await populateDetailReferences(detail);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error updating freelancer project detail:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to update freelancer project detail'
    });
  }
};

// @desc    Add milestone to freelancer project detail
// @route   POST /api/freelancer-project-details/:projectId/milestones
// @access  Private (Admin)
const addMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestoneData = req.body;

    const detail = await getOrCreateProjectDetail(projectId, req.user.id);
    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    const newMilestone = {
      ...milestoneData,
      status: milestoneData.status || 'pending',
      isPaid: false
    };

    detail.milestones.push(newMilestone);
    recalculateProgress(detail);
    detail.lastUpdatedBy = req.user.id;
    await detail.save();
    await populateDetailReferences(detail);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error adding milestone:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to add milestone'
    });
  }
};

// @desc    Update milestone in freelancer project detail
// @route   PUT /api/freelancer-project-details/:projectId/milestones/:milestoneId
// @access  Private (Admin)
const updateMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const updateData = req.body;

    const detail = await getOrCreateProjectDetail(projectId, req.user.id);

    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    const milestone = detail.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    Object.assign(milestone, updateData);
    
    if (updateData.status === 'completed' && !milestone.completedAt) {
      milestone.completedAt = new Date();
    }

    recalculateProgress(detail);
    detail.lastUpdatedBy = req.user.id;
    await detail.save();
    await populateDetailReferences(detail);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to update milestone'
    });
  }
};

// @desc    Delete milestone from freelancer project detail
// @route   DELETE /api/freelancer-project-details/:projectId/milestones/:milestoneId
// @access  Private (Admin)
const deleteMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;

    const detail = await getOrCreateProjectDetail(projectId, req.user.id);

    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    detail.milestones.id(milestoneId).remove();
    recalculateProgress(detail);
    detail.lastUpdatedBy = req.user.id;
    await detail.save();
    await populateDetailReferences(detail);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to delete milestone'
    });
  }
};

// @desc    Add attachment to freelancer project detail
// @route   POST /api/freelancer-project-details/:projectId/attachments
// @access  Private (Admin)
const addAttachment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const attachmentData = req.body;

    const detail = await getOrCreateProjectDetail(projectId, req.user.id);
    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    const processedAttachments = processAttachments(req.files, attachmentData?.attachments || attachmentData);
    const attachmentsToAdd =
      processedAttachments.length > 0
        ? processedAttachments
        : [
            {
      ...attachmentData,
      uploadedBy: req.user.id,
              uploadedAt: new Date(),
            },
          ];

    attachmentsToAdd.forEach((attachment) => {
      detail.attachments.push({
        ...attachment,
        uploadedBy: attachment.uploadedBy || req.user.id,
        uploadedAt: attachment.uploadedAt || new Date(),
      });
    });
    detail.lastUpdatedBy = req.user.id;
    await detail.save();
    await populateDetailReferences(detail);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to add attachment'
    });
  }
};

// @desc    Delete attachment from freelancer project detail
// @route   DELETE /api/freelancer-project-details/:projectId/attachments/:attachmentId
// @access  Private (Admin)
const deleteAttachment = async (req, res) => {
  try {
    const { projectId, attachmentId } = req.params;

    const detail = await FreelancerProjectDetail.findOne({ projectId });

    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Freelancer project detail not found'
      });
    }

    detail.attachments.id(attachmentId).remove();
    detail.lastUpdatedBy = req.user.id;
    await detail.save();
    await populateDetailReferences(detail);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to delete attachment'
    });
  }
};

// @desc    Update bid details in freelancer project detail
// @route   PUT /api/freelancer-project-details/:projectId/bid-details
// @access  Private (Admin)
const updateBidDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const bidDetails = req.body;

    const detail = await getOrCreateProjectDetail(projectId, req.user.id);
    if (!detail) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    detail.bidDetails = {
      ...detail.bidDetails,
      ...bidDetails
    };
    detail.lastUpdatedBy = req.user.id;
    await detail.save();
    await populateDetailReferences(detail);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error updating bid details:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to update bid details'
    });
  }
};

module.exports = {
  getFreelancerProjectDetail,
  updateFreelancerProjectDetail,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addAttachment,
  deleteAttachment,
  updateBidDetails
};

