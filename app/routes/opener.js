"use strict"
const passport = require('passport');
const express = require('express');
const router = express.Router();
const opener = require('../controllers/opener.js');

router.post('/api/open', (req, res) => {
  opener.openGarage((err, response) => {
    if (err)
      return res.status(503).send(err);
    res.status(200).send(response);
  });
});
router.post('/api/close', (req, res) => {
  opener.closeGarage((err, response) => {
    if (err)
      return res.status(503).send(err);
    res.status(200).send(response);
  });
});
router.post('/api/toggle', (req, res) => {
  opener.toggleGarage((err, response) => {
    if (err)
      return res.status(503).send(err);
    res.status(200).send(response);
  });
});
router.get('/api/status', (req, res) => {
  res.status(200).send(opener.status());
});

module.exports = router;
