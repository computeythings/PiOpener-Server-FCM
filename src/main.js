const TCPServer = require('sockserver.js');
const RESTServer = require('restserver.js');
const Opener = require('gopener.js');
const fs = require('fs');
const firebase = require('firebase');
require('firebase/firestore');

const CONFIG = 'config.json';

// firebase setup
firebase.initializeApp({
  apiKey: "AIzaSyCdfTfGXd002L2rOSrtdcgl0HhyQLJ3r60",
  authDomain: "gonnelladev-piopener-2e8f0.firebaseapp.com",
  projectId: "gonnelladev-piopener-2e8f0",
  databaseURL: "https://gonnelladev-piopener-2e8f0.firebaseio.com",
  storageBucket: "gonnelladev-piopener-2e8f0.appspot.com"
});
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('Authenticated with UID: ' + user.uid);
    initServers();
  } else {
    // kill application if we are disconnected from the Firebase server
    console.warn('WARNING: User has been logged out of Firebase');
    console.log('Stopping all running servers.');
    process.exit();
  }
});
const fireDB = firebase.firestore();

function getDocRef(config) {
  if(config.docRef && config.docRef !== '')
    return fireDB.doc('servers/' + config.docRef);

  var docRef = null;
  fireDB.collection('servers').add({
    OPEN: false,
    CLOSED: false,
    OPENING: false,
    CLOSING: false
  })
  .then((refID) => {
    console.log('New entry created at ' + refID);
    docRef = refID;
    config.docRef = docRef;
    var newConfig = JSON.stringify(config, null, 4);
    fs.writeFile(CONFIG, newConfig, "utf8", (err) => {
      if (err)
        console.error('ERROR: Failed to save server refID to config');
    });
    return getDocRef(newConfig);
  })
  .catch((err) => {
    // kill application if we cannot create a document to store server info
    console.error('ERROR: Failed to create new server document');
    console.log('Stopping all running servers.');
    process.exit();
  });
}

/*
  Run only after the application has successfully authenticated with
  the Firebase server.
*/
function initServers() {
  var config = JSON.parse(fs.readFileSync(CONFIG));
  var opener = new Opener(config.OPEN_SWITCH_PIN, config.CLOSED_SWITCH_PIN,
                            config.RELAY_PIN);
  opener.setUpstream(getDocRef(config));
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
