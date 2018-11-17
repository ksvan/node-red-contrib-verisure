module.exports = function (RED) {
  'use strict';

  function VerisureAlarmNode (config) {
    RED.nodes.createNode(this, config);

    // initial config of the node  ///
    var node = this;
    const Verisure = require('verisure');
    // Retrieve the config node
    try {
      this.verUser = RED.nodes.getNode(config.user);
    }
    catch (err) {
      this.error('Error, no login node exists - verisure.js l-13: ' + err);
      this.debug('Couldnt get config node : ' + this.verUser);
    }
    if (typeof node.verUser === 'undefined' || !node.verUser || !node.verUser.credentials.username || !node.verUser.credentials.password) {
      this.warn('No credentials given! Missing config node details. Verisure.js l-19 :' + node.verUser);
      return;
    }
    // what to do with payload incoming ///
    this.on('input', function (msg) {
      let lastStatus = 'DISARMED';
      let currentStatus = 'test';
      let result = {};
      this.status({ fill: 'orange', shape: 'ring', text: 'fetching' });
      // Verisure setup (moved to on-input creation of the object, reuse across events trigger an auth error from Verisure)
      let verisure = new Verisure(this.verUser.credentials.username, this.verUser.credentials.password);
      // todo add input validation
      // take action, check status
      verisure.getToken()
        .then(() => verisure.getInstallations())
        .then(installations => installations[0].getOverview())
        .then((overview) => {
          currentStatus = overview.armState.statusType;
          // Fix code, adapt to nodered
          result = { 'currentStatus': currentStatus, 'changed': false, 'date': overview.armState.date, 'name': overview.armState.name };
          if (currentStatus !== lastStatus) {
            // Update as changed state before sending
            result.changed = true;
          }
          lastStatus = overview.armState.statusType;
          // return current status, reuse existing object, replace only payload
          msg.payload = result;
          this.status({ fill: 'green', shape: 'ring', text: 'waiting' });
          this.debug('Status fetched : ' + result.name);
          this.send(msg);
        })
        .catch((error) => {
          this.error({ 'Error': error });
          this.debug('Error when fetching Verisure status, verisure On msg async use of Verisure package: ' + currentStatus);
          this.status({ fill: 'red', shape: 'ring', text: 'error' });
          msg.payload = { 'Error': true, 'message': error };
          this.send(msg);
        });
    });

    // tidy up
    this.on('close', function () {

    });
  }

  RED.nodes.registerType('VerisureAlarmNode', VerisureAlarmNode);
};

/*
Consider todo:
  - move Verisure connection to config node, share connection between nodes
*/
