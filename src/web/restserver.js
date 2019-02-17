"use strict"
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');

const DEFAULT_PORT = 4443; // Default listening port
const OPEN_INTENT = 'OPEN';
const CLOSE_INTENT = 'CLOSE';
const TOGGLE_INTENT = 'TOGGLE';
const QUERY_INTENT = 'QUERY';

module.exports = class RESTServer {
  constructor(opener, port, apikey, cert, key) {
      this.opener = opener;
      this.port = port;
      this.apikey = apikey;
      if(cert && key) {
        this.cert = fs.readFileSync(cert);
        this.key = fs.readFileSync(key);
      }

      const app = express();
      app.use(bodyParser.urlencoded({
          extended: true
      }));
      app.use(bodyParser.json());
      app.disable('x-powered-by'); // security restritcion

      // If TLS files were supplied use HTTPS, otherwise use HTTP
      if(this.cert && this.key) {
        this.credentials = {key: this.key, cert: this.cert};
        this.server = https.createServer(this.credentials, app);
      } else {
        this.server = http.createServer(app);
      }

      /*
        - Express server setup -
        As of now there isn't a web UI so we only need to respond to POSTs
      */
      app.post('/api', (req,res) => {
        console.log('POST ' + req.url);
        if(req.body.access_token === this.apikey) {
          switch(req.body.intent) {
            case OPEN_INTENT:
              res.writeHead(200, {'Content-Type': 'text/plain'});
              res.end('Opening garage.');
              this.opener.openGarage();
              break;
            case CLOSE_INTENT:
              res.writeHead(200, {'Content-Type': 'text/plain'});
              res.end('Closing garage.');
              this.opener.closeGarage();
              break;
            case TOGGLE_INTENT:
              res.writeHead(200, {'Content-Type': 'text/plain'});
              res.end('Toggling garage.');
              this.opener.toggleGarage();
              break;
            case QUERY_INTENT:
              // Normally the query would be a GET rather than a POST but it
              // doesn't seem too secure to allow the public to view your
              // garage door status so here we are.
              res.writeHead(200, {'Content-Type': 'text/plain'});
              res.end(this.opener.status());
              break;
            default:
              res.writeHead(422, {'Content-Type': 'text/plain'});
              res.end('Invalid payload received');
          }
        } else {
          res.writeHead(400, {'Content-Type': 'text/plain'});
          res.end('Invalid API Key\n');
        }
      });
  }

  start() {
    // Listen on a specified port or 4443 by default
    this.server.listen(this.port || DEFAULT_PORT, () => {
      console.log('Web server started on port ' + this.port||DEFAULT_PORT);
    });
    this.server.on('error', (err) => {
      if(err.code === 'EADDRINUSE') {
          console.warn('Address already in use, retrying...');
          setTimeout(() => {
            server.close();
            start();
          }, 1000);
      }
    });
  }
}
