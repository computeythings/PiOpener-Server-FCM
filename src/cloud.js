const firebase = require('firebase');
require('firebase/firestore');

const SERVER_COLLECTION = 'servers';
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdfTfGXd002L2rOSrtdcgl0HhyQLJ3r60",
    authDomain: "gonnelladev-piopener-2e8f0.firebaseapp.com",
    databaseURL: "https://gonnelladev-piopener-2e8f0.firebaseio.com",
    projectId: "gonnelladev-piopener-2e8f0",
    storageBucket: "gonnelladev-piopener-2e8f0.appspot.com",
    messagingSenderId: "170252164931"
  };

modules.export = class CloudDB {
  constructor(signInListener) {
    // firebase setup
    firebase.initializeApp(FIREBASE_CONFIG);


    // this is mainly just here as a fallback in case of errors.
    // state changes should be managed directly at #login()
    firebase.auth().onAuthStateChanged((user) => {
      if(!signInListener)
        return;
      if (user) {
        signInListener('login-complete', user);
      } else {
        signInListener('logout-complete')
      }
    }, (err) => {
      if(!signInListener)
        return;
      signInListener('auth-error', err);
    });
  }

  /*
    ---Error Codes---
    <auth/email-already-in-use>
    Thrown if there already exists an account with the given email address.
    <auth/invalid-email>
    Thrown if the email address is not valid.
    <auth/operation-not-allowed>
    Thrown if email/password accounts are not enabled. Enable email/password accounts in the Firebase Console, under the Auth tab.
    <auth/weak-password>
    Thrown if the password is not strong enough.
  */
  createLogin(serverID, password) {
    let email = serverID + '@' + FIREBASE_CONFIG.authDomain;
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }
  /*
    Logins are managed by auto-generated server IDs and user's master passwords.

    ---Error Codes---
    <auth/invalid-email>
    Thrown if the email address is not valid.
    <auth/user-disabled>
    Thrown if the user corresponding to the given email has been disabled.
    <auth/user-not-found>
    Thrown if there is no user corresponding to the given email.
    <auth/wrong-password>
    Thrown if the password is invalid for the given email, or the account corresponding to the email does not have a password set.
  */
  login(serverID, password) {
    let email = serverID + '@' + FIREBASE_CONFIG.authDomain;
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  /*
    ---Error Codes---
    <auth/custom-token-mismatch>
    Thrown if the custom token is for a different Firebase App.
    <auth/invalid-custom-token>
    Thrown if the custom token format is incorrect.
  */
  loginWithToken(token) {
    return firebase.auth().signInWithCustomToken(token);
  }



  /*
    Creates/Accesses a firestore document to save state to which clients will
    subscribe to and be notified upon changes.
  */
  getServerDoc() {
    var database = firebase.firestore();
    return new Promise((resolve, reject) => {
      /* TODO: edit to check for doc at server id and create if it doesn't exist
      if(config.DOC_REF && config.DOC_REF !== '') {
        resolve(database.doc(SERVER_COLLECTION + '/' + config.DOC_REF));
      } else {
        // if a doc ref doesn't exist, create a new one with this user as owner
        database.collection(SERVER_COLLECTION).add({
          STATE: 'NONE',
          OWNER: firebase.auth().currentUser.uid
        })
        .then((doc) => {
          console.log('New entry created at', doc.id);
          config.DOC_REF = doc.id;
          resolve(getServerDoc(database));
        })
        .catch((err) => {
          // kill application if we cannot create a document to store server info
          console.error('ERROR: Failed to create new server document:\n', err);
          reject(err);
        });
      }
      */
    });
  }
}
