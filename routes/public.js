const express = require('express');
const router = express.Router();
const Article = require('../models/article');

router.get('/documents', async (req, res) => {
  const articles = await Article.find({ isPublished: true });
  res.render('public-documents', { articles });
});

module.exports = router;
