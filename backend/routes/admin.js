const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalUsers,
      totalServices,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      completedAppointments,
      recentAppointments
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Service.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.find()
        .populate('userId', 'name email')
        .populate('serviceId', 'name icon')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Revenue calculation
    const revenueResult = await Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Weekly appointments
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyData = await Appointment.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalServices,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        totalRevenue
      },
      recentAppointments,
      weeklyData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/appointments
// @desc    Get all appointments with filters
router.get('/appointments', async (req, res) => {
  try {
    const { status, date, serviceId, userId, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (serviceId) query.serviceId = serviceId;
    if (userId) query.userId = userId;

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: d, $lte: dEnd };
    }

    let appointments = Appointment.find(query)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name icon price duration')
      .sort({ date: -1, startTime: -1 });

    if (search) {
      // Search requires population first - simpler approach
      const userIds = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');
      query.userId = { $in: userIds };
    }

    const total = await Appointment.countDocuments(query);
    const results = await Appointment.find(query)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name icon price duration')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      appointments: results,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/appointments/:id/status
// @desc    Update appointment status
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, ...(reason ? { cancellationReason: reason } : {}) },
      { new: true }
    ).populate('userId', 'name email').populate('serviceId', 'name');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // If cancelled/rejected, free the time slot
    if (['cancelled', 'rejected'].includes(status)) {
      const TimeSlot = require('../models/TimeSlot');
      await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, {
        $inc: { currentBookings: -1 },
        isAvailable: true
      });
    }

    res.json({ message: `Appointment ${status}`, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add appointment count per user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const appointmentCount = await Appointment.countDocuments({ userId: user._id });
      return { ...user.toObject(), appointmentCount };
    }));

    res.json({
      users: usersWithStats,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/toggle
// @desc    Toggle user active status
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
