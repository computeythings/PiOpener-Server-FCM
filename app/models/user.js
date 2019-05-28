"use strict"
module.exports = class User {
  constructor(id, password, isAdmin, expiration) {
    this.id = id;
    this.password = password || '';
    this.isAdmin = isAdmin || false;
    this.expiration = expiration || 60*60; // default 1 hour temporary user
  }
};
