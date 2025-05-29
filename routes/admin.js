const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, isAdmin, adminController.dashboard);

router.get('/users', isAuthenticated, isAdmin, adminController.listUsers);
router.get('/articles', isAuthenticated, isAdmin, adminController.listArticles);
router.post('/articles/:id/approve', isAuthenticated, isAdmin, adminController.approveArticle);
router.get('/certificates', isAuthenticated, isAdmin, adminController.listCertificates);

// Invoice generation endpoint example
router.get('/invoice/:articleId', isAuthenticated, isAdmin, adminController.generateInvoice);

module.exports = router;
