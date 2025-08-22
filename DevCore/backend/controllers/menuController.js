const MenuItem = require('../models/MenuItem');

// Get all menu items (public)
const getAllMenuItems = async (req, res) => {
  try {
    const { category, available, dietaryTags } = req.query;
    
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }
    
    if (dietaryTags) {
      filter.dietaryTags = { $in: dietaryTags.split(',') };
    }

    const menuItems = await MenuItem.find(filter).sort({ popularity: -1, name: 1 });
    
    res.json({
      success: true,
      menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single menu item
const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new menu item (staff/admin only)
const createMenuItem = async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    
    res.status(201).json({
      success: true,
      menuItem,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update menu item (staff/admin only)
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      menuItem,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete menu item (admin only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Toggle availability (staff/admin)
const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.json({
      success: true,
      menuItem,
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update daily quantity (staff/admin)
const updateDailyQuantity = async (req, res) => {
  try {
    const { dailyQuantity, remainingQuantity } = req.body;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      {
        dailyQuantity,
        remainingQuantity: remainingQuantity ?? dailyQuantity
      },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      menuItem,
      message: 'Quantities updated successfully'
    });
  } catch (error) {
    console.error('Update quantities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get menu categories
const getCategories = async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateDailyQuantity,
  getCategories
};