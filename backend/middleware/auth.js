const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_ROLES, JWT_CONFIG, MESSAGES, STATUS_CODES } = require('../constants');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET_KEY);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.USER_NOT_FOUND_AUTH
        });
      }

      // Block inactive accounts
      if (req.user.status === 'inactive') {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Your account is inactive. Please contact an administrator.'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.TOKEN_FAILED
      });
    }
  }

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.NO_TOKEN
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is Superadmin
const isSuperadmin = (req, res, next) => {
  if (req.user.role !== USER_ROLES.SUPERADMIN) {
    return res.status(STATUS_CODES.FORBIDDEN).json({
      success: false,
      message: MESSAGES.SUPERADMIN_REQUIRED
    });
  }
  next();
};

// Check if user is Client or Superadmin
const isClientOrSuperadmin = (req, res, next) => {
  if (![USER_ROLES.CLIENT, USER_ROLES.SUPERADMIN].includes(req.user.role)) {
    return res.status(STATUS_CODES.FORBIDDEN).json({
      success: false,
      message: MESSAGES.CLIENT_SUPERADMIN_REQUIRED
    });
  }
  next();
};

module.exports = { protect, authorize, isSuperadmin, isClientOrSuperadmin };
