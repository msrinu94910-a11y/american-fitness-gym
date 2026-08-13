const mongoose = require('mongoose');

const cmsContentSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CMSContent', cmsContentSchema);
