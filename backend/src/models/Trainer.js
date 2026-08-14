const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userId: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '(555) 000-0000' },
  specialization: { type: String, default: 'General Fitness & Strength' },
  experienceYears: { type: Number, default: 3 },
  bio: { type: String, default: 'Certified Elite Fitness Trainer passionate about helping members achieve peak performance.' },
  profileImage: { type: String, default: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  assignedMembers: [{ type: String }] // Array of User IDs
}, {
  timestamps: true
});

module.exports = mongoose.model('Trainer', trainerSchema);
