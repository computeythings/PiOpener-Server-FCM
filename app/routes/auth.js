"use strict"
const express = require('express');
const passport = require('passport');
const router = express.Router();
const db = require('../controllers/users.js');

/*
  new users are added with a structure of {ID, Password, Expiration}
  since new users are always temporary, they will only be granted tokens
  and not rely on actual login authentication.
*/
router.get('/users/', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    db.all().then((result, err) => {
        if (err)
          res.status(503).send(err);
        else
          res.status(200).send(result);
    })

});

module.exports = router;
