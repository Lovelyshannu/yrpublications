const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin, isAuthenticated } = require('../Middleware/authMiddleware');

router.get('/', isAuthenticated, isAdmin, adminController.dashboard);

router.get('/users', isAuthenticated, isAdmin, adminController.listUsers);
router.get('/articles', isAuthenticated, isAdmin, adminController.listArticles);
router.post('/articles/:id/approve', isAuthenticated, isAdmin, adminController.approveArticle);
router.get('/certificates', isAuthenticated, isAdmin, adminController.listCertificates);

// Invoice generation endpoint example
router.get('/invoice/:articleId', isAuthenticated, isAdmin, adminController.generateInvoice);

router.get('/download/:filename', isAuthenticated, isAdmin, (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', 'articles', req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      req.flash('error_msg', 'File not found');
      return res.redirect('/admin/articles');
    }

    res.download(filePath);
  });
});

module.exports = router;
