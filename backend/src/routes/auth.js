const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Register: Handles form data + 4 file uploads
router.post('/register', upload.fields([
  { name: 'gstDocument', maxCount: 1 },
  { name: 'panDocument', maxCount: 1 },
  { name: 'licenseDocument', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 }
]), authController.register);

// Login: Standard email/password check
router.post('/login', authController.login);

// Get Profile: Authenticated users can fetch their own data
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;