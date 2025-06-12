const Article = require('../models/article');
const path = require('path');
const fs = require('fs');

// List all approved articles (for user view)
exports.listArticles = async (req, res) => {
  let query = { status: 'approved' };

  if (req.query.search) {
    const search = req.query.search;
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }

  const articles = await Article.find(query).sort({ createdAt: -1 });
  res.render('articles', {
    articles,
    user: req.session.user,
    active: 'articles'  // 👈 include this if nav uses it
  });
};

// Upload page
exports.getUpload = (req, res) => {
  res.render('upload', { active: 'articles' });
};

// Handle article upload
exports.postUpload = async (req, res) => {
  try {
    const { title, author, description } = req.body;

    if (!req.files || !req.files.articleFile) {
      req.flash('error_msg', 'No article file uploaded');
      return res.redirect('/articles/upload');
    }

    const articleFile = req.files.articleFile;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(articleFile.mimetype)) {
      req.flash('error_msg', 'Only PDF or DOCX files are allowed');
      return res.redirect('/articles/upload');
    }

    const uploadDir = path.join(__dirname, '..', 'uploads', 'articles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, articleFile.name);
    await articleFile.mv(uploadPath);

    const newArticle = new Article({
      title,
      author,
      description,
      filename: articleFile.name,
      filePath: '/uploads/articles/' + articleFile.name,
      uploader: req.session.user._id,
      status: 'pending' // 👈 use the enum field instead
    });

    await newArticle.save();

    req.flash('success_msg', 'Article uploaded successfully! Awaiting admin approval.');
    res.redirect('/articles/upload');

  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Upload failed. Try again.');
    res.redirect('/articles/upload');
  }
};

// Decline article
exports.declineArticle = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    req.flash('error_msg', 'Article not found');
    return res.redirect('/admin/articles');
  }

  article.status = 'declined';
  await article.save();

  req.flash('success_msg', 'Article declined');
  res.redirect('/admin/articles');
};

// View individual approved article
exports.viewArticle = async (req, res) => {
  const article = await Article.findById(req.params.id).populate('uploader');

  if (!article || article.status !== 'approved') {
    req.flash('error_msg', 'Article not found or not approved.');
    return res.redirect('/articles');
  }

  res.render('view-article', {
    article,
    user: req.session.user,
    active: 'articles'
  });
};
