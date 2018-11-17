/* eslint-env mocha */
var should = require('should');
var helper = require('node-red-node-test-helper');
var sureNode = require('../verisurenode/node-red-contrib-verisure-conf.js');
const verEmail = 'test@fest.no';
const verPassword = '12345';
 
helper.init(require.resolve('node-red'));

describe('Verisure Config Node', function () {
  before(function (done) {
    helper.startServer(done);
  });

  afterEach(function () {
    helper.unload();
  });

  after(function (done) {
    helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: 'n1', type: 'VerisureConfig', displayName: 'Verisure Site' }];
    helper.load(sureNode, flow, function () {
      var n1 = helper.getNode('n1');
      n1.should.have.property('displayName', 'Verisure Site');
      done();
    });
  });

  it('should have credentials', function (done) {
    var flow = [{ id: 'n1', type: 'VerisureConfig', displayName: 'Verisure Site' }];
    var credentials = { n1: { 'username': verEmail, 'password': verPassword } };
    helper.load(sureNode, flow, credentials, function () {
      var n1 = helper.getNode('n1');
      n1.credentials.should.have.property('username', verEmail);
      n1.credentials.should.have.property('password', verPassword);
      done();
    });
  });
});
