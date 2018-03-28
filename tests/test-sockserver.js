const TCPServer = require('../src/sockserver.js');
const Opener = require('../src/gopener.js');

var certLocation = '/etc/ssl/certs/garageopener.pem';
var keyLocation = '/etc/ssl/private/garageopener.key';

const server = new TCPServer(new Opener(2,3,4), 4453, 'aoeu',
                                certLocation, keyLocation, 'aoeu');
server.start();
