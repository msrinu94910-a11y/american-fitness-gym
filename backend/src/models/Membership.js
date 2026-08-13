const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  tier: { type: String, required: true },
  monthlyPrice: { type: Number, required: true },
  annualPrice: { type: Number, required: true },
  badge: { type: String },
  description: { type: String },
  popular: { type: Boolean, default: false },
  features: [{ type: String }],
  ctaText: { type: String, default: 'Get Started' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Membership', membershipSchema);
