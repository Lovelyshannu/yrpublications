const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  fileData: Buffer,
  fileMimeType: String,
  filename: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ✅ Replace this:
  // isApproved: { type: Boolean, default: false },

  // ✅ With this:
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },

  isDeclined: {
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
