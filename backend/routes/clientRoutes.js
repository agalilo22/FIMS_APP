// backend/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all client routes
router.use(protect);

// CRUD operations
router.post('/', authorize(['admin', 'analyst']), clientController.createClient);
router.get('/', authorize(['admin', 'analyst', 'viewer']), clientController.getClients);
router.get('/:id', authorize(['admin', 'analyst', 'viewer']), clientController.getClientById);
router.put('/:id', authorize(['admin', 'analyst']), clientController.updateClient);
router.delete('/:id', authorize(['admin']), clientController.deleteClient); // Only admins can delete

module.exports = router;