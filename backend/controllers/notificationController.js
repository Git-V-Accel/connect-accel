const Notification = require('../models/Notification');
const { STATUS_CODES, MESSAGES } = require('../constants');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { cursor, limit = 20 } = req.query;
    const { cursorPaginate } = require('../utils/pagination');

    const result = await cursorPaginate(Notification, { user: req.user.id }, {
      cursor: cursor || null,
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: 'projectId', select: 'title' },
      lean: true,
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: result.data.length,
      data: result.data,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Dismiss notification
// @route   DELETE /api/notifications/:id
// @access  Private
const dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Notification dismissed'
    });
  } catch (error) {
    console.error('Dismiss notification error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  dismissNotification,
  markAllAsRead
};
