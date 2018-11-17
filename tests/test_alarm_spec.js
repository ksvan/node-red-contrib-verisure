/* eslint-env mocha */
var should = require('should');
var helper = require('node-red-node-test-helper');
var nock = require('nock');
var sureNode = require('../verisurenode/node-red-contrib-verisure-node.js');
var confNode = require('../verisurenode/node-red-contrib-verisure-conf.js');

// initialize and configure
const netScope = /https:\/\/e-api0\d.verisure.com/; // 'https://e-api01.verisure.com/';
const verEmail = 'test@fest.no';
const verPassword = '12345';
nock.disableNetConnect();
helper.init(require.resolve('node-red'));

describe('Alarm Status node', function () {
  before(function (done) {
    helper.startServer(done);
  });

  beforeEach(function () {
    // setup intercepts
    // intercept search for users sites, return a list
    nock(netScope)
      .get('/xbn/2/installation/search?email=' + verEmail)
      .replyWithFile(200, `${__dirname}/sites_reply.json`);
    // intercept auth token, reply with fake token
    nock(netScope)
      .get('/xbn/2/cookie')
      .replyWithFile(200, `${__dirname}/token_reply.xml`);
    // intercept listing of specified site, full site object all sensors etc
    nock(netScope)
      .get('/xbn/2/installation/123456789/overview')
      .replyWithFile(200, `${__dirname}/test_site.json`);
  });

  after(function (done) {
    helper.stopServer(done);
    nock.cleanAll();
  });

  afterEach(function () {
    helper.unload();
  });

  let flow = [
    { 'id': 'n1', 'type': 'VerisureAlarmNode', 'z': 'f1', 'name': 'Verisure Alarm', 'user': 'nc', 'x': 240, 'y': 240, 'wires': [['nh']] },
    { 'id': 'nc', 'type': 'VerisureConfig', 'z': 'f1', 'displayName': 'Verisure Site', 'siteName': 'Home' },
    { id: 'nh', type: 'helper', 'z': 'f1' },
    { id: 'f1', type: 'tab', label: 'Test flow' }
  ];
  let credentials = { nc: { 'username': verEmail, 'password': verPassword } };

  it('should have credentials', function (done) {
    helper.load([sureNode, confNode], flow, credentials, function () {
      let n1 = helper.getNode('n1');
      let nc = helper.getNode('nc');
      n1.should.have.property('verUser');
      nc.should.have.property('credentials');
      nc.credentials.should.have.property('username', verEmail);
      nc.credentials.should.have.property('password', verPassword);
      done();
    });
  });

  it('should output alarmstatus', function (done) {
    helper.load([sureNode, confNode], flow, credentials, function () {
      let nh = helper.getNode('nh');
      let n1 = helper.getNode('n1');
      nh.on('input', function (msg) {
        msg.payload.should.have.properties({
          'currentStatus': 'DISARMED',
          'changed': false,
          'date': '2018-11-08T06:54:28.000Z',
          'name': 'Kristian' });
        done();
      });
      n1.on('call:warn', call => {
        console.log('WARN' + call);
      });
      n1.on('call:error', call => {
        console.log('ERROR:' + call);
      });
      // get flow and test going
      n1.receive({ payload: 'test' });
    });
  }); // IT end

  it('should fail and report error', function (done) {
    helper.load([sureNode, confNode], flow, credentials, function () {
      let n1 = helper.getNode('n1');
      let nh = helper.getNode('nh');
      nock.cleanAll();
      // all failed network requests setup
      nock(netScope)
        .get('/xbn/2/installation/123456789/overview')
        .reply(400, ``);
      // intercept auth token, reply with fake token
      nock(netScope)
        .get('/xbn/2/cookie')
        .reply(200, ``);
      nock(netScope)
        .get('/xbn/2/installation/search?email=' + verEmail)
        .reply(200, ``);
      nh.on('input', function (msg) {
        msg.payload.should.have.property('Error', true);
        done();
      });
      // get flow and test going
      n1.receive({ payload: 'test' });
    });
  });
});
