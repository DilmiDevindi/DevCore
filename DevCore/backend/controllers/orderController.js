const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      orderType = 'dine-in',
      paymentMethod = 'cash',
      scheduledTime,
      tableNumber,
      specialRequests
    } = req.body;

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item not found: ${item.menuItem}`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }

      if (menuItem.remainingQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${menuItem.name}. Available: ${menuItem.remainingQuantity}`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions
      });

      // Update remaining quantity
      menuItem.remainingQuantity -= item.quantity;
      menuItem.popularity += item.quantity;
      await menuItem.save();
    }

    // Calculate estimated ready time
    const maxPrepTime = Math.max(...(await MenuItem.find({
      _id: { $in: items.map(item => item.menuItem) }
    }).select('preparationTime'))).map(item => item.preparationTime);

    const estimatedReadyTime = new Date(Date.now() + (maxPrepTime + 10) * 60000); // Add 10 min buffer

    const order = new Order({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      orderType,
      paymentMethod,
      scheduledTime,
      estimatedReadyTime,
      tableNumber,
      specialRequests
    });

    await order.save();
    await order.populate([
      { path: 'customer', select: 'firstName lastName email studentId' },
      { path: 'items.menuItem', select: 'name price image' }
    ]);

    // Generate QR code for express pickup
    if (orderType === 'takeaway') {
      order.qrCode = `QR${order.orderNumber}`;
      await order.save();
    }

    res.status(201).json({
      success: true,
      order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    let filter = { customer: req.user.id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate([
        { path: 'items.menuItem', select: 'name price image' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all orders (staff/admin)
const getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      orderType, 
      paymentStatus, 
      date, 
      limit = 50, 
      page = 1 
    } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter)
      .populate([
        { path: 'customer', select: 'firstName lastName email studentId department' },
        { path: 'items.menuItem', select: 'name price image' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'customer', select: 'firstName lastName email studentId department phone' },
        { path: 'items.menuItem', select: 'name price image description' }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is staff/admin
    if (req.user.role === 'student' || req.user.role === 'lecturer') {
      if (order.customer._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update order status (staff/admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, actualReadyTime } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    if (status === 'ready' && actualReadyTime) {
      order.actualReadyTime = new Date(actualReadyTime);
    }
    
    if (status === 'completed') {
      order.actualReadyTime = order.actualReadyTime || new Date();
    }

    await order.save();
    await order.populate([
      { path: 'customer', select: 'firstName lastName email' },
      { path: 'items.menuItem', select: 'name price' }
    ]);

    res.json({
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is staff/admin
    if (req.user.role === 'student' || req.user.role === 'lecturer') {
      if (order.customer.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    if (order.status === 'preparing' || order.status === 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that is being prepared or ready'
      });
    }

    order.status = 'cancelled';
    
    // Restore menu item quantities
    for (const item of order.items) {
      await MenuItem.findByIdAndUpdate(
        item.menuItem,
        { $inc: { remainingQuantity: item.quantity } }
      );
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update payment status (staff/admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    ).populate([
      { path: 'customer', select: 'firstName lastName' },
      { path: 'items.menuItem', select: 'name price' }
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add rating and feedback
const addFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed orders'
      });
    }

    order.rating = rating;
    order.feedback = feedback;
    await order.save();

    res.json({
      success: true,
      message: 'Feedback added successfully'
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get order analytics (admin)
const getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Daily sales
    const dailySales = await Order.aggregate([
      { $match: { ...matchStage, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Popular items
    const popularItems = await Order.aggregate([
      { $match: { ...matchStage, status: { $ne: 'cancelled' } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem"
        }
      },
      { $unwind: "$menuItem" },
      {
        $project: {
          name: "$menuItem.name",
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Status distribution
    const statusDistribution = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by payment method
    const paymentMethodRevenue = await Order.aggregate([
      { $match: { ...matchStage, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: "$paymentMethod",
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        dailySales,
        popularItems,
        statusDistribution,
        paymentMethodRevenue
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
  addFeedback,
  getOrderAnalytics
};