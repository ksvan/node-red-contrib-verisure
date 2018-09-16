module.exports = function (RED) {
  'use strict';

  function VerisureNode (config) {
    RED.nodes.createNode(this, config);

    // initial config of the node  ///
    var node = this;
    // Retrieve the config node
    try {
      this.verUser = RED.nodes.getNode(config.user);
    } catch (err) {
      this.error('Error, no login node exists - verisure.js l-13: ' + err);
      this.debug('Couldnt get config node : ' + this.verUser);
    }

    if (typeof node.verUser === 'undefined' || !node.verUser || !node.verUser.credentials.username || !node.verUser.credentials.password) {
      this.warn('No credentials given! Missing config node details. Verisure.js l-17 :' + node.verUser);
      return;
    }

    var lastStatus = 'test1';
    var currentStatus = 'test';

    // what to do with payload incoming ///
    this.on('input', function (msg) {
      this.status({ fill: 'orange', shape: 'ring', text: 'fetching' });
      // Verisure setup (moved to on-input creation of the object, reuse across events trigger an auth error from Verisure)
      var Verisure = require('verisure');
      var verisure = new Verisure(this.verUser.credentials.username, this.verUser.credentials.password);
      // todo add input validation

      // take action, check status
      verisure.getToken()
        .then(() => verisure.getInstallations())
        .then(installations => installations[0].getOverview())
        .then((overview) => {
          currentStatus = overview.armState.statusType;
          // Fix code, adapt to nodered
          if (currentStatus !== lastStatus) {
            // Update Webtask Storage with new status
            currentStatus = { 'currentStatus': currentStatus, 'changed': true };
          } else {
            // Nothing has changed, just return the state as JSON
            currentStatus = { 'currentStatus': currentStatus, 'changed': false };
          }
          // return current status, reuse existing object, replace only payload
          msg.payload = currentStatus;
          this.status({ fill: 'green', shape: 'ring', text: 'waiting' });
          this.debug('Status fetched : ' + currentStatus.payload);
          this.send(msg);
        })

        .catch((error) => {
          currentStatus = { 'Error': error };
          this.error(currentStatus);
          this.debug('Error when fetching Verisure status, verisure On msg async use of Verisure package: ' + currentStatus.payload);
          this.status({ fill: 'red', shape: 'ring', text: 'error' });
          this.send(msg);
        });
    });

    // tidy up
    this.on('close', function () {

    });
  }

  RED.nodes.registerType('VerisureNode', VerisureNode);
};

/*
Consider todo:
  - move Verisure connection to config node, share connection between nodes
  - add support for mapping out more devices from overview
*/
