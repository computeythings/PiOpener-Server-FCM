const TCPServer = require('./sockserver.js');
const RESTServer = require('./restserver.js');
const Opener = require('./gopener.js');
const fs = require('fs');
const firebase = require('firebase');
require('firebase/firestore');

const CONFIG = './config.json';

function addServerTo(opener) {
  var config = JSON.parse(fs.readFileSync(CONFIG));
  var fireDB = firebase.firestore();
  if(config.DOC_REF && config.DOC_REF !== '') {
    opener.setUpstream(fireDB.doc('servers/' + config.DOC_REF));
    return;
  }

  fireDB.collection('servers').add({
    OPEN: false,
    CLOSED: false,
    OPENING: false,
    CLOSING: false
  })
  .then((doc) => {
    console.log('New entry created at ' + doc.id);
    config.DOC_REF = doc.id;
    var newConfig = JSON.stringify(config, null, 4);
    fs.writeFile(CONFIG, newConfig, "utf8", (err) => {
      if (err)
        console.error('ERROR: Failed to save doc id to config');
      else
        console.log('Saved doc id to server');
    });
    opener.setUpstream(fireDB.doc('servers/' + doc.id));
  })
  .catch((err) => {
    // kill application if we cannot create a document to store server info
    console.error('ERROR: Failed to create new server document:\n', err);
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
  addServerTo(opener);
  // TODO: Read cert locations and ports from cli arguments
  var certLocation = '/etc/ssl/certs/garageopener.pem';
  var keyLocation = '/etc/ssl/private/garageopener.key';
  new RESTServer(opener, 4443, config.ACCESS_TOKEN, certLocation, keyLocation)
                  .start();
  new TCPServer(opener, 4444, config.ACCESS_TOKEN, certLocation, keyLocation)
                  .start();

}

function start() {
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
    }
  });

  // anonymously sign in to Firebase
  firebase.auth().signInAnonymously().catch((err) => {
    console.error('Error ' + err.code + ' signing in: ' + err.message);
  });
}

start();
