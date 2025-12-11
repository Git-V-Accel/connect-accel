const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  getSettingsByUserId,
  updateSettings,
  updateSettingsSection,
  resetSettings
} = require('../controllers/settingsController');

// @desc    Get current user settings
// @route   GET /api/settings
// @access  Private
router.get('/', protect, getSettings);

// @desc    Get settings by user ID (admin/superadmin only)
// @route   GET /api/settings/user/:userId
// @access  Private (Admin/Superadmin)
router.get('/user/:userId', protect, authorize('admin', 'superadmin'), getSettingsByUserId);

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, updateSettings);

// @desc    Update specific settings section
// @route   PATCH /api/settings/:section
// @access  Private
router.patch('/:section', protect, updateSettingsSection);

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
router.post('/reset', protect, resetSettings);

module.exports = router;

