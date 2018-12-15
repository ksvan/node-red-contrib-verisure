module.exports = function (RED) {
  'use strict';

  function VerisureSensorNode (config) {
    RED.nodes.createNode(this, config);

    // initial config of the node  ///
    var node = this;
    const Verisure = require('verisure');
    // Retrieve the config node
    try {
      this.verUser = RED.nodes.getNode(config.user);
    }
    catch (err) {
      this.error('Error, no login/config node exists - verisure sensor.js l-132 ' + err);
      this.debug('Couldnt get config node : ' + this.verUser);
    }

    if (typeof node.verUser === 'undefined' || !node.verUser || !node.verUser.credentials.username || !node.verUser.credentials.password) {
      this.warn('No credentials given! Missing config node details. Verisure sensor.js l-18 :' + node.verUser);
      return;
    }

    // what to do with payload incoming ///
    this.on('input', function (msg) {
      this.status({ fill: 'orange', shape: 'ring', text: 'fetching' });
      let verisure = new Verisure(this.verUser.credentials.username, this.verUser.credentials.password);
      let currentReadings;
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
            default:
              currentReadings = { 'Error': true, 'message': 'No such type: ' + msg.payload.type };
              break;
          }

          // Close up and return
          this.status({ fill: 'green', shape: 'ring', text: 'waiting' });
          this.debug('Status fetched : ' + currentReadings);
          msg.payload = cleanUpData(currentReadings);
          this.send(msg);
        })

        .catch((error) => {
          currentReadings = { 'Error': true, 'message': error };
          this.error(currentReadings);
          this.debug('Error when fetching Verisure sensor metrics, verisure On msg async use of Verisure package: ' + currentReadings);
          this.status({ fill: 'red', shape: 'ring', text: 'error' });
          msg.payload = currentReadings;
          this.send(msg);
        });
    });

    // tidy up
    this.on('close', function () {

    });
  }
  // todo, work out better abstractions for Get functions. Overcome datamodel issues

  // function to clean up where i find inconsistency in Verisure Datamodell, not to expose this in node-red and making logic there more complicated
  function cleanUpData (readings) {
    if (typeof readings.deviceArea === 'string' && readings.deviceArea !== '') {
      readings.area = readings.deviceArea; // deviceArea used only for climate control scope, else just area
    }
    return readings;
  }

  // TODO: new split and abstractions below. generalize function to pick type of criteria
  // Function for parsing arguments and fetching ordered climate sensor data
  function climateGet (msg, overview) {
    if (typeof msg.payload.index === 'number' && msg.payload.index >= 0) {
      let index = msg.payload.index;
      return overview.climateValues[index] || { 'Error': true, 'message': 'No such device with index: ' + index };
    }
    else if (typeof msg.payload.area === 'string' && msg.payload.area !== '') {
      let area = msg.payload.area;
      return findByArea(overview.climateValues, area) || { 'Error': true, 'message': 'No such device with name: ' + area };
    }
    else if (typeof msg.payload.label === 'string' && msg.payload.label !== '') {
      let label = msg.payload.label;
      return findByLabel(overview.climateValues, label) || { 'Error': true, 'message': 'No such device with label: ' + label };
    }
    else {
      return { 'Error': true, 'message': 'No valid id provided (label, index, area)' };
    }
  }

  // Function for parsing arguments and fetching ordered lock data
  function lockGet (msg, overview) {
    if (typeof msg.payload.index === 'number' && msg.payload.index >= 0) {
      let index = msg.payload.index;
      return overview.doorLockStatusList[index] || { 'Error': true, 'message': 'No such lock device with index: ' + index };
    }
    else if (typeof msg.payload.area === 'string' && msg.payload.area !== '') {
      let area = msg.payload.area;
      return findByArea(overview.doorLockStatusList, area) || { 'Error': true, 'message': 'No such lock device with name: ' + area };
    }
    else if (typeof msg.payload.label === 'string' && msg.payload.label !== '') {
      let label = msg.payload.label;
      return findByLabel(overview.doorLockStatusList, label) || { 'Error': true, 'message': 'No such device with label: ' + label };
    }
    else {
      return { 'Error': true, 'message': 'No valid id provided (label, index, area)' };
    }
  }

  // Function for parsing arguments and fetching ordered lock data
  function doorWindowGet (msg, overview) {
    if (typeof msg.payload.index === 'number' && msg.payload.index >= 0) {
      let index = msg.payload.index;
      return overview.doorWindow.doorWindowDevice[index] || { 'Error': true, 'message': 'No such doorWindows device with index: ' + index };
    }
    else if (typeof msg.payload.area === 'string' && msg.payload.area !== '') {
      let area = msg.payload.area;
      return findByArea(overview.doorWindow.doorWindowDevice, area) || { 'Error': true, 'message': 'No such doorWindows device with name: ' + area };
    }
    else if (typeof msg.payload.label === 'string' && msg.payload.label !== '') {
      let label = msg.payload.label;
      return findByLabel(overview.doorWindow.doorWindowDevice, label) || { 'Error': true, 'message': 'No such device with label: ' + label };
    }
    else {
      return { 'Error': true, 'message': 'No valid id provided (label, index, area)' };
    }
  }

  // loop through and return based on area, mitigate for inconsistence in verisure datamodel
  function findByArea (collection, string) {
    let area = '';
    for (let item in collection) {
      area = collection[item].deviceArea || collection[item].area; // inconsistency in data model naming, mitigation failover
      if (area === string) { return collection[item]; }
    }
  }
  // loop through and return based on area, mitigate for inconsistence in verisure datamodel
  function findByLabel (collection, string) {
    for (let item in collection) {
      if (collection[item].deviceLabel === string) { return collection[item]; }
    }
  }

  RED.nodes.registerType('VerisureSensorNode', VerisureSensorNode);
};

/*
Consider todo:
  - move Verisure connection to config node, share connection between nodes
*/
