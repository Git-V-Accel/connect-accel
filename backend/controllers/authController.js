const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const sendEmail = require('../utils/sendEmail');
const { otpVerificationTemplate, passwordResetTemplate } = require('../templates/emailTemplates');
const socketService = require('../services/socketService');
const { USER_ROLES, JWT_CONFIG, PASSWORD_RESET_CONFIG, MESSAGES, STATUS_CODES, NOTIFICATION_TYPES, USER_STATUS, FRONTEND_CONFIG } = require('../constants');
const { generateUserId } = require('../utils/userIdGenerator');
const { generateOTPWithExpiry } = require('../utils/otpGenerator');
// Generate JWT Access Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_CONFIG.SECRET_KEY, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
  });
};

// Generate JWT Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_CONFIG.REFRESH_SECRET_KEY, {
    expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN,
  });
};

// Store refresh token in-memory
const inMemoryTokens = new Map();

const storeRefreshToken = async (userId, refreshToken) => {
      inMemoryTokens.set(userId, refreshToken);
      // Auto-expire after 7 days
      setTimeout(() => inMemoryTokens.delete(userId), 7 * 24 * 60 * 60 * 1000);
};

// Get refresh token from in-memory storage
const getRefreshToken = async (userId) => {
      return inMemoryTokens.get(userId) || null;
};

// Revoke refresh token
const revokeRefreshToken = async (userId) => {
      inMemoryTokens.delete(userId);
};

