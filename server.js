'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const pImage = require('pureimage');

// Here we use destructuring assignment with renaming so the two variables
// called router (from ./users and ./auth) have different names
// For example:
// const actorSurnames = { james: "Stewart", robert: "De Niro" };
// const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james
// console.log(bobby); // De Niro - the variable name is bobby, not robert
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: eventsRouter } = require('./events');

const fileUpload = require('express-fileupload');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// Logging
app.use(morgan('common'));

app.use(fileUpload());

app.use(express.static('assets'));

// Route to serve start page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/assets/views/index.html');
});

// Route to serve login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/assets/views/login.html');
});

// Route to serve login page
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/assets/views/signup.html');
});

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/events/', eventsRouter);

const jwtAuth = passport.authenticate('jwt', { session: false, failureRedirect: '/login' });

// Protected route to serve event page
// TODO: Restore 'jwtAuth,' middleware to protect page
app.get('/events', (req, res) => {
  res.sendFile(__dirname + '/assets/views/events.html');
});

// Protected route to serve event delete page
// TODO: Restore 'jwtAuth,' middleware to protect page
app.get('/delete', (req, res) => {
  res.sendFile(__dirname + '/assets/views/delete.html');
});

// Protected route to serve event delete page
// TODO: Restore 'jwtAuth,' middleware to protect page
app.get('/details', (req, res) => {
  res.sendFile(__dirname + '/assets/views/details.html');
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };