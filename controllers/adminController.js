const User = require('../models/user');
const Article = require('../models/article');
const Certificate = require('../models/certificate');
const Invoice = require('../models/invoice');

exports.dashboard = async (req, res) => {
  const userCount = await User.countDocuments();
  const articleCount = await Article.countDocuments();
  const certificateCount = await Certificate.countDocuments();

  res.render('admin', { userCount, articleCount, certificateCount });
};

exports.listUsers = async (req, res) => {
  const users = await User.find();
  res.render('admin-users', { users });
};

exports.listArticles = async (req, res) => {
  const articles = await Article.find().populate('uploader');
  res.render('admin-articles', { articles });
};

// Approve article
exports.approveArticle = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    req.flash('error_msg', 'Article not found');
    return res.redirect('/admin/articles');
  }

  article.isApproved = true;
  await article.save();

  req.flash('success_msg', 'Article approved and now visible publicly');
  res.redirect('/admin/articles');
};


// Publish article
exports.publishArticle = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article || !article.isApproved) {
    req.flash('error_msg', 'Article must be approved first');
    return res.redirect('/admin/articles');
  }

  article.isPublished = true;
  await article.save();
  req.flash('success_msg', 'Article published to public portal');
  res.redirect('/admin/articles');
};


exports.listCertificates = async (req, res) => {
  const certificates = await Certificate.find().populate('uploader');
  res.render('admin-certificates', { certificates });
};

exports.generateInvoice = async (req, res) => {
  const articleId = req.params.articleId;
  const article = await Article.findById(articleId).populate('uploader');

  if (!article) {
    req.flash('error_msg', 'Article not found');
    return res.redirect('/admin/articles');
  }

  // For demo, price is fixed or you can calculate dynamically
  const price = 1000;

  let invoice = await Invoice.findOne({ article: articleId });
  if (!invoice) {
    invoice = new Invoice({
      article: articleId,
      user: article.uploader._id,
      amount: price,
      date: new Date()
    });
    await invoice.save();
  }

  res.render('invoice', { invoice, article });
};
