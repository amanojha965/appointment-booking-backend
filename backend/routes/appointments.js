const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const TimeSlot = require('../models/TimeSlot');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get user's appointments
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('serviceId', 'name description duration price icon')
      .populate('timeSlotId', 'startTime endTime')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('serviceId')
      .populate('timeSlotId')
      .populate('userId', 'name email phone');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Book appointment
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId, timeSlotId, notes } = req.body;

    // Check service exists
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Service not found or inactive' });
    }

    // Check slot exists and is available
    const slot = await TimeSlot.findById(timeSlotId);
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    if (slot.currentBookings >= slot.maxBookings) {
      return res.status(400).json({ message: 'Time slot is fully booked' });
    }

    // Check user doesn't already have appointment at same time
    const existing = await Appointment.findOne({
      userId: req.user._id,
      date: slot.date,
      startTime: slot.startTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have an appointment at this time' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId: req.user._id,
      serviceId,
      timeSlotId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes,
      totalPrice: service.price
    });

    // Update slot booking count
    await TimeSlot.findByIdAndUpdate(timeSlotId, {
      $inc: { currentBookings: 1 },
      ...(slot.currentBookings + 1 >= slot.maxBookings ? { isAvailable: false } : {})
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('serviceId', 'name description duration price icon')
      .populate('timeSlotId');

    res.status(201).json({ message: 'Appointment booked successfully!', appointment: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${appointment.status} appointment` });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || 'Cancelled by user';
    await appointment.save();

    // Re-open time slot
    await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, {
      $inc: { currentBookings: -1 },
      isAvailable: true
    });

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule appointment
router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const { newTimeSlotId } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot reschedule this appointment' });
    }

    const newSlot = await TimeSlot.findById(newTimeSlotId);
    if (!newSlot || !newSlot.isAvailable || newSlot.currentBookings >= newSlot.maxBookings) {
      return res.status(400).json({ message: 'New time slot not available' });
    }

    // Release old slot
    await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, {
      $inc: { currentBookings: -1 },
      isAvailable: true
    });

    // Update appointment
    const oldSlotId = appointment.timeSlotId;
    appointment.timeSlotId = newTimeSlotId;
    appointment.date = newSlot.date;
    appointment.startTime = newSlot.startTime;
    appointment.endTime = newSlot.endTime;
    appointment.status = 'pending';
    await appointment.save();

    // Book new slot
    await TimeSlot.findByIdAndUpdate(newTimeSlotId, {
      $inc: { currentBookings: 1 }
    });

    res.json({ message: 'Appointment rescheduled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
