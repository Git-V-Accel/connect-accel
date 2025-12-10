const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  sendPasswordChangeOTP,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', refreshToken);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logout);

// @desc    Send OTP for password change
// @route   POST /api/auth/change-password/send-otp
// @access  Private
router.post('/change-password/send-otp', protect, sendPasswordChangeOTP);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, changePassword);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', forgotPassword);

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put('/reset-password/:resettoken', resetPassword);

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', verifyOTP);

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', resendOTP);

module.exports = router;
