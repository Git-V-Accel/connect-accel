const express = require('express');
const router = express.Router();
const inHouseController = require('../controllers/inHouseController');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// GET /api/in-house - Get all in-house projects
router.get('/', inHouseController.getInHouseProjects);

// GET /api/in-house/stats - Get in-house project statistics
router.get('/stats', inHouseController.getInHouseStats);

// POST /api/in-house/move - Move project to in-house
router.post('/move', inHouseController.moveToInHouse);

// POST /api/in-house/assign-agent - Assign agent to in-house project
router.post('/assign-agent', inHouseController.assignAgentToInHouse);

// PUT /api/in-house/status - Update in-house project status
router.put('/status', inHouseController.updateInHouseStatus);

// DELETE /api/in-house/:inHouseId - Remove project from in-house
router.delete('/:inHouseId', inHouseController.removeFromInHouse);

// DELETE /api/in-house/by-project/:projectId - Remove project from in-house by project ID
router.delete('/by-project/:projectId', inHouseController.removeFromInHouseByProjectId);

module.exports = router;
