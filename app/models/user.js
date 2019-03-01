module.exports = class User {
  constructor(id, password, expiration) {
    this.id = id;
    this.password = password;
    this.expiration = expiration;
  }
};
