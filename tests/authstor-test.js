"use strict"
const authstor = require('../app/util/authstor.js');
const assert = require('assert');
const User = require('../app/models/user.js');

const TEST_USER = new User('master', 'testPassword', 360000);
const PRE_EXPIRED_USER = new User('preExpired', 'testPassword', -360000);

var db;
before(async () => {
  db = await new authstor(':memory:').init();
});

describe('authstor.js', () => {
  describe('#addUser(user)', () => {
    it('should add user and return its ID', async () => {
      let result = await db.addUser(TEST_USER);
      // new database so the result should always be the first value (1)
      assert.equal(result, 1);
    });
  });

  describe('#login(password)', () => {
    it('should return true on login with added users', async () => {
      let result = await db.login(TEST_USER.password);
      assert(result);
    });
  });

  describe('#isUserExpired(id)', () => {
    it('should return false if a user is not expired', async () => {
      let result = await db.isUserExpired(TEST_USER.id);
      assert(!result);
    });
    it('should return true if a user is expired', async () => {
      await db.addUser(PRE_EXPIRED_USER);
      let result = await db.isUserExpired(PRE_EXPIRED_USER.id);
      assert(result);
    });
  });
});
