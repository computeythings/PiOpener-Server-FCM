const RESTServer = require('./controllers/restserver.js');
const Opener = require('./controllers/opener.js');
const CloudDB = require('./controllers/cloud.js');
const fs = require('fs');
const path = require('path');

const CONFIG = path.resolve(__dirname, '../config.json');
const config = ((path) => {
                  if (!fs.existsSync(path))
                    fs.writeFileSync(path, '{}');
                  return require(path);
                })(CONFIG);
/*
  Writes any changes to the config variable to the config file
*/
function updateConfig() {
  var newConfig = JSON.stringify(config, null, 2); // args for readable spacing
  fs.writeFile(CONFIG, newConfig, 'utf8', (err) => {
    if (err)
      console.error('ERROR: Failed to save doc id to config');
    else
      console.log('Config file updated');
  });
}

/*
  Run only after the application has successfully authenticated with
  the Firebase server.
*/
function initServers(cloud) {
  cloud.getServerDoc().then(docRef => {
    var opener = new Opener(docRef);
  }).then(() => {
    // start web server
    new RESTServer(opener).start();
    // open udp socket for network discovery
    require('./controllers/udp_broadcaster.js');
    /* DEPRECATED
    *
    new TCPServer(opener, tcpport, config.ACCESS_TOKEN, certLocation,
                    keyLocation, config.DOC_REF).start();
    *
    */
  });
}

function loginObserver(err, user) {
  if (err)
    return console.error(err);
  else if (user)
    return console.log('User logged in', user);
  else
    console.log('Logged out');
}

/*
  Connects to firebase DB and starts all relevant servers
*/
function start() {
  //TODO:
  /*
  if(configured) {
    var cloud = new CloudDB(loginObserver);
    cloud.login(config.serverID, Get password somehow? Maybe only use token logins)
    .then(() => {
      initServers(cloud); // probably inline this function
    })
  }
  else
    init servers for configuration mode
  */
}


// run the server on execution
start();
