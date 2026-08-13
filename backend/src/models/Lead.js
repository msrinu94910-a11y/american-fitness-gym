const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  type: { type: String, enum: ['contact', 'trial_pass'], required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  interest: { type: String },
  message: { type: String },
  submittedAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
