const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');
const app = express();
require('dotenv').config();

dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'sessions' })
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')[0];
  res.locals.error_msg = req.flash('error_msg')[0];
  res.locals.error = req.flash('error')[0];
  res.locals.user = req.session.user || null;
  next();
});


// Routes
app.use('/', require('./routes/auth'));
app.use('/articles', require('./routes/articles'));
app.use('/certificates', require('./routes/certificates'));
app.use('/admin', require('./routes/admin'));
app.use('/contact', require('./routes/contact'));
app.use('/', require('./routes/public'));

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/', (req, res) => res.render('index'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
