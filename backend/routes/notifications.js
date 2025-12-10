const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  dismissNotification,
  markAllAsRead
} = require('../controllers/notificationController');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', getNotifications);

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', markAsRead);

// @desc    Dismiss notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', dismissNotification);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', markAllAsRead);

module.exports = router;
