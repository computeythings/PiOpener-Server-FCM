"use strict"
const express = require('express');
const passport = require('passport');
const router = express.Router();

/*
  new users are added with a structure of {ID, Password, Expiration}
  since new users are always temporary, they will only be granted tokens
  and not rely on actual login authentication.
*/
router.get('/users/', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.status(200).send({db.all()});
});

module.exports = router;
