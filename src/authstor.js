"use strict"
const sql = require('sqlite3');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
// default tokens expire every day
// 1000 ms/sec * 3600 sec/hr * 24hr/day
const TOKEN_EXIPIRATION = 1000 * 3600 * 24;

module.exports = class AuthStor {
    constructor(dbLocation) {
      this.db = new sql.Database(dbLocation);
      this.db.run(
          'CREATE TABLE IF NOT EXISTS auth ' +
          '(hash TEXT UNIQUE, expiration INTEGER)'
      );

      this.containsValue = function(row, value) {
        return new Promise((resolve, reject) => {
          this.db.each('SELECT * FROM auth WHERE $row IS $value', {
            $row: row,
            $value: value
          }, (err,result) => {
            if (err)
              reject(err);
            resolve(true);
          });
        });
      }
    }

    addCredential(password, expiration) {
      if (expiration === undefined)
          expiration = TOKEN_EXIPIRATION;
      if (isNaN(expiration)) {
          console.warn('Bad input given for user expiration');
          return false;
      }

      return new Promise((resolve, reject) => {
        bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
            if (err)
              reject(err);
            this.db.run(
              'INSERT INTO auth (hash, expiration) ' +
              'VALUES ($hash, $exp)', {
               $hash: hash,
               $exp: Date.now() + expiration
            });
            resolve(true);
        });
      });
    }

    login(password) {
        return new Promise((resolve, reject) => {
          bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
              if (err)
                reject(err);
              resolve(this.containsValue('hash', hash));
          });
        });
    }

    isCredentialExpired(uid) {
        return this.db.each('SELECT * FROM auth WHERE rowid == ?', uid,
            (err, row) => {
                if (err)
                    resolve(true);
                if (row.expiration < Date.now())
                    resolve(true);
                resolve(false);
            });
    }
}
