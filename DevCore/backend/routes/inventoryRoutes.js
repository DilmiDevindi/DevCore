const express = require('express');
const router = express.Router();
const {
  getAllInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  addWastage,
  getLowStockItems,
  getWastageReport,
  getInventoryCategories
} = require('../controllers/inventoryController');
const { verifyToken, staffAndAdmin, adminOnly } = require('../middleware/authMiddleware');

// All routes require staff or admin access
router.use(verifyToken, staffAndAdmin);

router.get('/', getAllInventoryItems);
router.get('/categories', getInventoryCategories);
router.get('/low-stock', getLowStockItems);
router.get('/wastage-report', getWastageReport);
router.get('/:id', getInventoryItem);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.patch('/:id/stock', updateStock);
router.post('/:id/wastage', addWastage);

// Admin only
router.delete('/:id', adminOnly, deleteInventoryItem);

module.exports = router;
