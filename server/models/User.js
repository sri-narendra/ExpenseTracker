const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  settings: {
    budgetLimits: {
      type: Map,
      of: Number,
      default: {},
    }
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, flattenMaps: true },
  toObject: { virtuals: true, flattenMaps: true }
});

module.exports = mongoose.model('User', userSchema);
