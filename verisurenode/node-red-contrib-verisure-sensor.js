module.exports = function (RED) {
  'use strict';

  function VerisureSensorNode (config) {
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

    // what to do with payload incoming ///
    this.on('input', function (msg) {
      this.status({ fill: 'orange', shape: 'ring', text: 'fetching' });
      var Verisure = require('verisure');
      var verisure = new Verisure(this.verUser.credentials.username, this.verUser.credentials.password);
      var currentReadings;
      // todo add input validation

      // take action, check status
      verisure.getToken()
        .then(() => verisure.getInstallations())
        .then(installations => installations[0].getOverview())
        .then((overview) => {
          // switch on the node-red payload to figure what to do
          switch (msg.payload.type) {
            case 'site':
              currentReadings = overview;
              break;
            case 'climate':
              currentReadings = climateGet(msg, overview);
              break;
            case 'lock':
              currentReadings = lockGet(msg, overview);
              break;
            case 'doorWindow':
              currentReadings = doorWindowGet(msg, overview);
              break;
          }

          // Close up and return
          this.status({ fill: 'green', shape: 'ring', text: 'waiting' });
          this.debug('Status fetched : ' + currentReadings);
          msg.payload = currentReadings;
          this.send(msg);
        })

        .catch((error) => {
          currentReadings = { 'Error': error };
          this.error(currentReadings);
          this.debug('Error when fetching Verisure sensor metrics, verisure On msg async use of Verisure package: ' + currentReadings);
          this.status({ fill: 'red', shape: 'ring', text: 'error' });
          this.send(msg);
        });
    });

    // tidy up
    this.on('close', function () {

    });
  }

  // Function for parsing arguments and fetching ordered climate sensor data
  function climateGet (msg, overview) {
    if (typeof msg.payload.index === 'number') {
      return overview.climateValues[msg.payload.index];
    }
  }

  // Function for parsing arguments and fetching ordered lock data
  function lockGet (msg, overview) {

  }

  // Function for parsing arguments and fetching ordered lock data
  function doorWindowGet(msg, overview){

  }

  RED.nodes.registerType('VerisureSensorNode', VerisureSensorNode);
};

/*
Consider todo:
  - move Verisure connection to config node, share connection between nodes
  - add support for mapping out more devices from overview
*/
