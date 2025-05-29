const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', certificateController.getVerifyPage);
router.post('/verify', certificateController.verifyCertificate);

router.get('/upload', isAuthenticated, isAdmin, certificateController.getUploadPage);
router.post('/upload', isAuthenticated, isAdmin, certificateController.uploadCertificate);

module.exports = router;
