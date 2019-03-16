require('dotenv').config();
const fs = require('fs');

const envVars = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  NODE_ENV: process.env.NODE_ENV,
  SERVER_NAME: process.env.SERVER_NAME,
  SERVER_ID: process.env.SERVER_ID,
  SERVER_ACCESS_KEY: process.env.SERVER_ACCESS_KEY,
  SERVER_COLLECTION: process.env.SERVER_COLLECTION,
  SERVER_CERT: process.env.SERVER_CERT,
  SERVER_KEY: process.env.SERVER_KEY,
  SECRET: process.env.SECRET,
  OPEN_PIN: process.env.OPEN_PIN,
  CLOSED_PIN: process.env.CLOSED_PIN,
  RELAY_PIN: process.env.RELAY_PIN,
  SERVER_PORT: process.env.SERVER_PORT,
  SESSION_SECRET: process.env.SESSION_SECRET
}

exports.saveVars = () => {
  var list = '';
  Object.entries(envVars).forEach(([key, val]) => {
    list += key + '= ' + val + '\n';
  });
  fs.writeFileSync('.env', list);
}

exports.replaceVar = (varName, varData) => {
  var env = fs.readFileSync('.env', 'utf8');
  var env = env.replace(new RegExp(varName + '=.*'), varName + '= ' + varData);
  fs.writeFileSync('.env', env);
}
