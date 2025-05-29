const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certNumber: { type: String, unique: true },
  name: String,
  description: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);