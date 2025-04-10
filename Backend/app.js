const path = require('path');
const mongoose = require('mongoose')
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const app = express();

const shopRoutes = require('./routes/shop');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with the original extension
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware setup
app.use(express.json()) // Won't parse JSON data sent to server without this
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'event-buddy-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Routes
app.use('/', shopRoutes);

//app.use((req, res, next) => {
    //  res.status(404).render('404', { pageTitle: 'Page Not Found' });
//});

// Database connection
mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1:27017/db')
    .then(res => {
        console.log('Connected to MongoDB');
        app.listen(3010, () => {
          console.log('Server running on port 3010');
        });
    })
    .catch(err => {
        console.log('Mongoose connection error: ' + err)
    });
