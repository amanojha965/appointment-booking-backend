const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeSlot');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/timeslots
// @desc    Get available time slots for a date & service
router.get('/', async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    const query = { isAvailable: true };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (serviceId) {
      query.$or = [{ serviceId: null }, { serviceId }];
    }

    const slots = await TimeSlot.find(query).sort({ startTime: 1 });
    
    // Filter out fully booked slots
    const availableSlots = slots.filter(slot => slot.currentBookings < slot.maxBookings);
    
    res.json({ slots: availableSlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/timeslots/all (admin - all slots)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { date } = req.query;
    const query = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const slots = await TimeSlot.find(query).populate('serviceId', 'name').sort({ date: 1, startTime: 1 });
    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/timeslots
// @desc    Create time slot (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { date, startTime, endTime, serviceId, maxBookings } = req.body;
    const slot = await TimeSlot.create({ date, startTime, endTime, serviceId, maxBookings });
    res.status(201).json({ message: 'Time slot created', slot });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Time slot already exists for this date/time/service' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/timeslots/bulk
// @desc    Create bulk time slots for a date range (admin)
router.post('/bulk', protect, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, times, serviceId, maxBookings } = req.body;
    const slots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      
      for (const time of times) {
        slots.push({
          date: new Date(d),
          startTime: time.startTime,
          endTime: time.endTime,
          serviceId: serviceId || null,
          maxBookings: maxBookings || 1
        });
      }
    }

    const created = await TimeSlot.insertMany(slots, { ordered: false }).catch(err => {
      if (err.code === 11000) return { insertedCount: 'some' };
      throw err;
    });

    res.status(201).json({ message: `Time slots created successfully`, count: slots.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/timeslots/:id
// @desc    Update time slot (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const slot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot updated', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/timeslots/:id
// @desc    Delete time slot (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const slot = await TimeSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
