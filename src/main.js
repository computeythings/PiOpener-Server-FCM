const TCPServer = require('./sockserver.js');
const RESTServer = require('./restserver.js');
const Opener = require('./gopener.js');
const fs = require('fs');
const path = require('path');
const firebase = require('firebase');
require('firebase/firestore');

const DOMAIN = '@gonnelladev-piopener-2e8f0.firebaseapp.com';
const CONFIG = path.resolve(__dirname, 'config.json');
const config = require(CONFIG);

function updateConfig() {
  var newConfig = JSON.stringify(config, null, 4);
  fs.writeFile(CONFIG, newConfig, "utf8", (err) => {
    if (err)
      console.error('ERROR: Failed to save doc id to config');
    else
      console.log('Config file updated');
  });
}

function addServerTo(opener) {
  var fireDB = firebase.firestore();
  if(config.DOC_REF && config.DOC_REF !== '') {
    opener.setUpstream(fireDB.doc('servers/' + config.DOC_REF));
    return;
  }

  fireDB.collection('servers').add({
    OPEN: false,
    CLOSED: false,
    OPENING: false,
    CLOSING: false,
    OWNER: firebase.auth().currentUser.uid
  })
  .then((doc) => {
    console.log('New entry created at', doc.id);
    config.DOC_REF = doc.id;
    updateConfig();
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
      console.log('Authenticated with UID:', user.uid);

      if(!config.UID) { // if this the first (anonymous) sign-in
        var email = user.uid + DOMAIN; // uid@thisprojectsdomain
        var password = config.ACCESS_TOKEN; // API Key as password
        var credential = firebase.auth.EmailAuthProvider
                                          .credential(email, password);
        // make this anonymous account permanent
        user.linkWithCredential(credential).then((linkedUser) => {
          console.log('User accounted created');
          config.UID = user.uid;
          updateConfig();
        }).catch((err) => {
          console.error('Could not link with given credentials\n', err);
          process.exit();
        })
      }
      initServers();
    }
  });

  // Since we use the UID as the email address, we start with anonymous sign-in
  if (!config.UID) {
    firebase.auth().signInAnonymously().catch((err) => {
      console.error('Error ' + err.code + ' signing in: ' + err.message);
    });
  } else {
    var email = config.UID + DOMAIN;
    var password = config.ACCESS_TOKEN;
    firebase.auth().signInWithEmailAndPassword(email, password).catch((err) => {
      console.error('Failed to sign in with email and password:', err);
      process.exit();
    })
  }
}

start();
