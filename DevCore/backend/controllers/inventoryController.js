const Inventory = require('./models/Inventory');

// Get all inventory items
const getAllInventoryItems = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    
    let filter = {};
    if (category) {
      filter.category = category;
    }

    const inventoryItems = await Inventory.find(filter).sort({ ingredient: 1 });
    
    let filteredItems = inventoryItems;
    if (lowStock === 'true') {
      filteredItems = inventoryItems.filter(item => 
        item.currentStock <= item.minimumThreshold
      );
    }

    res.json({
      success: true,
      inventoryItems: filteredItems
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single inventory item
const getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new inventory item
const createInventoryItem = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    
    res.status(201).json({
      success: true,
      item,
      message: 'Inventory item created successfully'
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient already exists in inventory'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      item,
      message: 'Inventory item updated successfully'
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update stock level
const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
    
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    if (operation === 'add') {
      item.currentStock += quantity;
      item.lastRestocked = new Date();
    } else if (operation === 'subtract') {
      if (item.currentStock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
      item.currentStock -= quantity;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use "add" or "subtract"'
      });
    }

    await item.save();

    res.json({
      success: true,
      item,
      message: `Stock ${operation === 'add' ? 'added' : 'reduced'} successfully`
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add wastage record
const addWastage = async (req, res) => {
  try {
    const { quantity, reason, notes } = req.body;
    
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    if (item.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Cannot record wastage more than current stock'
      });
    }

    item.wastage.push({
      quantity,
      reason,
      notes
    });

    item.currentStock -= quantity;
    await item.save();

    res.json({
      success: true,
      item,
      message: 'Wastage recorded successfully'
    });
  } catch (error) {
    console.error('Add wastage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$currentStock', '$minimumThreshold'] }
    }).sort({ currentStock: 1 });

    res.json({
      success: true,
      lowStockItems
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get wastage report
const getWastageReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchStage = {};
    if (startDate && endDate) {
      matchStage = {
        'wastage.date': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const wastageReport = await Inventory.aggregate([
      { $unwind: '$wastage' },
      { $match: matchStage },
      {
        $group: {
          _id: {
            ingredient: '$ingredient',
            reason: '$wastage.reason'
          },
          totalWastage: { $sum: '$wastage.quantity' },
          unit: { $first: '$unit' },
          costPerUnit: { $first: '$costPerUnit' }
        }
      },
      {
        $addFields: {
          totalCost: { $multiply: ['$totalWastage', '$costPerUnit'] }
        }
      },
      {
        $group: {
          _id: '$_id.ingredient',
          totalWastage: { $sum: '$totalWastage' },
          totalCost: { $sum: '$totalCost' },
          unit: { $first: '$unit' },
          reasonBreakdown: {
            $push: {
              reason: '$_id.reason',
              quantity: '$totalWastage',
              cost: '$totalCost'
            }
          }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    const totalWastageCost = wastageReport.reduce((sum, item) => sum + item.totalCost, 0);

    res.json({
      success: true,
      wastageReport,
      totalWastageCost
    });
  } catch (error) {
    console.error('Get wastage report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get inventory categories
const getInventoryCategories = async (req, res) => {
  try {
    const categories = await Inventory.distinct('category');
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get inventory categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};