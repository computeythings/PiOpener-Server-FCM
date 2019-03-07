"use strict"
require('dotenv').config();
const jwt = require('jsonwebtoken');

const ISSUER =  process.env.SERVER_NAME || 'PiOpener-Server';
const ACCESS_AUD = 'access';
const REFRESH_AUD = 'refresh';

module.exports = class TokenGenerator {
  constructor(certs) {
    this.cert = certs.cert;
    this.key = certs.key;
    this.secret = certs.secret;

    if(this.secret) {
      // secret is equivalent to a symmetrical cert/key
      this.cert = this.key = this.secret;
      this.algorithm = 'HS256';
    }
    else
      this.algorithm = 'RS256';
  }

  verifyRefreshToken(token, callback) {
    return jwt.verify(token, this.cert, { iss: ISSUER, aud: REFRESH_AUD },
      callback);
  }

  // throws Invalid Signature if signature is bad
  verifyAccessToken(token, callback) {
    return jwt.verify(token, this.cert, { iss: ISSUER, aud: ACCESS_AUD },
      callback);
  }

  generateRefreshToken(id, callback) {
    return jwt.sign(
      {
        iss: ISSUER,
        sub: id,
        aud: REFRESH_AUD
      },
      this.key,
      {
          algorithm: this.algorithm,
          expiresIn: '30d'
      }, callback
    );
  }

  generateAccessToken(refreshToken, callback) {
    if(callback) {
      return new Promise((resolve, reject) => {
        this.verifyRefreshToken(refreshToken, (err, decoded) => {
          if(err) { reject(err); }
          resolve(jwt.sign(
            {
              iss: ISSUER,
              sub: decoded.sub,
              aud: ACCESS_AUD
            },
            this.key,
            {
              algorithm: this.algorithm,
              expiresIn: '1h'
            }, callback
          ));
        });
      })
    } else {
      try {
        let decoded = this.verifyRefreshToken(refreshToken);
        return jwt.sign(
          {
            iss: ISSUER,
            sub: decoded.sub,
            aud: ACCESS_AUD
          },
          this.key,
          {
            algorithm: this.algorithm,
            expiresIn: '1h'
          }
        );
      } catch(err) {
        throw err;
      }
    }
  }
}
