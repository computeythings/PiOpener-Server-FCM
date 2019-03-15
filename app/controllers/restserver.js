"use strict"
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const Opener = require('./opener.js');

module.exports = class RESTServer {
  constructor(upstream) {
      this.opener = new Opener(upstream);

      const app = express();
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
      }));
      app.use(require('cookie-parser')());
      app.disable('x-powered-by'); // security restritcion
      app.use(require('../routes/index.js'));
      app.use(require('../routes/auth.js'));
      app.use(require('../routes/opener.js'));

      // If TLS files were supplied use HTTPS, otherwise use HTTP
      if(process.env.NODE_ENV === 'TEST') {
        this.server = http.createServer(app);
      } else {
        this.server = https.createServer({
          key: fs.readFileSync(process.env.SERVER_KEY),
          cert: fs.readFileSync(process.env.SERVER_CERT),
        }, app);
      }
  }

  start() {
    // Listen on a specified port or 4443 by default
    this.server.listen(process.env.SERVER_PORT || 8000, (err) => {
      if (err && err.code === 'EADDRINUSE') {
          console.warn('Address already in use, retrying...');
          setTimeout(() => {
            server.close();
            start();
          }, 1000);
      } else
        console.log('Web server started on port ' + this.server.port);
    });
  }
}
