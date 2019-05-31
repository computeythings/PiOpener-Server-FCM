"use strict"
const passport = require('passport');
const express = require('express');
const router = express.Router();

// pass all POST requests through jwt middleware
router.post('*', (req, res, next) => {
  // pass unauthenticated to /login
  if(req.url === '/login') {
    return next();
  }
  req.session.returnTo = req.url;
  passport.authenticate('jwt', (err, result) => {
    if (err && err.name === 'TokenExpiredError') {
      passport.authenticate('jwt_refresh', { session: true }, (err, token) => {
        if (!token)
          return res.send(401, 'invalid token');
        else {
          // a valid jwt has now been issued
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'PRODUCTION'
          });
          // pass user onto desired location
          return next();
        }
      })(req, res, next);
    }
    if (!result)
      return res.send(401, 'invalid token');
    else
      return next();
  })(req, res, next);
});

// pass all GET requests through jwt middleware
router.get('*', (req, res, next) => {
  // pass unauthenticated to /login, /logout, and /favicon.ico
  if(req.url === '/login' || req.url === '/logout' ||
      req.url === '/favicon.ico') {
    // the status(204) is required for Chrome when requesting favicon.ico
    // emitting it will cause double requests which is mostly just annoying
    res.status(204);
    return next();
  }

  // require JWT for any other GET request.
  passport.authenticate('jwt', (err, result, data) => {
    if (err || !result) {
      req.session.returnTo = req.url;
    }
    // JWT will auto refresh if it's expired
    if(data && data.message && data.message === 'JWT REFRESH') {
      res.cookie('jwt', result, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'PRODUCTION',
          overwrite: true
        });
    }
    // After success/auto refresh the user is free to proceed
    return next();
  })(req, res, next);
});

// Test route, please ignore
router.get('/', (req, res) => {
  res.sendFile('html/vue.html', {root: 'public'})
});

module. exports = router;
