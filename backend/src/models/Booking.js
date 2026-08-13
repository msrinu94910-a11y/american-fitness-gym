const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userId: { type: String },
  userEmail: { type: String, lowercase: true, index: true },
  classId: { type: String },
  className: { type: String },
  trainer: { type: String },
  instructor: { type: String, default: 'Master Trainer' },
  timeSlot: { type: String },
  date: { type: String },
  time: { type: String },
  day: { type: String },
  room: { type: String },
  category: { type: String, default: 'General' },
  status: { type: String, default: 'CONFIRMED' },
  qrToken: { type: String },
  bookedAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
