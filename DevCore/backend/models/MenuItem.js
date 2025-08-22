const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Main Course', 'Short Eats', 'Beverages', 'Desserts'],
    required: true
  },
  image: {
    type: String // URL to image
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  ingredients: [{
    type: String
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  dietaryTags: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Halal', 'Spicy', 'Contains Nuts']
  }],
  popularity: {
    type: Number,
    default: 0
  },
  dailyQuantity: {
    type: Number,
    default: 100
  },
  remainingQuantity: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
module.exports = MenuItem;