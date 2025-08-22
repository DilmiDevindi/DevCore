const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, adminOnly } = require('../middleware/authMiddleware');

// Get all users (admin only)
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { role, department, active } = req.query;
    
    let filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (active !== undefined) filter.isActive = active === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle user status (admin only)
router.patch('/:id/status', verifyToken, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', verifyToken, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
