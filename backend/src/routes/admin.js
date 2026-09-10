const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin'); // Import the role-check middleware

// All routes here require the user to be logged in AND have ADMIN role
router.get('/pending', authenticateToken, isAdmin, adminController.getPendingPharmacies);
router.post('/approve/:id', authenticateToken, isAdmin, adminController.approvePharmacy);

module.exports = router;