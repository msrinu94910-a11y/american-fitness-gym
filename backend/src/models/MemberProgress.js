const mongoose = require('mongoose');

const memberProgressSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  trainerId: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  weightKg: { type: Number, required: true },
  bodyFatPercent: { type: Number, default: 18 },
  muscleMassKg: { type: Number, default: 35 },
  notes: { type: String, default: 'Progress tracking update' }
}, {
  timestamps: true
});

module.exports = mongoose.model('MemberProgress', memberProgressSchema);
