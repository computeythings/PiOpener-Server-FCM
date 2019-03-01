const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;

const router = express.Router();

passport.use(new LocalStrategy({
  usernameField: username,
  passwordField: password,
}, async (username, password, done) => {
  try {
    const userDocument = await UserModel.findOne({username: username}).exec();
    const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);

    if (passwordsMatch) {
      return done(null, userDocument);
    } else {
      return done('Incorrect Username / Password');
    }
  } catch (error) {
    done(error);
  }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: secret,
  },
  (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }

    return done(null, jwtPayload);
  }
));

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
