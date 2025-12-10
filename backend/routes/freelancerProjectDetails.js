const express = require('express');
const router = express.Router();
const {
  getFreelancerProjectDetail,
  updateFreelancerProjectDetail,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addAttachment,
  deleteAttachment,
  updateBidDetails
} = require('../controllers/freelancerProjectDetailController');
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const Bidding = require('../models/Bidding');
const { MESSAGES, STATUS_CODES, USER_ROLES } = require('../constants');

// All routes require authentication
router.use(protect);

const isAdmin = (user = {}) =>
  user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN;

const denyAccess = (res, status = STATUS_CODES.FORBIDDEN, message = 'Access denied.') =>
  res.status(status).json({ success: false, message });

const allowAdminOnly = (req, res, next) => {
  if (isAdmin(req.user)) {
    return next();
  }
  return denyAccess(res, STATUS_CODES.FORBIDDEN, 'Access denied. Admin privileges required.');
};

const isUserAssignedToProject = (project, userId) => {
  if (!project || !userId) return false;

  if (project.assignedFreelancerId) {
    const assigned = project.assignedFreelancerId;
    if (typeof assigned === 'object' && assigned._id) {
      if (assigned._id.toString() === userId) {
        return true;
      }
    } else if (assigned.toString && assigned.toString() === userId) {
      return true;
    }
  }

  if (project.assignedFreelancer) {
    if (typeof project.assignedFreelancer === 'object' && project.assignedFreelancer._id) {
      if (project.assignedFreelancer._id.toString() === userId) {
        return true;
      }
    }
    if (
      typeof project.assignedFreelancer === 'string' &&
      project.assignedFreelancer === userId
    ) {
      return true;
    }
  }

  return false;
};

const allowAdminOrAssignedFreelancer = async (req, res, next) => {
  try {
    if (isAdmin(req.user)) {
      return next();
    }

    if (req.user.role !== USER_ROLES.FREELANCER) {
      return denyAccess(res, STATUS_CODES.FORBIDDEN, 'Access denied. Freelancer role required.');
    }

    const projectId = req.params.projectId;
    if (!projectId) {
      return denyAccess(res);
    }

    const project = await Project.findById(projectId)
      .select('assignedFreelancerId assignedFreelancer')
      .lean();

    if (!project) {
      return denyAccess(res, STATUS_CODES.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND);
    }

    const userId = req.user.id?.toString();

    if (isUserAssignedToProject(project, userId)) {
      return next();
    }

    const acceptedBid = await Bidding.findOne({
      projectId,
      freelancerId: userId,
      isAccepted: true
    }).select('_id');

    if (acceptedBid) {
      return next();
    }

    return denyAccess(
      res,
      STATUS_CODES.FORBIDDEN,
      'Access denied. You must be the assigned freelancer for this project.'
    );
  } catch (error) {
    console.error('Error validating freelancer access to project detail:', error);
    return denyAccess(res, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.SERVER_ERROR);
  }
};

// Get freelancer project detail
router.get('/:projectId', allowAdminOrAssignedFreelancer, getFreelancerProjectDetail);

// Admin-only routes below this point
router.use(allowAdminOnly);

// Update freelancer project detail
router.put('/:projectId', updateFreelancerProjectDetail);

// Milestone routes
router.post('/:projectId/milestones', addMilestone);
router.put('/:projectId/milestones/:milestoneId', updateMilestone);
router.delete('/:projectId/milestones/:milestoneId', deleteMilestone);

// Attachment routes
router.post('/:projectId/attachments', addAttachment);
router.delete('/:projectId/attachments/:attachmentId', deleteAttachment);

// Bid details route
router.put('/:projectId/bid-details', updateBidDetails);

module.exports = router;

