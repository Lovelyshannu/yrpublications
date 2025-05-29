const Article = require('../models/article');
const path = require('path');
const fs = require('fs');

exports.listArticles = async (req, res) => {
  let query = { isApproved: true }; // 🔥 Only approved

  if (req.query.search) {
    const search = req.query.search;
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }

  const articles = await Article.find(query).sort({ createdAt: -1 });
  res.render('articles', { articles, search: req.query.search || '' });
};


exports.getUpload = (req, res) => {
  res.render('upload');
};

exports.postUpload = async (req, res) => {
  try {
    const { title, author, description } = req.body;
    if (!req.files || !req.files.articleFile) {
      req.flash('error_msg', 'No file uploaded');
      return res.redirect('/articles/upload');
    }

    const articleFile = req.files.articleFile;
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(articleFile.mimetype)) {
      req.flash('error_msg', 'Only PDF or Word documents are allowed');
      return res.redirect('/articles/upload');
    }

    // Save file
    const uploadPath = path.join(__dirname, '..', 'uploads', 'articles', articleFile.name);
    await articleFile.mv(uploadPath);

    // Save in DB
    const article = new Article({
      title,
      author,
      description,
      filename: articleFile.name,
      uploader: req.session.user.id
    });

    await article.save();

    req.flash('success_msg', 'Article uploaded successfully!');
    res.redirect('/articles');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error during upload');
    res.redirect('/articles/upload');
  }
};
