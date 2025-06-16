const User = require('../models/user');
const Article = require('../models/article');
const Certificate = require('../models/certificate');
const Invoice = require('../models/invoice');

// Admin dashboard
exports.dashboard = async (req, res) => {
  const search = req.query.search || '';
  const userQuery = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const users = await User.find(userQuery);
  const articles = await Article.find();
  const certificates = await Certificate.find();
  const invoices = await Invoice.find();

  const stats = {
    users: await User.countDocuments(),
    articles: await Article.countDocuments(),
    certificates: await Certificate.countDocuments(),
    invoices: await Invoice.countDocuments()
  };

  res.render('admin', { stats, users, articles, certificates, search });
};


// List users
exports.listUsers = async (req, res) => {
  const users = await User.find();
  res.render('admin-users', { users });
};

// List articles
exports.listArticles = async (req, res) => {
  const articles = await Article.find({ isDeclined: { $ne: true } }).populate('uploader');
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

// List certificates
exports.listCertificates = async (req, res) => {
  const certificates = await Certificate.find().populate('uploader');
  res.render('admin-certificates', { certificates });
};

// Generate invoice
exports.generateInvoice = async (req, res) => {
  const articleId = req.params.articleId;
  const article = await Article.findById(articleId).populate('uploader');

  if (!article) {
    req.flash('error_msg', 'Article not found');
    return res.redirect('/admin/articles');
  }

  const price = 1000;

  let invoice = await Invoice.findOne({ article: articleId });
  if (!invoice) {
    invoice = new Invoice({
      article: articleId,
      user: article.uploader._id,
      amount: price,
      date: new Date(),
    });
    await invoice.save();
  }

  res.render('invoice', { invoice, article });
};

// Toggle certificate approval
exports.toggleCertificateApproval = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      req.flash('error_msg', 'Certificate not found.');
      return res.redirect('/admin');
    }
    cert.isApproved = !cert.isApproved;
    await cert.save();
    req.flash('success_msg', `Certificate ${cert.isApproved ? 'approved' : 'unapproved'} successfully.`);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error toggling approval.');
    res.redirect('/admin');
  }
};
