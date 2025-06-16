const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  number: { type: String, unique: true },
  recipientName: String,
  issueDate: Date,
  fileData: Buffer,
  fileMimeType: String,
  fileName: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);
