const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  day: { type: String, default: 'Monday' },
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '10-12' },
  restSeconds: { type: Number, default: 60 },
  targetMuscle: { type: String, default: 'Full Body' },
  notes: { type: String, default: '' }
});

const workoutPlanSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  trainerId: { type: String, required: true },
  title: { type: String, default: 'Custom Strength & Conditioning' },
  goal: { type: String, default: 'Muscle Gain & Fat Loss' },
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  endDate: { type: String, default: '2026-12-31' },
  exercises: [exerciseSchema],
  createdDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
