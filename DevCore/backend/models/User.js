const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'student', 'lecturer'],
    default: 'student'
  },
  studentId: {
    type: String,
    sparse: true // Only for students
  },
  department: {
    type: String,
    enum: ['ICT', 'ET', 'BST', 'Other']
  },
  dietaryPreference: {
    type: String,
    enum: ['None', 'Vegetarian', 'Vegan', 'Halal'],
    default: 'None'
  },
  phone: {
    type: String
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  averageDailySpend: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
module.exports = User;