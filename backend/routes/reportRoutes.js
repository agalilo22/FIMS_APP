// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only admins and analysts can generate reports
router.get('/client-financials-csv', protect, authorize(['admin', 'analyst']), reportController.generateClientFinancialsCsv);

module.exports = router;