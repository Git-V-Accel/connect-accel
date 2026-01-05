const AuditLog = require('../models/AuditLog');
const { STATUS_CODES, MESSAGES, USER_ROLES } = require('../constants');

// @desc    Get audit logs relevant to the current user
// @route   GET /api/audit-logs/me
// @access  Private (Any authenticated user)
const getMyAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      severity,
      startDate,
      endDate,
      search
    } = req.query;

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Base query: logs where current user is performer or target
    const query = {
      $or: [{ performedBy: userId }, { targetUser: userId }]
    };

    if (action) query.action = action;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { description: searchRegex },
          { performedByName: searchRegex },
          { targetUserName: searchRegex },
          { performedByEmail: searchRegex },
          { targetUserEmail: searchRegex }
        ]
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const auditLogs = await AuditLog.find(query)
      .populate('performedBy', 'name email role userID')
      .populate('targetUser', 'name email role userID')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: auditLogs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      auditLogs
    });
  } catch (error) {
    console.error('Get my audit logs error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get all audit logs (Superadmin and Admin only)
// @route   GET /api/audit-logs
// @access  Private (Superadmin + Admin)
const getAllAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      performedBy,
      targetUser,
      severity,
      startDate,
      endDate,
      search
    } = req.query;

    // Build query
    const query = {};

    // Filter by action
    if (action) {
      query.action = action;
    }

    // Filter by performer
    if (performedBy) {
      query.performedBy = performedBy;
    }

    // Filter by target user
    if (targetUser) {
      query.targetUser = targetUser;
    }

    // Filter by severity
    if (severity) {
      query.severity = severity;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search in description, performer name, or target user name
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { description: searchRegex },
        { performedByName: searchRegex },
        { targetUserName: searchRegex },
        { performedByEmail: searchRegex },
        { targetUserEmail: searchRegex }
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await AuditLog.countDocuments(query);

    // Get audit logs
    const auditLogs = await AuditLog.find(query)
      .populate('performedBy', 'name email role userID')
      .populate('targetUser', 'name email role userID')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: auditLogs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      auditLogs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get audit logs for a specific user (Superadmin and Admin only)
// @route   GET /api/audit-logs/user/:userId
// @access  Private (Superadmin + Admin)
const getUserAuditLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 50,
      action,
      severity,
      startDate,
      endDate
    } = req.query;

    // Build query - get logs where user is either performer or target
    const query = {
      $or: [
        { performedBy: userId },
        { targetUser: userId }
      ]
    };

    // Filter by action
    if (action) {
      query.action = action;
    }

    // Filter by severity
    if (severity) {
      query.severity = severity;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await AuditLog.countDocuments(query);

    // Get audit logs
    const auditLogs = await AuditLog.find(query)
      .populate('performedBy', 'name email role userID')
      .populate('targetUser', 'name email role userID')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: auditLogs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      auditLogs
    });
  } catch (error) {
    console.error('Get user audit logs error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get audit log statistics (Superadmin and Admin only)
// @route   GET /api/audit-logs/stats
// @access  Private (Superadmin + Admin)
const getAuditLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    // Get statistics
    const [
      totalLogs,
      actionStats,
      severityStats,
      recentLogs
    ] = await Promise.all([
      // Total logs count
      AuditLog.countDocuments(dateFilter),

      // Count by action type
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Count by severity
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Recent logs (last 10)
      AuditLog.find(dateFilter)
        .populate('performedBy', 'name email role')
        .populate('targetUser', 'name email role')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.status(STATUS_CODES.OK).json({
      success: true,
      stats: {
        totalLogs,
        byAction: actionStats,
        bySeverity: severityStats,
        recentLogs
      }
    });
  } catch (error) {
    console.error('Get audit log stats error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get audit log by ID (Superadmin and Admin only)
// @route   GET /api/audit-logs/:id
// @access  Private (Superadmin + Admin)
const getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('performedBy', 'name email role userID avatar')
      .populate('targetUser', 'name email role userID avatar');

    if (!auditLog) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      auditLog
    });
  } catch (error) {
    console.error('Get audit log by ID error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  getMyAuditLogs,
  getAllAuditLogs,
  getUserAuditLogs,
  getAuditLogStats,
  getAuditLogById
};
