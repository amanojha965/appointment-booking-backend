const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  maxBookings: {
    type: Number,
    default: 1
  },
  currentBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Composite index to prevent duplicate slots
timeSlotSchema.index({ date: 1, startTime: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
