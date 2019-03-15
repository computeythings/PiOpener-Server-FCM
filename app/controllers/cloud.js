"use strict"
require('dotenv').config();
const firebase = require('firebase');
require('firebase/firestore');

const SERVER_COLLECTION = process.env.SERVER_COLLECTION;
const FIREBASE_CONFIG = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId
  };

module.exports = class CloudDB {
  constructor(callback) {
    // firebase setup
    firebase.initializeApp(FIREBASE_CONFIG);
    // uid id set on login
    this.setUID = uid => {
      this.uid = uid;
      this.storage = firebase.firestore().doc(SERVER_COLLECTION + '/' + uid);
    }
    // this is mainly just here as a fallback in case of errors.
    // state changes should be managed directly at #login()
    if(callback) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          callback(null, user);
        } else {
          callback(null, false);
        }
      }, (err) => {
        callback(err);
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
  createLogin() {
    let email = process.env.SERVER_ID + '@' + FIREBASE_CONFIG.authDomain;
    return firebase.auth().createUserWithEmailAndPassword(email,
      process.env.SERVER_ACCESS_KEY);
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
  login() {
    return new Promise((resolve, reject) => {
      let email = process.env.SERVER_ID + '@' + FIREBASE_CONFIG.authDomain;
      // once we've logged in, store the uid
      firebase.auth().signInWithEmailAndPassword(email,
        process.env.SERVER_ACCESS_KEY).then(
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
