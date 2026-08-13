const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  phone: { type: String, default: '(555) 000-0000' },
  membershipPlan: { type: String, default: 'Pro Athlete VIP' },
  membershipId: { type: String },
  qrCode: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, default: 'ACTIVE_MEMBER' },
  joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  expiryDate: { type: String, default: '2027-12-31' },
  emergencyContact: { type: String, default: 'Not provided' },
  fitnessGoal: { type: String, default: 'General Health & Fitness' },
  totalCheckIns: { type: Number, default: 1 },
  rewardPoints: { type: Number, default: 100 },
  workoutStreakDays: { type: Number, default: 1 },
  lastNoticeSent: { type: String },
  noticeCount: { type: Number, default: 0 },
  lastNoticeDetails: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
