const mongoose = require('mongoose');

const PlagCertSchema = new mongoose.Schema({
  certId: String,
  score: Number,
  filePath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlagiarismCert', PlagCertSchema);
