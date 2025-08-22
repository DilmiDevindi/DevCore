const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true,
    unique: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'liters', 'pieces', 'packets'],
    required: true
  },
  minimumThreshold: {
    type: Number,
    required: true,
    default: 5
  },
  maximumCapacity: {
    type: Number,
    required: true
  },
  costPerUnit: {
    type: Number,
    required: true
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['Vegetables', 'Meat', 'Dairy', 'Grains', 'Beverages', 'Condiments', 'Others'],
    required: true
  },
  dailyUsage: {
    type: Number,
    default: 0
  },
  wastage: [{
    date: {
      type: Date,
      default: Date.now
    },
    quantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      enum: ['expired', 'damaged', 'spoiled', 'overcooked', 'other']
    },
    notes: String
  }]
}, {
  timestamps: true
});

const Inventory = mongoose.model('Inventory', InventorySchema);
module.exports = Inventory;