"use strict"
const tls = require('tls');
const fs = require('fs');

const DEFAULT_PORT = 4443; // Default listening port
const HOST_ADDR = '127.0.0.1';

module.exports = class TCPServer {
  constructor(opener, port, apikey, cert, key, logf) {
      this.opener = opener;
      this.port = port;
      this.apikey = apikey;
      this.cert = fs.readFileSync(cert);
      this.key = fs.readFileSync(key);
      this.logf = logf;

      this.connectionListener = function(sock) {
        console.log('TCP server started at ' + sock.remoteAddress + ':' +
                      sock.remotePort);
        sock.on('data', (data) => {
          console.log('received: ' + data);
        });
        sock.on('close', (data) => {
          console.log('TCP server closed');
        });
      }

      if(this.cert && this.key) {
        console.log('starting SSL socket server');
        this.credentials = {key: this.key, cert: this.cert};
        this.server = tls.createServer(this.credentials, (sock) => {
          console.log('TCP server started at ' + sock.remoteAddress + ':' +
                        sock.remotePort);
          sock.on('data', (data) => {
            console.log('received: ' + data);
          });
          sock.on('close', (data) => {
            console.log('TCP server closed');
          });
        });
      } else {
        this.server = tls.createServer((sock) => {
          console.log('TCP server started at ' + sock.remoteAddress + ':' +
                        sock.remotePort);
          sock.on('data', (data) => {
            console.log('received: ' + data);
          });
          sock.on('close', (data) => {
            console.log('TCP server closed');
          });
        });
      }

  }

  start() {
    this.server.listen(this.port || DEFAULT_PORT, () => {
      console.log('server bound');
    });
    this.server.on('connection', (conn) => {
        console.log('client accepted at address: ' + conn.remoteAddress + ':' +
                      conn.remotePort);
    });
    console.log('eof');
  }
}
