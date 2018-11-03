module.exports = function (RED) {
  'use strict';
  function VerisureConfig (config) {
    RED.nodes.createNode(this, config);
    this.username = config.username;
    this.password = config.password;
    this.siteName = config.siteName;
    this.displayName = config.displayName;
  }
  RED.nodes.registerType('VerisureConfig', VerisureConfig, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  }
  );
};
// simple config node to store away logon secrets
