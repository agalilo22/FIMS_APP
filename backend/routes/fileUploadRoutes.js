// backend/routes/fileUploadRoutes.js
const express = require('express');
const router = express.Router();
const fileUploadController = require('../controllers/fileUploadController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All file routes require authentication
router.use(protect);

// Upload file (only admins/analysts can upload)
router.post('/upload', authorize(['admin', 'analyst']), fileUploadController.uploadMiddleware, fileUploadController.uploadFile);

// Delete file (only admins can delete)
router.post('/delete', authorize(['admin']), fileUploadController.deleteFile);

// Get pre-signed URL (all authorized users can get)
router.get('/signed-url', authorize(['admin', 'analyst', 'viewer']), fileUploadController.getSignedFileUrl);

module.exports = router;