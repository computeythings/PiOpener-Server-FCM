const dgram = require('dgram');
const assert = require('assert');

const SERVER_PORT = 41234
const CLIENT_PORT = 41233
const SERVER_RESPONSE =  'PI_OPENER_SERVER_ACK';
const CLIENT_QUERY = 'ANDROID_CLIENT_PI_OPENER';

const UDPServer = require('../src/web/udp_broadcaster.js');
const server = new UDPServer();
const test_client_socket = dgram.createSocket('udp4');


before(() => {
  // start UDP broadcast server
  return server.start();
});

after(()=> {
  test_client_socket.close();
  server.stop();
});

describe('udp_broadcaster.js', () => {
  describe('#client_response', () => {
    it('should respond to client queries with a constant response value',
    (done) => {
      // first setup the client message listener
      test_client_socket.on('message', (msg, rinfo) => {
        // once the server receives the client message,
        // it's response will be captured here
        assert.equal(msg, SERVER_RESPONSE);
        done();
      });
      // start listening on the client UDP socket
      test_client_socket.bind(CLIENT_PORT, () => {
        // then send the query message to the server
        test_client_socket.send(CLIENT_QUERY, 0, CLIENT_QUERY.length,
          SERVER_PORT, '127.0.0.1');
      });
    });
  });
});
