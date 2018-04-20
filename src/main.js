const argv = require('minimist')(process.argv.slice(2));
const TCPServer = require('./sockserver.js');
const RESTServer = require('./restserver.js');
const Opener = require('./gopener.js');
const fs = require('fs');
const path = require('path');
const firebase = require('firebase');
require('firebase/firestore');

const DOMAIN = '@gonnelladev-piopener-2e8f0.firebaseapp.com';
const SERVER_COLLECTION = 'servers';
const CONFIG = path.resolve(__dirname, '../config.json');
const config = require(CONFIG);

/*
  Writes any changes to the config variable to the config file
*/
function updateConfig() {
  var newConfig = JSON.stringify(config, null, 4); // args for readable spacing
  fs.writeFile(CONFIG, newConfig, "utf8", (err) => {
    if (err)
      console.error('ERROR: Failed to save doc id to config');
    else
      console.log('Config file updated');
  });
}

/*
  Creates/Accesses a firestore document to save state to which clients will
  subscribe to and be notified upon changes.
*/
function getServerDoc(fireDB) {
  return new Promise((resolve, reject) => {
    if(config.DOC_REF && config.DOC_REF !== '') {
      resolve(fireDB.doc(SERVER_COLLECTION + '/' + config.DOC_REF));
    } else {
      // if a doc ref doesn't exist, create a new one with this user as owner
      fireDB.collection(SERVER_COLLECTION).add({
        STATE: 'NONE',
        OWNER: firebase.auth().currentUser.uid
      })
      .then((doc) => {
        console.log('New entry created at', doc.id);
        config.DOC_REF = doc.id;
        updateConfig();
        resolve(getServerDoc(fireDB));
      })
      .catch((err) => {
        // kill application if we cannot create a document to store server info
        console.error('ERROR: Failed to create new server document:\n', err);
        reject(Error('Stopping all running servers.'));
        process.exit();
      });
    }
  });
}

/*
  Run only after the application has successfully authenticated with
  the Firebase server.
*/
function initServers() {
  // read pin values from config file
  var opener = new Opener(config.OPEN_SWITCH_PIN, config.CLOSED_SWITCH_PIN,
                            config.RELAY_PIN);
  const firestore = firebase.firestore();
  getServerDoc(firestore).then(docRef => {
    opener.setUpstream(docRef);
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
}


/*
  Connects to firebase DB and starts all relevant servers
*/
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
        // API Key as password
        if (!config.ACCESS_TOKEN || config.ACCESS_TOKEN === '') {
          config.ACCESS_TOKEN = require('./keygen.js').apikey(26);
          updateConfig();
        }
        var password = config.ACCESS_TOKEN
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
    } else {
      console.log('Signed out of firebase');
    }
  });

  // since we use the UID as the email address, we start with anonymous sign-in
  if (!config.UID) {
    firebase.auth().signInAnonymously().catch((err) => {
      console.error('Error ' + err.code + ' signing in: ' + err.message);
    });
  } else {
    // if UID exists, just sign in
    var email = config.UID + DOMAIN;
    var password = config.ACCESS_TOKEN;
    firebase.auth().signInWithEmailAndPassword(email, password).catch((err) => {
      console.error('Failed to sign in with email and password:', err);
      process.exit();
    })
  }
}


// run the server on execution
start();
