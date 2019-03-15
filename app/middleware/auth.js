"use strict"
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const CustomStrategy = require('passport-custom');
const db = require('../controllers/users.js');
const tokens = require('../util/tokenhandler.js');


// LocalStrategy will only be used to master login
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      let loginSuccess = await db.login(username, password);
      if (loginSuccess) {
        return done(null, loginSuccess);
      }
      return done(new Error('Incorrect username or password.'));
    } catch(err) {
      done(err);
    }
  })
);

// JWT verification will be passed on to tokenhandler.js
// used for each transaction after initial local authentication
passport.use('jwt', new CustomStrategy((req, done) => {
  if(!req.cookies || !req.cookies.jwt)
    return done(null, false, {message: 'No JWT'});

  tokens.verifyAccessToken(req.cookies.jwt, (err, decoded) => {
    if (err) { return done(err); }
    return done(null, decoded);
  });
}));

// Used to refresh expired access tokens
passport.use('jwt_refresh', new CustomStrategy((req, done) => {
  if(!req.cookies || !req.cookies.refresh_jwt)
    return done(null, false, { message: 'No Refresh Token'} );

  tokens.generateAccessToken(req.cookies.refresh_jwt, (err, signed) => {
    if (err) { return done(null, false, { message: err }); }
    return done(null, signed);
  });
}));
