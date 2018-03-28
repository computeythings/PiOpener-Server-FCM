"use strict"
const tls = require('tls');
const fs = require('fs');

const DEFAULT_PORT = 4443; // Default listening port
// Potential command values received from clients
const KILL_COMMAND = 'KILL';
const REFRESH_COMMAND = 'REFRESH';
const OPEN_COMMAND = 'OPEN_GARAGE';
const CLOSE_COMMAND = 'CLOSE_GARAGE';
const TOGGLE_COMMAND = 'TOGGLE_GARAGE';

module.exports = class TCPServer {
  constructor(opener, port, apikey, cert, key, logf) {
      this.opener = opener;
      this.port = port;
      this.apikey = apikey;
      this.cert = fs.readFileSync(cert);
      this.key = fs.readFileSync(key);
      this.logf = logf;

      // Socket listener for each connection established.
      this.listener = function(socket) {
        console.log('client accepted at address ' + socket.remoteAddress);
        // Clients are able to send data over the socketet to control this.opener
        socket.on('data', (data) => {
          // Process data sent by client
          switch(data) {
            case KILL_COMMAND: // Kill the connection
              console.log('socketet close requested');
              socket.end();
              break;
            case REFRESH_COMMAND: // Client requests updated opener status
              console.log('Client refresh');
              this.opener.updateClient();
              break;
            case OPEN_COMMAND: // Client requests to open opener
              console.log('Opening garage');
              this.opener.openGarage();
              break;
            case CLOSE_COMMAND: // Client requests to close opener
              console.log('Closing garage');
              this.opener.closeGarage();
              break;
            case TOGGLE_COMMAND: //Client requests to toggle opener
              console.log('Toggling garage');
              this.opener.toggleGarage();
              break;
            default:
              console.log('Client sent: ' + data);
          }
        });
        socket.on('close', (data) => {
          console.log('TCP server closed');
        });
      }

      // Only run over SSL if both cert and key exist
      if(this.cert && this.key) {
        console.log('starting encryted TCP server');
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
