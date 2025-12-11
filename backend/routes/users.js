const express = require('express');
const { protect, authorize, isSuperadmin } = require('../middleware/auth');
const {
  getMe,
  updateProfile,
  deleteAccount,
  getAllUsers,
  getClients,
  getFreelancers,
  getAdmins,
  getUserById,
  updateUserRole,
  updateUserStatus,
  updateUser,
  createUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, deleteAccount);

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin+Superadmin)
router.post('/', protect, authorize('admin', 'superadmin'), createUser);

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin+Superadmin)
router.get('/', protect, authorize('admin', 'superadmin'), getAllUsers);

// @desc    Get freelancers (summary)
// @route   GET /api/users/freelancers
// @access  Private (Admin+Superadmin)
router.get(
  '/freelancers',
  protect,
  authorize('admin', 'superadmin'),
  getFreelancers
);

// @desc    Get clients (summary)
// @route   GET /api/users/clients
// @access  Private (Admin+Superadmin)
router.get(
  '/clients',
  protect,
  authorize('admin', 'superadmin'),
  getClients
);

// @desc    Get admins (summary)
// @route   GET /api/users/admins
// @access  Private (Admin+Superadmin)
router.get(
  '/admins',
  protect,
  authorize('admin', 'superadmin'),
  getAdmins
);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin+Superadmin)
router.get('/:id', protect, authorize('admin', 'superadmin'), getUserById);

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Superadmin
router.put('/:id/role', protect, isSuperadmin, updateUserRole);

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private/Superadmin
router.put('/:id/status', protect, isSuperadmin, updateUserStatus);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Superadmin
router.put('/:id', protect, isSuperadmin, updateUser);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
router.delete('/:id', protect, isSuperadmin, deleteUser);

module.exports = router;
