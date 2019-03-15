"use strict"
const dgram = require('dgram');
/*
  UDP server bound to port 41234
  Android client mirror is bound to port 41233
*/
const SERVER_RESPONSE =  'PI_OPENER_SERVER_ACK';
const CLIENT_QUERY = 'ANDROID_CLIENT_PI_OPENER';

const udp_socket = dgram.createSocket('udp4');
// once we receive a client UDP broadcast
udp_socket.on('message', (msg, rinfo) => {
  if (msg == CLIENT_QUERY) {
    // reply with an acknowledge message
    // confirming that there is a server at this address
    udp_socket.send(SERVER_RESPONSE, 0, SERVER_RESPONSE.length,
      41233, rinfo.address, (err, bytes) => {
      if (err)
      console.error(err);
      console.log('Sent response to android client at: ' + rinfo.address);
    });
  }
});
udp_socket.on('error', (err) => {
  console.error(err);
});
udp_socket.bind(41234);

exports.stop = () => {
  udp_socket.close();
}
