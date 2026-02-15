const mongoose = require('mongoose');
const { categories } = require('../config/categories');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  category: {
    type: String,
    required: true,
    enum: categories,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
  },
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

// Compound Index: Optimize user-specific date-sorted queries & aggregations
expenseSchema.index({ user: 1, date: -1 });

// Pre-save Precision Rounding Hook (Simplified for Mongoose 9+)
expenseSchema.pre('save', function() {
  if (this.amount) {
    this.amount = Math.round(this.amount * 100) / 100;
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
