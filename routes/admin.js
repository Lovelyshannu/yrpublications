const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const adminController = require('../controllers/adminController');
const { isAdmin, isAuthenticated } = require('../Middleware/authMiddleware');
const Article = require('../models/article');

// Admin dashboard
router.get('/', isAuthenticated, isAdmin, adminController.dashboard);

// Admin users list
router.get('/users', isAuthenticated, isAdmin, adminController.listUsers);

// Admin articles page
router.get('/articles', isAuthenticated, isAdmin, adminController.listArticles);

// Approve article
router.post('/articles/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
  await Article.findByIdAndUpdate(req.params.id, { status: 'approved' });
  req.flash('success_msg', 'Article approved');
  res.redirect('/admin/articles');
});

// Decline article
router.post('/articles/:id/decline', isAuthenticated, isAdmin, async (req, res) => {
  await Article.findByIdAndUpdate(req.params.id, { status: 'declined' });
  req.flash('error_msg', 'Article declined');
  res.redirect('/admin/articles');
});

// Certificates management
router.get('/certificates', isAuthenticated, isAdmin, adminController.listCertificates);

// Download articles
router.get('/download/:id', isAuthenticated, isAdmin, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send('Not found');

  res.set({
    'Content-Type': article.fileMimeType,
    'Content-Disposition': `attachment; filename="${article.fileName}"`
  });
  res.send(article.fileData);
});


router.get('/download/:filename', async (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', 'articles', req.params.filename);
  res.download(filePath, err => {
    if (err) {
      console.error(err);
      req.flash('error_msg', 'Error downloading file');
      res.redirect('/articles');
    }
  });
});


// Optional: Invoice route
router.get('/invoice/:articleId', isAuthenticated, isAdmin, adminController.generateInvoice);

// Fallback admin checker
function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = router;
