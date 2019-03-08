"use strict"
require('dotenv').config();
process.env.SERVER_NAME = 'TEST_SERVER_NAME';
process.env.SECRET = 'S3KRET';

const jwt = require('jsonwebtoken');
const tokens = require(__dirname + '/../app/util/tokenhandler.js');
const assert = require('assert');

const testID = 'master';
const fakeSecret = 'FAKE-S3KRET';
var tokenRef,tokenAcc,fakeTokenRef,fakeTokenAcc,expiredRef,expiredAcc;

describe('tokenhandler.js', () => {
  
  describe('#generateRefreshToken(id)', () => {

    it('should generate a valid token given an id', () => {
      tokenRef = tokens.generateRefreshToken(testID);
      fakeTokenRef = tokens.generateRefreshToken(testID, null, 60*60*24*30,
        fakeSecret);
      expiredRef = tokens.generateRefreshToken(testID, null, -3600);
      assert(jwt.verify(tokenRef, process.env.SECRET));
    });
  });

  describe('#generateAccessToken(refreshToken)', () => {

    it('should generate an access token given a valid refresh token', () => {
      tokenAcc = tokens.generateAccessToken(tokenRef);
      fakeTokenAcc = tokens.generateAccessToken(fakeTokenRef, null, 60*60*24*30,
        fakeSecret, fakeSecret);
      expiredAcc = tokens.generateAccessToken(tokenRef, null, -3600);
      assert(jwt.verify(tokenRef, process.env.SECRET));
    });

    it('should fail to generate an access token given falsified refresh token',
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
        tokens.verifyAccessToken(expiredRef);
        done(Error('Failed to reject falsified token'));
      } catch(err) {
        assert.equal('TokenExpiredError', err.name);
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
        tokens.verifyAccessToken(expiredAcc);
        done(Error('Failed to reject falsified token'));
      } catch(err) {
        assert.equal('TokenExpiredError', err.name);
        done();
      }
    });
  });
});
