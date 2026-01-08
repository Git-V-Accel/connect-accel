const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getConsultations,
  assignConsultation,
  completeConsultation,
  cancelConsultation,
  undoCancelConsultation,
} = require('../controllers/consultationController');

// All consultation routes require authentication and admin/super admin role
router.use(protect, authorize('admin', 'superadmin'));

router.get('/', getConsultations);
router.patch('/:id/assign', assignConsultation);
router.patch('/:id/complete', completeConsultation);
router.patch('/:id/cancel', cancelConsultation);
router.patch('/:id/undo-cancel', undoCancelConsultation);

module.exports = router;

