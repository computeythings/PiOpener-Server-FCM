const TCPServer = require('sockserver.js');
const RESTServer = require('restserver.js');
const Opener = require('gopener.js');
const fs = require('fs');
const firebase = require('firebase');
require('firebase/firestore');

const CONFIG = 'config.json';

// firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyCdfTfGXd002L2rOSrtdcgl0HhyQLJ3r60",
  authDomain: "gonnelladev-piopener-2e8f0.firebaseapp.com",
  projectId: "gonnelladev-piopener-2e8f0",
  storageBucket: "gonnelladev-piopener-2e8f0.appspot.com"
};
firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // update config with uid
    var jsonConfig = JSON.parse(fs.readFileSync(CONFIG));
    jsonConfig.uid = user.uid;
    var newConfig = JSON.stringify(jsonConfig, null, 4);
    fs.writeFile(CONFIG, newConfig, "utf8", (err) => {
      if (err)
        console.error('ERROR: Failed to save server UID to config');
    });
    initServers();
  } else {
    // kill application if we are disconnected from the Firebase server
    console.warn('WARNING: User has been logged out of Firebase');
    console.log('Stopping all running servers.');
    process.exit();
  }
});
const fireDB = firebase.firestore();

/*
  Run only after the application has successfully authenticated with
  the Firebase server.
*/
function initServers() {
  var config = JSON.parse(fs.readFileSync(CONFIG));
  var opener = new Opener(config.OPEN_SWITCH_PIN, config.CLOSED_SWITCH_PIN,
                            config.RELAY_PIN);
  // TODO: Read cert locations and ports from cli arguments
  var certLocation = '/etc/ssl/certs/garageopener.pem';
  var keyLocation = '/etc/ssl/private/garageopener.key';
  new RESTServer(opener, 4443, config.ACCESS_TOKEN, certLocation, keyLocation)
                  .start();
  new TCPServer(opener, 4444, config.ACCESS_TOKEN, certLocation, keyLocation)
                  .start();

}

function start() {
  // anonymously sign in to Firebase
  firebase.auth().signInAnonymously().catch((err) => {
    console.error('Error ' + err.code + ' signing in: ' + err.message);
  });
}
