const ActivityLogger = require('../services/activityLogger');
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const { STATUS_CODES, MESSAGES } = require('../constants');

// @desc    Get client activity logs
// @route   GET /api/activity-logs/client/:clientId
// @access  Private
const getClientActivityLogs = async (req, res) => {
  try {
    const { clientId } = req.params;
    const {
      limit = 50,
      skip = 0,
      activityTypes,
      startDate,
      endDate,
      includeProjectActivities = 'true'
    } = req.query;

    // Check if user has permission to view client logs
    if (req.user.role === 'client' && req.user.id !== clientId) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
    }

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      activityTypes: activityTypes ? activityTypes.split(',') : [],
      startDate,
      endDate,
      includeProjectActivities: includeProjectActivities === 'true'
    };

    const activities = await ActivityLogger.getClientActivityLogs(clientId, options);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Get client activity logs error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get project activity logs
// @route   GET /api/activity-logs/project/:projectId
// @access  Private
const getProjectActivityLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      limit = 50,
      skip = 0,
      activityTypes,
      startDate,
      endDate
    } = req.query;

    // Check if user has permission to view project logs
    if (req.user.role === 'client') {
      // Check if the client owns this project
      const project = await Project.findOne({ _id: projectId, client: req.user.id });
      if (!project) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      activityTypes: activityTypes ? activityTypes.split(',') : [],
      startDate,
      endDate
    };

    const activities = await ActivityLogger.getProjectActivityLogs(projectId, options);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Get project activity logs error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get all activity logs (Admin only)
// @route   GET /api/activity-logs
// @access  Private (Admin only)
const getAllActivityLogs = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const {
      limit = 100,
      skip = 0,
      activityTypes,
      startDate,
      endDate,
      userId,
      projectId
    } = req.query;

    const query = { visibleToAdmin: true };

    // Add filters
    if (activityTypes) {
      query.activityType = { $in: activityTypes.split(',') };
    }

    if (userId) {
      query.user = userId;
    }

    if (projectId) {
      query.project = projectId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const { cursorPaginate } = require('../utils/pagination');
    
    const result = await cursorPaginate(ActivityLog, query, {
      cursor: req.query.cursor || null,
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'name email role' },
        { path: 'project', select: 'title' }
      ],
      lean: true,
    });
    
    const activities = result.data;

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Get all activity logs error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get activity log statistics
// @route   GET /api/activity-logs/stats
// @access  Private
const getActivityLogStats = async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    
    let matchQuery = {};
    
    // Filter by user role
    if (req.user.role === 'client') {
      matchQuery = {
        $or: [
          { user: req.user.id },
          { visibleToClient: true }
        ]
      };
    }

    const stats = await ActivityLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          latestActivity: { $max: '$createdAt' }
        }
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: '$count' },
          activityTypes: {
            $push: {
              type: '$_id',
              count: '$count',
              latestActivity: '$latestActivity'
            }
          }
        }
      }
    ]);

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStats = await ActivityLog.aggregate([
      {
        $match: {
          ...matchQuery,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: {
        totalActivities: stats[0]?.totalActivities || 0,
        activityTypes: stats[0]?.activityTypes || [],
        recentActivities: recentStats
      }
    });
  } catch (error) {
    console.error('Get activity log stats error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  getClientActivityLogs,
  getProjectActivityLogs,
  getAllActivityLogs,
  getActivityLogStats
};
