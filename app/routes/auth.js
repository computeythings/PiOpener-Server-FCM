const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const tokens = require('../util/tokenhandler.js');
const router = express.Router();


module.exports = function(app, db) {
  // LocalStrategy will only be used to master login
  passport.use(new LocalStrategy({
    password: password
  }, async (password, done) => {
    try {
      const success = await db.login(password);
      if (success) {
        return done(null, true);
      } else {
        return done('Incorrect Password');
      }
    } catch (err) {
      done(err);
    }
  }));
  // JWT verification will be passed on to tokenhandler.js
  passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: keys.public
  }, (jwtPayload, done) => {
    try {
      tokens.verifyAccessToken(jwtPayload);
      return done(null, jwtPayload);
    } catch(err) {
      return done(err.message);
    }
  }));

  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, success) => {
      if (err || !success) { res.status(400).send({ err }); }

      // assigns payload to user
      req.login(payload, { session: false }, (err) => {
        if (err) { res.status(400).send({ err }); }

        const refreshToken = tokens.generateRefreshToken('master');
        const accessToken = tokens.generateAccessToken(refreshToken);
        const payload = {
          refreshToken: refreshToken,
          accessToken: accessToken
        };

        // assign access token to cookie
        res.cookie('jwt', accessToken, { httpOnly: true, secure: true });
        // send user both access token and refresh token for use
        res.status(200).send({ payload });
      });
    })(req, res);
  });

  /*
    new users are added with a structure of {ID, Password, Expiration}
    since new users are always temporary, they will only be granted tokens
    and not rely on actual login authentication.
  */
  router.post('/users/:userId', (req, res) => {

  });

  router.post('/api', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const token = req;
      res.status(200).send({req});
  });

  router.get('/api/users', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      res.status(200).send({db.all()});
  });

  return router;
}
