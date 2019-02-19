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

module.exports = class CloudDB {
  constructor(serverID, signInListener) {
    // firebase setup
    firebase.initializeApp(FIREBASE_CONFIG);
    this.serverID = serverID;
    // uid id set on login
    this.setUID = uid => {
      this.uid = uid;
      this.storage = firebase.firestore().doc(SERVER_COLLECTION + '/' + uid);
    }
    // this is mainly just here as a fallback in case of errors.
    // state changes should be managed directly at #login()
    if(signInListener) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          signInListener('login-complete', user);
        } else {
          signInListener('logout-complete')
        }
      }, (err) => {
        signInListener('auth-error', err);
      });
    }
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
  createLogin(password) {
    let email = this.serverID + '@' + FIREBASE_CONFIG.authDomain;
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
  login(password) {
    return new Promise((resolve, reject) => {
      let email = this.serverID + '@' + FIREBASE_CONFIG.authDomain;
      // once we've logged in, store the uid
      firebase.auth().signInWithEmailAndPassword(email, password).then(
        result => {
        this.setUID(result.user.uid);
        resolve(true);
      }).catch(err => {
        reject(err);
      });
    });
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

  logout() {
    return firebase.auth().signOut();
  }

  pushUpdate(data) {
    if(!this.storage)
      return Promise.reject(new Error('invalid-login'));
    return this.storage.update(data);
  }
}
