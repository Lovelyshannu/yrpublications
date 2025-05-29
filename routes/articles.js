const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', articleController.listArticles);
router.get('/upload', isAuthenticated, articleController.getUpload);
router.post('/upload', isAuthenticated, articleController.postUpload);

module.exports = router;
