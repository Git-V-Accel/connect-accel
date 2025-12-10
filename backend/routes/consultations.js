const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getConsultations,
  assignConsultation,
} = require('../controllers/consultationController');

// All consultation routes require authentication and admin/super admin role
router.use(protect, authorize('admin', 'superadmin'));

router.get('/', getConsultations);
router.patch('/:id/assign', assignConsultation);

module.exports = router;

