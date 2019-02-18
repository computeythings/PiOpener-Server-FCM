const argv = require('minimist')(process.argv.slice(2));
const TCPServer = require('./web/sockserver.js');
const RESTServer = require('./web/restserver.js');
const Opener = require('./opener.js');
const CloudDB = require('./cloud.js');
const UDPServer = require('./web/udp_broadcaster.js');
const fs = require('fs');
const path = require('path');

const CONFIG = path.resolve(__dirname, '../config.json');
const config = getConfig(CONFIG);

function getConfig(path) {
  if (!fs.existsSync(path))
    fs.writeFileSync(path, '{}');
  return require(path);
}

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
    var opener = new Opener(config.OPEN_SWITCH_PIN, config.CLOSED_SWITCH_PIN,
                              config.RELAY_PIN, docRef);
  }).then(() => {
    // read cert and key form cli arguments
    var certLocation = argv.cert || argv.c;
    var keyLocation = argv.key || argv.k;
    var webport = argv.web_port || argv.w || 4443;
    var tcpport = argv.tcp_port || argv.t || 4444;
    // init web and socket servers
    if(!argv.tcp_only) {
      new RESTServer(opener, webport, config.ACCESS_TOKEN, certLocation,
                      keyLocation).start();
    }
    if(!argv.rest_only) {
      new TCPServer(opener, tcpport, config.ACCESS_TOKEN, certLocation,
                      keyLocation, config.DOC_REF).start();
    }
  });
  // open udp socket for network discovery
  new UDPServer().start();
}

function loginObserver(state, data) {
  //TODO: implement here
  switch(state) {
    case 'login-complete':
      console.log('User logged in', data);
      break;
    case 'logout-complete':
      //TODO: shut down servers?
      break;
    default:
      console.log('Failed login', data);
  }
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
