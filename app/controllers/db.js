"use strict"
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
// default tokens expire every hour
// 1000 ms/sec * 60 sec/min * 60 min/hr
const DEFAULT_EXPIRATION = 1000*60*60;

const mongoose = require('mongoose');
const User = mongoose.model('User', {
  id: String,
  password: String,
  expiration: Date
});

const Server = mongoose.model('Server', {
  address: String,
  oauth: String
});

const Token = mongoose.model('Token', {
  server: String,
  value: String
});

/*
queries can be handled as:
     var foo= getUser(username)
     foo.exec((err, adventure) => {});
*/
// users collection =========================================================
module.exports.getUser = (username) => {
    return User.findOne({ id: username }, 'id expiration');
}
module.exports.allUsers = () => {
  return User.find({}, 'id expiration');
}
module.exports.allCurrentUsers = () => {
  return User.find({ expiration: { $lt: new Date() } }, 'id expiration');
}

module.exports.addUser = userInfo => {
  return new Promise((resolve, reject) => {
    const user = new User(userInfo);
    bcrypt.hash(user.password, SALT_ROUNDS, (err, hash) => {
        if (err)
          reject(err);
        user.password = hash;
        user.save(err => {
          if(err)
            return reject(err);
          resolve(user);
        });
    });
  });
}


// servers collection =======================================================
module.exports.allServers = () => {
  return Server.find({});
}
module.exports.managedServers = () => {
  return Server.find({ oauth: null });
}
module.exports.requestingServers = () => {
  return Server.find({ oauth: { $ne: null } });
}

module.exports.addConnectionRequest = remoteAddress => {
  const server = new Server({
    address: remoteAddress,
    oauth: null
  });
  return server.save();
}


// oauth collection ========================================================
module.exports.allTokens = () => {
  return Token.find({});
}
module.exports.getToken = server => {
  return Token.findOne({ server: server });
}

module.exports.addToken = (server, token) => {
  const token = new Token({
    server: server,
    value: token
  });
  return token.save();
}

// mongodb interface =======================================================
module.exports.close = () => {
  mongoose.connection.close();
}

// Connect the database when the file is initialized
// only if a connection is not already open
if(mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb://localhost:27017/piopener', {useNewUrlParses: true});
}
