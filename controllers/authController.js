const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.getLogin = (req, res) => {
  res.render('login');
};

exports.postLogin = [
  body('email', 'Please enter a valid email').isEmail().normalizeEmail(),
  body('password', 'Password cannot be blank').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array().map(e => e.msg).join(', '));
      return res.redirect('/login');
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/login');
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
       req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/login');
      }
      req.session.user = { id: user._id, name: user.name, isAdmin: user.isAdmin };
      req.flash('success_msg', 'Logged in successfully');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server error');
      res.redirect('/login');
    }
  }
];

exports.getRegister = (req, res) => {
  res.render('register');
};

exports.postRegister = [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Enter a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('password2').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array().map(e => e.msg).join(', '));
      return res.redirect('/register');
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        req.flash('error_msg', 'Email already registered');
        return res.redirect('/register');
      }
      user = new User({ name, email, password });
      await user.save();
      req.flash('success_msg', 'Registration successful. Please login.');
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server error');
      res.redirect('/register');
    }
  }
];

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/login');
  });
};
