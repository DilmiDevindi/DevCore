const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

// Signup
const signup = async (req, res) => {
  const { 
    email, 
    password, 
    role = 'student', 
    firstName, 
    lastName, 
    studentId, 
    department, 
    dietaryPreference = 'None',
    phone 
  } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required"
      });
    }

    // For students, studentId and department are required
    if (role === 'student' && (!studentId || !department)) {
      return res.status(400).json({
        success: false,
        message: "Student ID and department are required for students"
      });
    }

    // Check if studentId is unique (for students)
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      studentId: role === 'student' ? studentId : undefined,
      department,
      dietaryPreference,
      phone
    });

    await newUser.save();

    res.json({ 
      success: true,
      message: "User registered successfully" 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact administrator."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid password" 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      success: true, 
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, dietaryPreference, department } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        phone,
        dietaryPreference,
        department
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = { 
  signup, 
  login, 
  logout, 
  getProfile, 
  updateProfile 
};