const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 15,
    comment: 'Duration in minutes'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  icon: {
    type: String,
    default: '🏥'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
