const path = require('path');
const mongoose = require('mongoose')

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

const shopRoutes = require('./routes/shop');

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
