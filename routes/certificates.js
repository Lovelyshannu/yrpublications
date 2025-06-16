const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memory storage
const certController = require('../controllers/certificateController');

router.get('/', certificateController.getVerifyPage);
router.post('/verify', certificateController.verifyCertificate);

router.get('/upload', isAuthenticated, isAdmin, certificateController.getUploadPage);
router.post('/upload', upload.single('certificateFile'), certController.uploadCertificate);

module.exports = router;
