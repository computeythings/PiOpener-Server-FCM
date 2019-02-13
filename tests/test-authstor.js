"use strict"
const authstor = require('../src/authstor.js');
const assert = require('assert');

const stor = new authstor(':memory:');
const TEST_PWD = 'testPassword';

stor.login(TEST_PWD).then((res) => {
  let result = '';
  try {
    assert(res);
    result = 'Passed!';
  } catch(err) {
    result = 'Failed.';
  }
  console.log('Login Test:', result);
});

stor.addCredential(TEST_PWD, -1).then((res) => {
  let result = '';
  try {
    assert(res);
    result = 'Passed!';
  } catch(err) {
    result = 'Failed.';
  }
  console.log('Add Credential Test:', result);
});



/*
stor.isCredentialExpired(0).then((res) => {
    // credential should not be expired yet
    assert(!res);
})
*/
