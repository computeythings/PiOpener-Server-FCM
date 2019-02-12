"use strict"
const jwt = require('jsonwebtoken');

module.exports = class TokenGenerator {
    constructor(cert, key) {
        this.cert = cert;
        this.key = key;
    }
    generate(uid) {
        return jwt.sign({ uid: uid }, this.key, 
        { 
            algorithm: 'RS256', 
            expiresIn: '15m' 
        });
    }
    // throws Invalid Signature if signature is bad
    verify(token) {
        return jwt.verify(token, this.cert);
    }
}
