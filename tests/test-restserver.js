const RESTServer = require('../src/restserver.js');
const Opener = require('../src/gopener.js');

var certLocation = '/etc/ssl/certs/garageopener.pem';
var keyLocation = '/etc/ssl/private/garageopener.key';

const server = new RESTServer(new Opener(2,3,4), 4453, 'aoeu', 'aoeu',
                                certLocation, keyLocation);
server.start();
