"use strict"
const tokenhandler = require(__dirname + '/../src/tokenhandler.js');
const fs = require('fs');

const key = fs.readFileSync(__dirname + '/test-key.key');
const cert = fs.readFileSync(__dirname + '/test-cert.cert');
const testUID = '123456';

var assert = {
  equal: function(firstValue, secondValue) {
        if (firstValue != secondValue)
            throw new Error('Assert failed, ' + firstValue +
                ' is not equal to ' + secondValue + '.');
    },
  notequal: function(firstValue, secondValue) {
        if (firstValue == secondValue)
            throw new Error('Assert failed, ' + firstValue +
                ' is equal to ' + secondValue + '.');
  }
};

let tokens = new tokenhandler(cert, key);
var token = tokens.generate(testUID);
var verified = tokens.verify(token);

var result;
try {
    assert.equal(verified.uid, testUID);
    result = 'Passed!';
} catch(err) {
    result = 'Failed.'
}

console.log('Token generation + validation:', result);

