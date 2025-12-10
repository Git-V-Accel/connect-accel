const express = require('express');
const router = express.Router();
const {
  getClientActivityLogs,
  getProjectActivityLogs,
  getAllActivityLogs,
  getActivityLogStats
} = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/activity-logs/stats
// @desc    Get activity log statistics
// @access  Private
router.get('/stats', getActivityLogStats);

// @route   GET /api/activity-logs
// @desc    Get all activity logs (Admin only)
// @access  Private (Admin only)
router.get('/', getAllActivityLogs);

// @route   GET /api/activity-logs/client/:clientId
// @desc    Get client activity logs
// @access  Private
router.get('/client/:clientId', getClientActivityLogs);

// @route   GET /api/activity-logs/project/:projectId
// @desc    Get project activity logs
// @access  Private
router.get('/project/:projectId', getProjectActivityLogs);

module.exports = router;
