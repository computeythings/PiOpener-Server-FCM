"use strict"
const RESTServer = require('./controllers/restserver.js');
const CloudDB = require('./controllers/cloud.js');
const fs = require('fs');
const path = require('path');
/*
  Connects to firebase DB and starts all relevant servers
*/
(() => {
  //TODO:
  /*
  if(configured)
  else
    init servers for configuration mode
  */
  var cloud = new CloudDB((err, conn) => {
    if (err)
      return console.error(err);
    if (conn) {
        // open udp socket for network discovery
        require('./controllers/udp_broadcaster.js');
        // start web server
        new RESTServer(cloud).start();
        return;
    }
    cloud.login();
  });
})();
