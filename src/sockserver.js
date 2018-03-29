"use strict"
const tls = require('tls');
const fs = require('fs');

const DEFAULT_PORT = 4443; // default listening port
// potential command values received from clients
const KILL_COMMAND = 'KILL';
const REFRESH_COMMAND = 'REFRESH';
const OPEN_COMMAND = 'OPEN_GARAGE';
const CLOSE_COMMAND = 'CLOSE_GARAGE';
const TOGGLE_COMMAND = 'TOGGLE_GARAGE';

module.exports = class TCPServer {
  constructor(opener, port, apikey, cert, key) {
      this.port = port;
      this.cert = fs.readFileSync(cert);
      this.key = fs.readFileSync(key);
      const clients = {};

      // socket listener for each connection established.
      this.listener = function(socket) {
        console.log('client accepted at address ' + socket.remoteAddress);
        clients[socket] = false; // add socket to clients list
        // clients are able to send data over the socketet to control this.opener
        socket.on('data', (data) => {
          var stringData = data.toString().trim();
          if(!clients[socket]) { // verify socket before reading data
            if(stringData === apikey) {
              // set verified once apikey is received
              clients[socket] = true;
            } else {
              socket.write('Invalid API Key.');
            }
            return;
          }

          // process data sent by client
          switch(stringData) {
            case KILL_COMMAND: // kill the connection
              console.log('socket close requested');
              socket.end();
              break;
            case REFRESH_COMMAND: // client requests updated opener status
              console.log('Client refresh');
              opener.updateClient();
              break;
            case OPEN_COMMAND: // client requests to open opener
              console.log('Opening garage');
              opener.openGarage();
              break;
            case CLOSE_COMMAND: // client requests to close opener
              console.log('Closing garage');
              opener.closeGarage();
              break;
            case TOGGLE_COMMAND: // client requests to toggle opener
              console.log('Toggling garage');
              opener.toggleGarage();
              break;
            default:
              console.log('Client sent: ' + stringData);
          }
        });
        socket.on('close', (data) => {
          console.log('TCP connection with '+ socket.remoteAddress +' closed');
          delete clients[socket]; // remove socket as client
        });
        socket.on('error', (err) => {
          console.log('Error over connection to ' + socket.remoteAddress +
                        ':\n' + err);
        });
      }

      // only run over SSL if both cert and key exist
      if(this.cert && this.key) {
        console.log('starting encrypted TCP server');
        this.credentials = {key: this.key, cert: this.cert};
        this.server = tls.createServer(this.credentials, this.listener);
      } else {
        console.log('starting unencrypted TCP server');
        this.server = tls.createServer(this.listener);
      }

  }

  start() {
    this.server.listen(this.port||DEFAULT_PORT, () => {
      console.log('TCP server started on port: ' + this.port||DEFAULT_PORT);
    });
  }
}
