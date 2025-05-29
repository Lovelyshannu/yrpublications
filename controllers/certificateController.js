const Certificate = require('../models/certificate');
const path = require('path');

exports.getUploadPage = (req, res) => {
  res.render('certificate-upload');
};

exports.getVerifyPage = (req, res) => {
  res.render('certificate', { certificate: null, verified: false });
};

exports.verifyCertificate = async (req, res) => {
  const certNumber = req.body.certNumber;
  const certificate = await Certificate.findOne({ certificateNumber: certNumber });

  if (!certificate) {
    req.flash('error_msg', 'Certificate not found');
    return res.render('certificate', { certificate: null, verified: false });
  }

  res.render('certificate', { certificate, verified: true });
};

exports.uploadCertificate = async (req, res) => {
  try {
    const { certificateNumber, holderName, description } = req.body;

    if (!req.files || !req.files.certificateFile) {
      req.flash('error_msg', 'No certificate file uploaded');
      return res.redirect('/certificates/upload');
    }

    const certFile = req.files.certificateFile;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(certFile.mimetype)) {
      req.flash('error_msg', 'Allowed file types: JPG, PNG, PDF');
      return res.redirect('/certificates/upload');
    }

    // Save certificate file
    const uploadPath = path.join(__dirname, '..', 'uploads', 'certificates', certFile.name);
    await certFile.mv(uploadPath);

    const certificate = new Certificate({
      certificateNumber,
      holderName,
      description,
      filename: certFile.name,
      uploader: req.session.user.id
    });

    await certificate.save();

    req.flash('success_msg', 'Certificate uploaded successfully');
    res.redirect('/certificates/upload');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error uploading certificate');
    res.redirect('/certificates/upload');
  }
};
