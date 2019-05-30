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
  // pass unauthenticated to /login
  if(req.url === '/login' || req.url === '/logout') {
    return next();
  }
  if(req.url === '/favicon.ico') {
    res.status(204);
    return next();
  }

  passport.authenticate('jwt', (err, result, data) => {
    if (err || !result) {
      req.session.returnTo = req.url;
    }
    if(data && data.message && data.message === 'JWT REFRESH') {
      res.cookie('jwt', result, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'PRODUCTION',
          overwrite: true
        });
    }
    return next();
  })(req, res, next);
});

router.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname + '/../views'});
});

module. exports = router;
