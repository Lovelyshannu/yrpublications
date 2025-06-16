const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memory storage
const certController = require('../controllers/certificateController');
const certificateController = require('../controllers/certificateController');
const { isAuthenticated, isAdmin } = require('../Middleware/authMiddleware');

router.get('/', certificateController.getVerifyPage);
router.post('/verify', certificateController.verifyCertificate);

router.get('/upload', isAuthenticated, isAdmin, certificateController.getUploadPage); 
router.post('/upload', isAuthenticated, isAdmin, certificateController.handleUpload); 

module.exports = router;