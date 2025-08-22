const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateDailyQuantity,
  getCategories
} = require('../controllers/menuController');
const { verifyToken, staffAndAdmin, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItem);

// Staff and Admin routes
router.post('/', verifyToken, staffAndAdmin, createMenuItem);
router.put('/:id', verifyToken, staffAndAdmin, updateMenuItem);
router.patch('/:id/availability', verifyToken, staffAndAdmin, toggleAvailability);
router.patch('/:id/quantity', verifyToken, staffAndAdmin, updateDailyQuantity);

// Admin only routes
router.delete('/:id', verifyToken, adminOnly, deleteMenuItem);

module.exports = router;
