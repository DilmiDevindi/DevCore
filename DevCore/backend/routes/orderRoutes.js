const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
  addFeedback,
  getOrderAnalytics
} = require('../controllers/orderController');
const { verifyToken, staffAndAdmin, adminOnly, allUsers } = require('../middleware/authMiddleware');

// Customer routes
router.post('/', verifyToken, allUsers, createOrder);
router.get('/my-orders', verifyToken, allUsers, getUserOrders);
router.patch('/:id/cancel', verifyToken, allUsers, cancelOrder);
router.post('/:id/feedback', verifyToken, allUsers, addFeedback);

// Staff and Admin routes
router.get('/', verifyToken, staffAndAdmin, getAllOrders);
router.patch('/:id/status', verifyToken, staffAndAdmin, updateOrderStatus);
router.patch('/:id/payment', verifyToken, staffAndAdmin, updatePaymentStatus);

// Admin routes
router.get('/analytics', verifyToken, adminOnly, getOrderAnalytics);

// Common routes
router.get('/:id', verifyToken, allUsers, getOrder);

module.exports = router;
