"use strict"
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const Opener = require('./opener.js');

module.exports = class RESTServer {
  constructor(upstream) {
      this.opener = new Opener(upstream);

      const app = express();
      this.expressSession = session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
      });

      require('../middleware/auth.js');
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(this.expressSession);
      app.use(require('cookie-parser')());
      app.disable('x-powered-by'); // security restritcion
      app.set('views', path.join(__dirname, '../views'));
      app.use('/', express.static(path.join(__dirname, '/../public')));
      app.use(require('../routes/index.js'));
      app.use(require('../routes/users.js'));
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

  broadcast(event, data) {
    if (!this.io)
      throw new Error('socket.io has not yet been initialized');

    this.io.emit(event, data);
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
        console.log('Web server started on port ' +
        process.env.SERVER_PORT || 8000);
    });

    // socket.io for client response
    this.io = require('socket.io')(this.server);
    this.io.use(sharedsession(this.expressSession));

    this.io.on('connection', socket => {
      //console.log('socket connected:', socket.handshake.session);
      socket.on('browser-client', () => {
        socket.emit('browser-data', {message: 'Hello, users!', author: 'World'})
      });
    });
    this.io.on('disconnect', () => {
      console.log('socket disconnected');
    });
  }
}
