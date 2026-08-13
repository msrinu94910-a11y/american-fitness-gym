const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  specs: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Facility', facilitySchema);
