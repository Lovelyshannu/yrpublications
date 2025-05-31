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
      req.flash('error_msg', 'No article file uploaded');
      return res.redirect('/articles/upload');
    }

    const articleFile = req.files.articleFile;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(articleFile.mimetype)) {
      req.flash('error_msg', 'Only PDF or DOCX files are allowed');
      return res.redirect('/articles/upload');
    }

    const uploadPath = path.join(__dirname, '..', 'uploads', 'articles', articleFile.name);
    await articleFile.mv(uploadPath);

    const newArticle = new Article({
      title,
      author,
      description,
      filename: articleFile.name,
      filePath: '/uploads/articles/' + articleFile.name,
      uploader: req.session.user._id,
      isApproved: false
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
