const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/services
// @desc    Get all active services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/services
// @desc    Create service (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, duration, price, category, icon } = req.body;
    const service = await Service.create({ name, description, duration, price, category, icon });
    res.status(201).json({ message: 'Service created', service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Service with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
