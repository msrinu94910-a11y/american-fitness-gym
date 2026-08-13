const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  readTime: { type: String, default: '5 min read' },
  summary: { type: String },
  image: { type: String },
  content: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
