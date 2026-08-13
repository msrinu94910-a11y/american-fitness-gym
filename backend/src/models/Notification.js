const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userEmail: { type: String, required: true, lowercase: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
