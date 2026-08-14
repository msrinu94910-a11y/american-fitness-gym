const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userId: { type: String },
  memberName: { type: String, required: true },
  email: { type: String, lowercase: true, default: 'member@americanfitness.com' },
  photo: { type: String },
  membershipId: { type: String },
  membershipPlan: { type: String },
  checkInTime: { type: String, default: () => new Date().toISOString() },
  date: { type: String },
  time: { type: String },
  zone: { type: String, default: 'Main Turnstile Gate A' },
  gate: { type: String, default: 'Gate A - Turnstile 1' },
  scannedBy: { type: String, default: 'Admin Verification Officer' },
  method: { type: String, default: 'Digital QR Verification' },
  status: { type: String, default: 'GRANTED_ENTRY' },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);

