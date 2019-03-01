/**
  *
  * WARNING: THIS FILE IS NOW DEPRECATED AS THE SOCKET SERVER HAS BEEN
  * MIGRATED TO THE CLIENT FOR A MORE FLEXIBLE CONNECTION SCHEME.
  *
  *
 **/

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
  constructor(opener, port, apikey, cert, key, refId) {
      this.port = port;
      if (cert && key) {
        this.cert = fs.readFileSync(cert);
        this.key = fs.readFileSync(key);
      }

      // socket listener for each connection established.
      this.listener = function(socket) {
        console.log('client accepted at address ' + socket.remoteAddress);
        this.verified = false; // client requires verifiaction
        // clients are able to send data over the socketet to control this.opener
        socket.on('data', (data) => {
          var stringData = data.toString().trim();
          if(!this.verified) { // verify socket before reading data
            if(stringData === apikey) {
              // set verified once apikey is received
              console.log('Client verified at address ' + socket.remoteAddress);
              this.verified = true;
              socket.write(refId + '\n');
              opener.addListener(socket);
            } else {
              console.warn('Client sent invalid API Key - closing connection');
              socket.write('Invalid API Key.\n');
              socket.end();
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
              opener.updateServer();
              break;
            case OPEN_COMMAND: // client requests to open opener
              opener.openGarage();
              break;
            case CLOSE_COMMAND: // client requests to close opener
              opener.closeGarage();
              break;
            case TOGGLE_COMMAND: // client requests to toggle opener
              opener.toggleGarage();
              break;
            default:
              console.log('Client sent: ' + stringData);
          }
        });
        socket.on('close', (data) => {
          console.log('TCP connection with '+ socket.remoteAddress +' closed');
          opener.removeListener(socket);
        });
        socket.on('error', (err) => {
          console.error('Error over connection to ' + socket.remoteAddress +
                        ':\n' + err);
        });
      }

      // only run over SSL if both cert and key exist
      if(this.cert && this.key) {
        console.log('Using encrypted TCP server');
        this.credentials = {key: this.key, cert: this.cert};
        this.server = tls.createServer(this.credentials, this.listener);
      } else {
        console.log('Using unencrypted TCP server');
        this.server = tls.createServer(this.listener);
      }

  }

  start() {
    this.server.listen(this.port||DEFAULT_PORT, () => {
      console.log('TCP server started on port: ' + this.port||DEFAULT_PORT);
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