// Set HTTP-only cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Please provide name, email, password and phone number'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.USER_EXISTS
      });
    }

    // Generate userID for client (signup is only for clients)
    const userID = await generateUserId(USER_ROLES.CLIENT);

    // Generate OTP for email verification (6 digits, expires in 10 minutes)
    const { otpCode, otpExpire } = generateOTPWithExpiry(10);

    // Create user with inactive status and OTP
    const user = await User.create({
      userID,
      name,
      email,
      password,
      phone,
      role: USER_ROLES.CLIENT, // Explicitly set role as client for signups
      status: USER_STATUS.INACTIVE, // Set to inactive until OTP is verified
      isEmailVerified: false,
      otpCode,
      otpExpire
    });

    // Send OTP email
    const otpMessage = otpVerificationTemplate(otpCode, {
      userName: user.name,
      isResend: false
    });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification OTP - V-Accel',
        message: otpMessage
      });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
        message: MESSAGES.OTP_SENT,
        email: user.email, // Return email for frontend to show OTP verification
        requiresVerification: true
      });
    } catch (error) {
      console.error('Email sending error during registration:', error);
      
      // If email sending fails, delete the user
      await User.findByIdAndDelete(user._id);
      
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.EMAIL_SEND_FAILED
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR_REGISTRATION
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PROVIDE_EMAIL_PASSWORD
      });
    }

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Allow inactive users with isFirstLogin to proceed to password change
    // Block other inactive accounts
    if (user.status === 'inactive' && !user.isFirstLogin) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Your account is inactive. Please contact an administrator.'
      });
    }

    // For client users, check if email is verified (skip for first login)
    if (user.role === USER_ROLES.CLIENT && !user.isEmailVerified && !user.isFirstLogin) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.EMAIL_NOT_VERIFIED,
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await storeRefreshToken(user._id.toString(), refreshToken);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      token,
      isFirstLogin: user.isFirstLogin || false,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isFirstLogin: user.isFirstLogin || false,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR_LOGIN
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_CONFIG.REFRESH_SECRET_KEY);
    } catch (error) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if refresh token exists in storage
    const storedToken = await getRefreshToken(decoded.id);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Refresh token not found or revoked'
      });
    }

    // Get user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'User not found'
      });
    }

    // Block inactive accounts
    if (user.status === 'inactive') {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Your account is inactive. Please contact an administrator.'
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.status(STATUS_CODES.OK).json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Revoke refresh token
    if (req.user?.id) {
      await revokeRefreshToken(req.user.id);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Send OTP for password change
// @route   POST /api/auth/change-password/send-otp
// @access  Private
const sendPasswordChangeOTP = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    // Validation
    if (!currentPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Current password is required'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Validate current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Ensure user has a userID (for legacy users that might not have one)
    if (!user.userID) {
      user.userID = await generateUserId(user.role);
    }

    // Generate OTP for password change (6 digits, expires in 10 minutes)
    const { otpCode, otpExpire } = generateOTPWithExpiry(10);

    // Store OTP in user document
    user.otpCode = otpCode;
    user.otpExpire = otpExpire;
    await user.save();

    // Send OTP email
    const otpMessage = otpVerificationTemplate(otpCode, {
      userName: user.name,
      isResend: false
    });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Change Verification - V-Accel',
        message: otpMessage
      });

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.OTP_SENT
      });
    } catch (error) {
      console.error('Email sending error during password change OTP:', error);
      
      // Rollback OTP
      user.otpCode = undefined;
      user.otpExpire = undefined;
      await user.save();

      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.EMAIL_SEND_FAILED
      });
    }
  } catch (error) {
    console.error('Send password change OTP error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { newPassword, otpCode } = req.body;

    // Validation
    if (!newPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (!otpCode) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PROVIDE_OTP
      });
    }

    // Get user with password to check for reuse
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Check if new password is same as current password
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Verify OTP
    if (!user.otpCode || !user.otpExpire) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > user.otpExpire.getTime()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.OTP_EXPIRED
      });
    }

    // Verify OTP
    if (user.otpCode !== otpCode) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.INVALID_OTP
      });
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpire = undefined;

    // Update password
    user.password = newPassword;
    await user.save();

    // Send email notification
    try {
      await emailService.sendPasswordChangedEmail({
        to: user.email,
        userName: user.name,
      });
    } catch (emailError) {
      console.error('Failed to send password change email:', emailError);
      // Don't fail the request if email fails
    }

    // Create notification
    try {
      const notification = new Notification({
        user: user._id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Password Changed Successfully',
        message: `Your password was successfully changed on ${new Date().toLocaleString()}. If you did not make this change, please contact support immediately.`,
      });
      await notification.save();

      // Send real-time notification via Socket.IO
      socketService.emitNotification(user._id.toString(), {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    } catch (notificationError) {
      console.error('Failed to create password change notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PASSWORD_CHANGED
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PROVIDE_EMAIL
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.EMAIL_NOT_FOUND
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(PASSWORD_RESET_CONFIG.TOKEN_LENGTH).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + PASSWORD_RESET_CONFIG.TOKEN_EXPIRE_TIME;

    await user.save();

    // Create reset URL - point to frontend route
    // Use FRONTEND_URL from environment if available, otherwise construct from request
    const frontendUrl = FRONTEND_CONFIG.URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

      const message = passwordResetTemplate(resetUrl, user.name);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Connect-Accel',
        message
      });

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.PASSWORD_RESET_EMAIL_SENT
      });
    } catch (error) {
      console.error('Email sending error:', error);
      console.error('Email error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Rollback token changes
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      // Return more specific error message if available
      const errorMessage = error.message || MESSAGES.EMAIL_SEND_FAILED;

      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: errorMessage
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR_PASSWORD_RESET
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.INVALID_TOKEN
      });
    }

    // Check if new password is same as current password
    const isSame = await user.comparePassword(req.body.password);
    if (isSame) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await storeRefreshToken(user._id.toString(), refreshToken);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PASSWORD_RESET_SUCCESS,
      token,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Verify OTP and activate user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // Validation
    if (!email || !otpCode) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PROVIDE_OTP
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.EMAIL_NOT_FOUND
      });
    }

    // Check if OTP exists
    if (!user.otpCode || !user.otpExpire) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.INVALID_OTP
      });
    }

    // Check if OTP is expired
    if (Date.now() > user.otpExpire.getTime()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.OTP_EXPIRED
      });
    }

    // Verify OTP
    if (user.otpCode !== otpCode) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.INVALID_OTP
      });
    }

    // Activate user and clear OTP
    user.isEmailVerified = true;
    user.status = USER_STATUS.ACTIVE;
    user.otpCode = undefined;
    user.otpExpire = undefined;

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await storeRefreshToken(user._id.toString(), refreshToken);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.OTP_VERIFIED,
      token,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PROVIDE_EMAIL
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.EMAIL_NOT_FOUND
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified && user.status === USER_STATUS.ACTIVE) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Email is already verified. You can login now.'
      });
    }

    // Generate new OTP
    const { otpCode, otpExpire } = generateOTPWithExpiry(10);

    // Update user with new OTP
    user.otpCode = otpCode;
    user.otpExpire = otpExpire;
    await user.save();

    // Send OTP email
    const otpMessage = otpVerificationTemplate(otpCode, {
      userName: user.name,
      isResend: true
    });

    try {
      await sendEmail({
        email: user.email,
        subject: 'OTP Verification - Connect-Accel',
        message: otpMessage
      });

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.OTP_RESENT
      });
    } catch (error) {
      console.error('Email sending error during OTP resend:', error);
      
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.EMAIL_SEND_FAILED
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    First-time password change (for new users created by admin)
// @route   PUT /api/auth/first-login/change-password
// @access  Private
const firstLoginChangePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // Validation
    if (!newPassword || !confirmPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'New password and confirm password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Get user with password to check for reuse
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Check if new password is same as current password
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Check if this is a first login
    if (!user.isFirstLogin) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'This endpoint is only for first-time password changes. Please use the regular password change feature.'
      });
    }

    // Update password
    user.password = newPassword;
    user.isFirstLogin = false;
    user.status = USER_STATUS.ACTIVE; // Activate the user after password change
    await user.save();

    // Send email notification
    try {
      await emailService.sendPasswordChangedEmail({
        to: user.email,
        userName: user.name,
      });
    } catch (emailError) {
      console.error('Failed to send password change email:', emailError);
      // Don't fail the request if email fails
    }

    // Create notification
    try {
      const notification = new Notification({
        user: user._id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Account Activated',
        message: `Welcome! Your account has been activated. You can now access all features.`,
      });
      await notification.save();

      // Send real-time notification via Socket.IO
      socketService.emitNotification(user._id.toString(), {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    } catch (notificationError) {
      console.error('Failed to create activation notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Password changed successfully. Your account has been activated.',
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isFirstLogin: false,
        status: user.status
      }
    });
  } catch (error) {
    console.error('First login password change error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  sendPasswordChangeOTP,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  firstLoginChangePassword
};
