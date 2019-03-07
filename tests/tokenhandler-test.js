"use strict"
require('dotenv').config();
process.env.SERVER_NAME = 'TEST_SERVER_NAME';

const jwt = require('jsonwebtoken');
const tokenhandler = require(__dirname + '/../app/util/tokenhandler.js');
const assert = require('assert');

const testID = 'master';
var tokens = new tokenhandler({ secret: 'S3KRET' });
var fakeTokens = new tokenhandler({ secret: 'WRONG-S3KRET' });
var tokenRef,tokenAcc,fakeTokenRef,fakeTokenAcc;

/*
  NOTE: These tokens are pre-generated with the following settings:
  {
    alg: HS256,
    iss: TEST_SERVER_NAME,
    secret: S3KRET
  }

  Any changes to those test values must also be reflected here
  or tests will not be accurate.
  */
const validButExpiredRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJURVNUX1NFUlZFUl9OQU1FIiwic3ViIjoibWFzdGVyIiwiYXVkIjoicmVmcmVzaCIsImlhdCI6MTQ1MTkxODE0MCwiZXhwIjoxNDU0NTEwMTQwfQ.tV4nn7W0iBXCYmDujepM26pxI7jo-iiBJHh_aRO-Sm8';
const validButExpiredAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJURVNUX1NFUlZFUl9OQU1FIiwic3ViIjoibWFzdGVyIiwiYXVkIjoiYWNjZXNzIiwiaWF0IjoxNDUxOTE4Mzc5LCJleHAiOjE0NTE5MjE5Nzl9.ee1mD8IjXHWU4FiRzUO1GqRhkFy0eLauVpA7yPA-iTE';

describe('tokenhandler.js', () => {
  describe('#generateRefreshToken(id)', () => {
    it('should generate a valid token given an id', () => {
      tokenRef = tokens.generateRefreshToken(testID);
      fakeTokenRef = fakeTokens.generateRefreshToken(testID);
      assert(jwt.verify(tokenRef, 'S3KRET'));
    });
  });

  describe('#generateAccessToken(refreshToken)', () => {
    it('should generate an access token given a valid refresh token', () => {
      tokenAcc = tokens.generateAccessToken(tokenRef);
      fakeTokenAcc = fakeTokens.generateAccessToken(fakeTokenRef);
      assert(jwt.verify(tokenRef, 'S3KRET'));
    });
    it('should fail to generate an access token given an invalid refresh token',
    done => {
      try {
        tokens.generateAccessToken(fakeTokenRef);
        done(Error('Failed to reject falsified token'));
      } catch(err) {
        assert.equal('JsonWebTokenError', err.name);
        done();
      }
    });
  });

  describe('#verifyRefreshToken(token)', () => {
    it('should return true if a token is valid', () => {
      assert(tokens.verifyRefreshToken(tokenRef));
    });
    it('should throw an error if a token was falsified', done => {
      // I couldn't get assert.throws to work here to this is the workaround
      try {
        tokens.verifyRefreshToken(fakeTokenRef);
        done(Error('Failed to reject falsified token'));
      } catch(err) {
        assert.equal('JsonWebTokenError', err.name);
        done();
      }
    });
    it('should throw an error if a token is expired', done => {
      // I couldn't get assert.throws to work here to this is the workaround
      try {
        tokens.verifyAccessToken(validButExpiredRefreshToken);
        done(Error('Failed to reject falsified token'));
      } catch(err) {
        assert.equal('JsonWebTokenError', err.name);
        done();
      }
    });
  });

  describe('#verifyAccessToken(token)', () => {
    it('should return true if a token is valid', () => {
      assert(tokens.verifyAccessToken(tokenAcc));
    });
    it('should throw an error if a token was falsified', done => {
      // I couldn't get assert.throws to work here to this is the workaround
      try {
        tokens.verifyAccessToken(fakeTokenAcc);
        done(Error('Failed to reject falsified token'));
      } catch(err) {
        assert.equal('JsonWebTokenError', err.name);
        done();
      }
    });
    it('should throw an error if a token is expired', done => {
      // I couldn't get assert.throws to work here to this is the workaround
      try {
        tokens.verifyAccessToken(validButExpiredAccessToken);
        done(Error('Failed to reject falsified token'));
      } catch(err) {
        assert.equal('JsonWebTokenError', err.name);
        done();
      }
    });
  });
});
