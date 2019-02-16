"use strict"
const dgram = require('dgram');

const SERVER_PORT = 41234;
const CLIENT_PORT = 41233;
const SERVER_RESPONSE =  'PI_OPENER_SERVER_ACK';
const CLIENT_QUERY = 'ANDROID_CLIENT_PI_OPENER';

module.exports = class UDPBroadcaster {
<<<<<<< HEAD
  constructor () {
    this.udp_socket = dgram.createSocket('udp4');
    // once we receive a client UDP broadcast
    this.udp_socket.on('message', (msg, rinfo) => {
      if (msg == CLIENT_QUERY) {
        // reply with an acknowledge message
        // confirming that there is a server at this address
        this.udp_socket.send(SERVER_RESPONSE, 0, SERVER_RESPONSE.length,
          CLIENT_PORT, rinfo.address, (err, bytes) => {
          if (err)
          console.error(err);
          console.log('Sent response to android client at: ' + rinfo.address);
        });
      }
    });
  }
  start () {
    return new Promise((resolve, reject) => {
      this.udp_socket.on('error', (err) => {
        reject(err);
      });

      this.udp_socket.bind(SERVER_PORT, () => {
        var address = this.udp_socket.address();
        resolve(address)
      });
    });
  }
  stop () {
    this.udp_socket.close();
  }
=======
 constructor () {
  this.udp_socket = dgram.createSocket('udp4');

  // once we receive a client UDP broadcast
  this.udp_socket.on('message', (msg, rinfo) => {
   if (msg == CLIENT_QUERY) {
    // reply with an acknowledge message
    // confirming that there is a server at this address
    this.udp_socket.send(SERVER_RESPONSE, 0, SERVER_RESPONSE.length, CLIENT_PORT,
    rinfo.address, (err, bytes) => {
     if (err)
      console.error(err);
     console.log('Sent response to android client at: ' + rinfo.address);
    });
   }
  });

  this.udp_socket.on('listening', () => {
   var address = this.udp_socket.address();
   console.log('Listening for UDP broadcasts on ' +
    address.address + ':' + address.port);
  });
 }
 start () {
  this.udp_socket.bind(SERVER_PORT);
 }
 stop () {
  this.udp_socket.close();
 }
>>>>>>> 84849f38881bf336ed6e780013c72edcf4f8f260
}
