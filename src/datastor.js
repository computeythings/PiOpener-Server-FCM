"use strict"
const sql = require('sqlite3');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = class AuthStor {
    constructor(dbLocation) {
        this.db = sql.Database(dbLocation);
        this.db.run(
            'CREATE TABLE IF NOT EXISTS auth ' +
            '(hash TEXT UNIQUE, expiration INTEGER)'
        );

        this.containsValue = function(row, value) {
            return this.db.each('SELECT * FROM auth WHERE $row IS $value', {
             $row: row,
             $value: value
            }, (err,result) => {
                if (err)
                    resolve(false);
                resolve(true);
            });
        }
    }
    
    addPass(password, expiration) {
        if (expiration === undefined)
            expiration = 86400000;
        if (isNan(expiration)) {
            console.warn('Bad input given for user expiration');
            return false;
        }

        return bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.error(err);
                resolve(false);
            }

            this.db.run(
                'INSERT INTO auth (hash, expiration) ' +
                'VALUES ($hash, $exp)', {
                 $hash: hash,
                 $exp: Date.now() + expiration
            });

            resolve(true);
        });
    }

    login(password) {
        return bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
             console.error(err);
             resolve(false);
            }
            resolve(this.db.containsValue('hash', hash));
        });
    }

    isUserExpired(uid) {
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

