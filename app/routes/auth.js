const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const TokenHander = require('../util/tokenhandler.js');

const router = express.Router();
const tokens = new TokenHander({
  cert: process.env.SERVER_CERT,
  key: process.env.SERVER_KEY
});

// LocalStrategy will only be used to master login
passport.use(new LocalStrategy(
  async (password, done) => {
    try {
      const success = authstor.login(password);
      if (success) {
        return done(null, 'master');
      } else {
        return done('Incorrect Password');
      }
    } catch (err) {
      done(err);
    }
  })
);

passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: keys.public
  }, (jwtPayload, done) => {
    tokens.verifyAccessToken(jwtPayload, (err, decoded) => {
      if (err) { return done(err.message); }
      return done(null, jwtPayload);
    });
  })
);

module.exports = function(app, db) {
  router.post('/login', (req, res) => {
    const
  });

  /*
    new users are added with a structure of {ID, Password, Expiration}
    since new users are always temporary, they will only be granted tokens
    and not rely on actual login authentication.
  */
  router.post('/register', (req, res) => {

  });

  router.post('/api', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const token = req;
      res.status(200).send({req});
  });

  return router;
}
