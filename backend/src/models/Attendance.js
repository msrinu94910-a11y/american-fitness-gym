const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  memberName: { type: String, required: true },
  email: { type: String, lowercase: true, default: 'member@americanfitness.com' },
  membershipId: { type: String },
  membershipPlan: { type: String },
  checkInTime: { type: String, default: () => new Date().toISOString() },
  date: { type: String },
  time: { type: String },
  zone: { type: String, default: 'Main Turnstile Gate A' },
  gate: { type: String },
  scannedBy: { type: String },
  method: { type: String, default: 'Digital Mobile QR' },
  status: { type: String, default: 'Active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
