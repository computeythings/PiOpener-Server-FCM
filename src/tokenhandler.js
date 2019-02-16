"use strict"
const jwt = require('jsonwebtoken');

module.exports = class TokenGenerator {
  constructor(certs) {
    this.cert = certs.cert;
    this.key = certs.key;
  }

  generate(id) {
    return jwt.sign({ id: id }, this.key,
    {
      algorithm: 'RS256',
      expiresIn: '1h'
    });
  }
  // throws Invalid Signature if signature is bad
  verify(token) {
    return jwt.verify(token, this.cert);
  }
}
