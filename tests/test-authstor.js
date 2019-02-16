"use strict"
const authstor = require('../src/authstor.js');
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
const TEST_LOGIN = {
  id: TEST_CREDENTIAL.id,
  password: TEST_CREDENTIAL.password
};

var db;
before(async () => {
  db = await new authstor(':memory:').init();
});

describe('authstor', () => {
  describe('#addCredential(credential)', () => {
    it('should add credential and return its ID', async () => {
      let result = await db.addCredential(TEST_CREDENTIAL);
      assert.equal(result, TEST_CREDENTIAL_ID);
    });
  });

  describe('#login(credential)', () => {
    it('should return true on login with added credentials', async () => {
      let result = await db.login(TEST_LOGIN);
      assert(result);
    });
  });

  describe('#login(credential)', () => {
    it('should return false if a credential is not expired', async () => {
      let result = await db.isCredentialExpired(TEST_LOGIN);
      assert(!result);
    });
    it('should return true if a credential is expired', async () => {
      let id = await db.addCredential(PRE_EXPIRED_CREDENTIAL);
      let result = await db.isCredentialExpired({id: id});
      assert(result);
    });
  });
});
