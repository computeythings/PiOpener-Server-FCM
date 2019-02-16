"use strict"
const sql = require('sqlite3');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
// default tokens expire every day
// 1000 ms/sec * 3600 sec/hr * 24hr/day * 1 day
const TOKEN_EXIPIRATION = 1000 * 3600 * 24 * 1;

module.exports = class AuthStor {
  constructor(dbLocation) {
    this.dbLocation = dbLocation;
  }

  init() {
    return new Promise((resolve, reject) => {
      this.db = new sql.Database(this.dbLocation);
      this.db.run(
        'CREATE TABLE IF NOT EXISTS auth ' +
        '(id TEXT UNIQUE, password TEXT, expiration INTEGER)', (err) => {
          if (err)
            reject(err);
          resolve(this);
        });
    });
  }

  addCredential(cred) {
    if (cred.expiration === undefined)
        cred.expiration = TOKEN_EXIPIRATION;
    if (isNaN(cred.expiration)) {
        return Promise.reject(
          new Error('Bad input given for user expiration')
        );
    }

    return new Promise((resolve, reject) => {
      bcrypt.hash(cred.password, SALT_ROUNDS, (err, hash) => {
          if (err)
            reject(err);
          this.db.run(
            'INSERT INTO auth (id, password, expiration) ' +
            'VALUES ($id, $pass, $exp)', {
             $id: cred.id,
             $pass: hash,
             $exp: Date.now() + cred.expiration
          }, function(err) {
            if (err)
              reject(err);
            resolve(this.lastID);
          });
      });
    });
  }

  removeCredential(id) {
    return new Promise((resolve, reject) => {
        this.db.run('DELETE FROM auth WHERE id == ?', id, function(err) {
        if (err)
          reject(err);
        resolve(this.changes);
      });
    });
  }

  // compare to row 0 since we'll only have one master password.
  // guests and temporary users will all be token-based.
  login(password) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM auth WHERE id == \'master\' LIMIT 1',
      (err, row) => {
        if (err)
          reject(err);
        bcrypt.compare(password, row.password, (err, res) =>{
          if (err)
            reject(err);
          resolve(res);
        });
      });
    });
  }

  isCredentialExpired(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM auth WHERE id == ? LIMIT 1', id,
      (err, row) => {
        if (err)
          reject(err);
        if (row === undefined) {
          var error = new Error();
          error.name = 'NoSuchIdError';
          error.message = 'Could not find id ' + id;
          reject(error);
        }
        resolve(row.expiration < Date.now());
      });
    });
  }
}
