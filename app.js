const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const flash = require('express-flash');
require('dotenv').config();

dotenv.config();

const app = express();


// Set storage location and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // folder to save files (create this folder)
  },
  filename: function (req, file, cb) {
    // Save file with unique name to avoid overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

console.log("Mongo URI:", process.env.MONGODB_URI);

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // only send cookie over HTTPS in prod
    httpOnly: true, // prevents client JS from reading the cookie
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

app.use(flash());

// Global variables for flash messages & user
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});


// Routes
app.use('/', require('./routes/auth'));
app.use('/articles', require('./routes/articles'));
app.use('/certificates', require('./routes/certificates'));
app.use('/admin', require('./routes/admin'));
app.use('/contact', require('./routes/contact'));

// Home page route
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/about', (req, res) => {
  res.render('about'); // assumes views/about.ejs
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
