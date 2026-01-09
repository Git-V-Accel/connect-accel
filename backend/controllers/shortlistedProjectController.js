const ShortlistedProject = require('../models/ShortlistedProject');
const { validationResult } = require('express-validator');

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

// @desc    Add project to freelancer's shortlist
// @route   POST /api/shortlisted-projects
// @access  Private (Freelancer only)
const addToShortlist = async (req, res) => {
  try {
    const { projectId, adminBidId } = req.body;
    const freelancerId = req.user.id;

    // Check if already shortlisted
    const existingShortlist = await ShortlistedProject.findOne({
      freelancerId,
      projectId,
      adminBidId
    });

    if (existingShortlist) {
      return sendResponse(res, false, null, 'Project already shortlisted', 400);
    }

    // Add to shortlist
    const shortlistedProject = new ShortlistedProject({
      freelancerId,
      projectId,
      adminBidId
    });

    await shortlistedProject.save();

    sendResponse(res, true, null, 'Project added to shortlist');
  } catch (error) {
    handleError(res, error, 'Failed to add project to shortlist');
  }
};

// @desc    Remove project from freelancer's shortlist
// @route   DELETE /api/shortlisted-projects/:projectId
// @access  Private (Freelancer only)
const removeFromShortlist = async (req, res) => {
  try {
    const { projectId } = req.params;
    const freelancerId = req.user.id;

    const result = await ShortlistedProject.deleteOne({
      freelancerId,
      projectId
    });

    if (result.deletedCount === 0) {
      return sendResponse(res, false, null, 'Project not found in shortlist', 404);
    }

    sendResponse(res, true, null, 'Project removed from shortlist');
  } catch (error) {
    handleError(res, error, 'Failed to remove project from shortlist');
  }
};

// @desc    Get freelancer's shortlisted projects
// @route   GET /api/shortlisted-projects
// @access  Private (Freelancer only)
const getShortlistedProjects = async (req, res) => {
  try {
    const freelancerId = req.user.id;

    const shortlistedProjects = await ShortlistedProject.find({ freelancerId })
      .populate('projectId')
      .populate('adminBidId')
      .sort({ shortlistedAt: -1 });

    sendResponse(res, true, shortlistedProjects, 'Shortlisted projects retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to retrieve shortlisted projects');
  }
};

// @desc    Check if project is shortlisted
// @route   GET /api/shortlisted-projects/check/:projectId
// @access  Private (Freelancer only)
const checkShortlistStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const freelancerId = req.user.id;

    const shortlistedProject = await ShortlistedProject.findOne({
      freelancerId,
      projectId
    });

    const isShortlisted = !!shortlistedProject;

    sendResponse(res, true, { isShortlisted }, 'Shortlist status retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to check shortlist status');
  }
};

module.exports = {
  addToShortlist,
  removeFromShortlist,
  getShortlistedProjects,
  checkShortlistStatus
};
