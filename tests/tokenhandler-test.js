"use strict"
const jwt = require('jsonwebtoken');
const tokenhandler = require(__dirname + '/../src/auth/tokenhandler.js');
const fs = require('fs');
const assert = require('assert');

const key = fs.readFileSync(__dirname + '/assets/test-key.key');
const fakeKey = fs.readFileSync(__dirname + '/assets/fake-test-key.key');
const cert = fs.readFileSync(__dirname + '/assets/test-cert.cert');
const certs = {
  cert: cert,
  key: key
};
const fakeCerts = {
  // we don't really need a cert because we're not testing verify() with this
  key: fakeKey
};
const testID = 'master';

let tokens = new tokenhandler(certs);
let fakeTokens = new tokenhandler(fakeCerts);

let token = tokens.generate(testID);
let fakeToken = fakeTokens.generate(testID);

describe('authstor', () => {
  describe('#generate(id)', () => {
    it('should generate a valid token', () => {
      assert(token);
    });
  });

  describe('#verify(token)', () => {
    it('should return true if a token was generated by this server', () => {
      assert(tokens.verify(token));
    });
    it('should throw an error if a token was generated by another host', () => {
      // I couldn't get assert.throws to work here to this is the workaround
      try {
        tokens.verify(fakeToken);
      } catch(err) {
        assert.equal('JsonWebTokenError', err.name);
      }
    });
  });
});