const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Service = require('./models/Service');
const TimeSlot = require('./models/TimeSlot');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-booking';

const services = [
  { name: 'General Checkup', description: 'Full body health checkup with doctor consultation', duration: 30, price: 500, category: 'Medical', icon: '🏥' },
  { name: 'Dental Cleaning', description: 'Professional dental cleaning and examination', duration: 45, price: 800, category: 'Dental', icon: '🦷' },
  { name: 'Eye Examination', description: 'Comprehensive eye test and vision assessment', duration: 30, price: 600, category: 'Ophthalmology', icon: '👁️' },
  { name: 'Hair Cut & Style', description: 'Professional haircut with styling and finishing', duration: 60, price: 400, category: 'Salon', icon: '💇' },
  { name: 'Deep Tissue Massage', description: 'Relaxing full-body deep tissue massage therapy', duration: 60, price: 1200, category: 'Wellness', icon: '💆' },
  { name: 'Yoga Session', description: 'One-on-one personalized yoga and meditation session', duration: 60, price: 700, category: 'Fitness', icon: '🧘' },
  { name: 'Nutrition Consultation', description: 'Personalized diet plan and nutrition guidance', duration: 45, price: 900, category: 'Medical', icon: '🥗' },
  { name: 'Physiotherapy', description: 'Professional physiotherapy for pain relief and recovery', duration: 45, price: 1000, category: 'Medical', icon: '🩺' },
];

const timeSlotTimes = [
  { startTime: '09:00', endTime: '09:30' },
  { startTime: '09:30', endTime: '10:00' },
  { startTime: '10:00', endTime: '10:30' },
  { startTime: '10:30', endTime: '11:00' },
  { startTime: '11:00', endTime: '11:30' },
  { startTime: '11:30', endTime: '12:00' },
  { startTime: '14:00', endTime: '14:30' },
  { startTime: '14:30', endTime: '15:00' },
  { startTime: '15:00', endTime: '15:30' },
  { startTime: '15:30', endTime: '16:00' },
  { startTime: '16:00', endTime: '16:30' },
  { startTime: '16:30', endTime: '17:00' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Service.deleteMany(), TimeSlot.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bookease.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210'
    });
    console.log('👤 Admin created:', admin.email);

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: 'user@bookease.com',
      password: 'user123',
      role: 'user',
      phone: '+91 87654 32109'
    });
    console.log('👤 Demo user created:', user.email);

    // Create services
    const createdServices = await Service.insertMany(services);
    console.log(`🏥 Created ${createdServices.length} services`);

    // Create time slots for next 10 weekdays
    const slots = [];
    let dayCount = 0;
    let date = new Date();

    while (dayCount < 10) {
      date = new Date(date);
      date.setDate(date.getDate() + 1);

      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

      for (const time of timeSlotTimes) {
        slots.push({
          date: new Date(date),
          startTime: time.startTime,
          endTime: time.endTime,
          isAvailable: true,
          maxBookings: 1,
          currentBookings: 0
        });
      }
      dayCount++;
    }

    await TimeSlot.insertMany(slots);
    console.log(`⏰ Created ${slots.length} time slots for next 10 weekdays`);

    console.log('\n🎉 Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin  → admin@bookease.com / admin123');
    console.log('User   → user@bookease.com  / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
