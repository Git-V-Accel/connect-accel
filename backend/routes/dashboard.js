const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  getSuperAdminDashboard,
  getAdminDashboard,
  getAgentDashboard,
  getClientDashboard,
  getFreelancerDashboard,
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(protect);

// Role-specific dashboards
router.get('/superadmin', authorize('superadmin'), getSuperAdminDashboard);
router.get('/admin', authorize('admin', 'superadmin'), getAdminDashboard);
router.get('/agent', authorize('agent'), getAgentDashboard);
router.get('/client', authorize('client'), getClientDashboard);
router.get('/freelancer', authorize('freelancer'), getFreelancerDashboard);

module.exports = router;
