const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { isAuthenticated, isAdmin } = require('../Middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const Article = require('../models/article');

router.get('/view/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('uploader');

    if (!article || article.status !== 'approved') {
      req.flash('error_msg', 'This article is not available for viewing.');
      return res.redirect('/articles');
    }

    res.render('view-article', { article, user: req.session.user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while loading the article.');
    res.redirect('/articles');
  }
});

router.get('/:id', articleController.viewArticle); // 👈 Make sure this is after all specific routes
router.get('/upload', isAuthenticated, articleController.getUpload);
router.post('/upload', isAuthenticated, articleController.postUpload);
router.post('/articles/:id/decline', isAuthenticated, isAdmin, adminController.declineArticle);

module.exports = router;
