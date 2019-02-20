"use strict"
const authstor = require('../src/auth/authstor.js');
const assert = require('assert');

const TEST_CREDENTIAL = {
  id: 'master',
  password: 'testPassword',
  expiration: 360000
};
const PRE_EXPIRED_CREDENTIAL = {
  id: 'preExpired',
  password: 'testPassword',
  expiration: -360000
};

var db;
before(async () => {
  db = await new authstor(':memory:').init();
});

describe('authstor.js', () => {
  describe('#addCredential(credential)', () => {
    it('should add credential and return its ID', async () => {
      let result = await db.addCredential(TEST_CREDENTIAL);
      // new database so the result should always be the first value (1)
      assert.equal(result, 1);
    });
  });

  describe('#login(password)', () => {
    it('should return true on login with added credentials', async () => {
      let result = await db.login(TEST_CREDENTIAL.password);
      assert(result);
    });
  });

  describe('#isCredentialExpired(id)', () => {
    it('should return false if a credential is not expired', async () => {
      let result = await db.isCredentialExpired(TEST_CREDENTIAL.id);
      assert(!result);
    });
    it('should return true if a credential is expired', async () => {
      await db.addCredential(PRE_EXPIRED_CREDENTIAL);
      let result = await db.isCredentialExpired(PRE_EXPIRED_CREDENTIAL.id);
      assert(result);
    });
  });
});
