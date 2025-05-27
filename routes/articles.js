const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const articleController = require('../controllers/articleController');
const { ensureAdmin } = require('../Middleware/authMiddleware');

console.log(__dirname);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ dest: 'uploads/' });

// Show upload form
router.get('/upload', articleController.getUpload);

// Handle form POST with multer and controller
router.post('/upload', upload.single('articleFile'), articleController.postUpload);

// List articles
router.get('/', articleController.listArticles);

router.get('/admin/review', ensureAdmin, articleController.listPendingArticles);
router.post('/admin/approve/:id', ensureAdmin, articleController.approveArticle);
router.post('/admin/reject/:id', ensureAdmin, articleController.rejectArticle);

module.exports = router;
