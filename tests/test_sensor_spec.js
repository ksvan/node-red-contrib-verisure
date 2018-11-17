/* eslint-env mocha */
var should = require('should');
var nock = require('nock');
var helper = require('node-red-node-test-helper');
var sensNode = require('../verisurenode/node-red-contrib-verisure-sensor.js');
var confNode = require('../verisurenode/node-red-contrib-verisure-conf.js');

// initialize and configure
const netScope = /https:\/\/e-api0\d.verisure.com/; // 'https://e-api01.verisure.com/';
const verEmail = 'test@fest.no';
const verPassword = '12345';
nock.disableNetConnect();
helper.init(require.resolve('node-red'));

describe('Verisure Sensor Node', function () {
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
    nock.cleanAll();
    helper.stopServer(done);
  });

  afterEach(function () {
    helper.unload();
  });

  let flow = [
    { 'id': 'n1', 'type': 'VerisureSensorNode', 'z': 'f1', 'name': 'Verisure Sensor', 'user': 'nc', 'wires': [['nh']] },
    { 'id': 'nc', 'type': 'VerisureConfig', 'z': 'f1', 'displayName': 'Verisure Site', 'siteName': 'Home' },
    { id: 'nh', type: 'helper', 'z': 'f1' },
    { id: 'f1', type: 'tab', label: 'Test flow' }
  ];
  let credentials = { nc: { 'username': verEmail, 'password': verPassword } };

  // verify node actually is loadable in simplest conditions
  it('should be loaded', function (done) {
    let simpleflow = [{ id: 'n1', type: 'VerisureSensorNode', name: 'VerisureSensorNode' }];
    helper.load(sensNode, simpleflow, function () {
      let n1 = helper.getNode('n1');
      n1.should.have.property('name', 'VerisureSensorNode');
      done();
    });
  });

  // verify node fail with wrong type and good error
  it('should fail - no such type', function (done) {
    helper.load([sensNode, confNode], flow, credentials, function () {
      let nh = helper.getNode('nh');
      let n1 = helper.getNode('n1');
      nh.on('input', function (msg) {
        msg.payload.should.have.properties({
          'Error': true,
          'message': 'No such type: undefined'
        });
        done();
      });
      // get flow and test going
      n1.receive({ payload: 'test' });
    });
  }); // It fails ends

  // verify node can fetch climate data
  it('should fetch climate data', function (done) {
    helper.load([sensNode, confNode], flow, credentials, function () {
      let nh = helper.getNode('nh');
      let n1 = helper.getNode('n1');
      nh.on('input', function (msg) {
        msg.payload.should.have.properties({
          deviceLabel: '2AEL MTXF',
          deviceArea: 'Stue',
          deviceType: 'SMOKE2',
          temperature: 21.9,
          humidity: 37,
          time: '2018-11-08T11:54:05.000Z',
          area: 'Stue'
        });
        done();
      });
      // get flow and test going
      n1.receive({ payload: { type: 'climate', area: 'Stue', label: '' } });
    });
  }); // It fetches climate data end

  // verify node can fetch doorwindow data
  it('should fetch doorwindow data', function (done) {
    helper.load([sensNode, confNode], flow, credentials, function () {
      let nh = helper.getNode('nh');
      let n1 = helper.getNode('n1');
      nh.on('input', function (msg) {
        msg.payload.should.have.properties({
          deviceLabel: '2JYJ KYHE',
          area: 'Dør',
          state: 'CLOSE',
          wired: false,
          reportTime: '2018-11-08T10:25:42.000Z'
        });
        done();
      });
      // get flow and test going
      n1.receive({ payload: { type: 'doorWindow', index: 1 } });
    });
  }); // It fetches doorwindow data end

  // verify node can fetch climate data
  it('should fetch lock data', function (done) {
    helper.load([sensNode, confNode], flow, credentials, function () {
      let nh = helper.getNode('nh');
      let n1 = helper.getNode('n1');
      nh.on('input', function (msg) {
        msg.payload.should.have.properties({
          deviceLabel: '2AF7 P2T2',
          area: 'Hdør',
          method: 'THUMB',
          lockedState: 'UNLOCKED',
          currentLockState: 'UNLOCKED',
          pendingLockState: 'NONE',
          eventTime: '2018-11-08T08:01:29.000Z',
          secureModeActive: false,
          motorJam: false,
          paired: true
        });
        done();
      });
      // get flow and test going
      n1.receive({ payload: { type: 'lock', index: 0 } });
    });
  }); // It fetches lock data end

  // verify node can fetch full site object
  it('should fetch full site', function (done) {
    helper.load([sensNode, confNode], flow, credentials, function () {
      let nh = helper.getNode('nh');
      let n1 = helper.getNode('n1');
      nh.on('input', function (msg) {
        msg.payload.should.have.property('armState');
        msg.payload.should.have.property('controlPlugs');
        msg.payload.should.have.property('smartPlugs');
        msg.payload.should.have.property('batteryProcess');
        msg.payload.should.have.property('doorWindow');
        msg.payload.should.have.property('smartCameras');
        msg.payload.should.have.property('climateValues');
        msg.payload.should.have.property('heatPumps');
        msg.payload.should.have.property('pendingChanges');
        done();
      });
      // get flow and test going
      n1.receive({ payload: { type: 'site' } });
    });
  }); // It fetches full site data end
});
