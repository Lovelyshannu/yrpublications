const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  filename: String,
  filePath: String,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ✅ Replace this:
  // isApproved: { type: Boolean, default: false },

  // ✅ With this:
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('article', articleSchema);
