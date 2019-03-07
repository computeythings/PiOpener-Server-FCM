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
  describe('#add(id)', () => {
    it('should add id and return its position in database', async () => {
      let result = await db.add(TEST_USER);
      // new database so the result should always be the first value (1)
      assert.equal(result, 1);
    });
  });

  describe('#login(password)', () => {
    it('should return true on login', async () => {
      let result = await db.login(TEST_USER.password);
      assert(result);
    });
  });

  describe('#isExpired(id)', () => {
    it('should return false if not expired', async () => {
      let result = await db.isExpired(TEST_USER.id);
      assert(!result);
    });
    it('should return true if expired', async () => {
      await db.add(PRE_EXPIRED_USER);
      let result = await db.isExpired(PRE_EXPIRED_USER.id);
      assert(result);
    });
  });
});
