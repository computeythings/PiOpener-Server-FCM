const dgram = require('dgram');
const udp_socket = dgram.createSocket('udp4');

const SERVER_PORT = 41234
const CLIENT_PORT = 41233
const SERVER_RESPONSE =  'PI_OPENER_SERVER_ACK';
const CLIENT_QUERY = 'ANDROID_CLIENT_PI_OPENER';

var assert = {
 equal: function(firstValue, secondValue) {
   if (firstValue != secondValue) 
     throw new Error('Assert failed, ' + firstValue + 
      ' is not equal to ' + secondValue + '.');
   }
};

const UDPServer = require('../src/udp_broadcaster.js');
const server = new UDPServer();
server.start();

// once we receive a client UDP broadcast
udp_socket.on('message', (msg, rinfo) => {
 try {
  assert.equal(msg, SERVER_RESPONSE);
  console.log('Passed.');
 } catch(err) {
  console.log(err.message);
 }
 udp_socket.close();
 server.stop();
});

udp_socket.on('listening', () => {
 udp_socket.send(CLIENT_QUERY, 0, CLIENT_QUERY.length, SERVER_PORT, 
  '127.0.0.1');
});

udp_socket.bind(CLIENT_PORT);

