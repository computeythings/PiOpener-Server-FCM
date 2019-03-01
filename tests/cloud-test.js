const CloudDB = require('../app/controllers/cloud.js');
const assert = require('assert');

const testID = 'testserver2';
const testPassword = 'testPassword';
const cloud = new CloudDB(testID);

// cleanup to a default state
after(() =>{
  cloud.pushUpdate({STATE: 'NONE'}).then(() => {
    cloud.logout();
  });
});

describe('cloud.js', () => {
  describe('#login(password)', () => {
    it('should successfully login a test user with a password', (done) => {
      cloud.login(testPassword).then(result => {
        assert(result);
        done();
      });
    });
  });

  describe('#pushUpdate(data)', () => {
    it('should successfully push test data', (done) => {
      // firestore.update resolves to void when successful so just call done()
      cloud.pushUpdate({STATE: 'TEST'}).then(result => {
        done();
      }).catch(err => {
        done(err.message);
      });
    });
  });
});
