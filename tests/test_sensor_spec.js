
var should = require('should');
var helper = require('node-red-node-test-helper');
var sureNode = require('../verisurenode/node-red-contrib-verisure-sensor.js');

helper.init(require.resolve('node-red'));

describe('VerisureSensorNode', function () {
  beforeEach(function (done) {
    helper.startServer(done);
  });

  afterEach(function (done) {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: 'n1', type: 'VerisureSensorNode', name: 'VerisureSensorNode' }];
    helper.load(sureNode, flow, function () {
      var n1 = helper.getNode('n1');
      n1.should.have.property('name', 'VerisureSensorNode');
      done();
    });

  });
});
