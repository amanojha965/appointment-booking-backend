const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
