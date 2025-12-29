const express = require('express');
const router = express.Router();
const {
  getAllAuditLogs,
  getUserAuditLogs,
  getAuditLogStats,
  getAuditLogById
} = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../constants');

// All routes require authentication and admin/superadmin privileges
router.use(protect);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN));

// @route   GET /api/audit-logs
// @desc    Get all audit logs with filtering and pagination
// @access  Private (Admin + Superadmin)
router.get('/', getAllAuditLogs);

// @route   GET /api/audit-logs/stats
// @desc    Get audit log statistics
// @access  Private (Admin + Superadmin)
router.get('/stats', getAuditLogStats);

// @route   GET /api/audit-logs/user/:userId
// @desc    Get audit logs for a specific user
// @access  Private (Admin + Superadmin)
router.get('/user/:userId', getUserAuditLogs);

// @route   GET /api/audit-logs/:id
// @desc    Get audit log by ID
// @access  Private (Admin + Superadmin)
router.get('/:id', getAuditLogById);

module.exports = router;
