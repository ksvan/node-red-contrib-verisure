var should = require('should');
var helper = require('node-red-node-test-helper');
var nock = require('nock');
var sureNode = require('../verisurenode/node-red-contrib-verisure-node.js');
var confNode = require('../verisurenode/node-red-contrib-verisure-conf.js');

// defined json as expected output
const netScope = /https:\/\/e-api0\d.verisure.com/; // 'https://e-api01.verisure.com/';
const verEmail = 'test@fest.no';
const verPassword = '12345';
// nock.disableNetConnect();

describe('Alarm Status node', function () {
  before(function (done) {
    helper.startServer(done);
  });

  beforeEach(function () {
    // setup intercepts
    // intercept search for users sites, return a list
    nock(netScope)
      .get('/xbn/2/installation/search?email=' + verEmail)
      .replyWithFile(200, `${__dirname}/sites_reply.json`)
      .log(console.log);
    // intercept auth token, reply with fake token
    nock(netScope)
      .get('/xbn/2/cookie')
      .replyWithFile(200, `${__dirname}/token_reply.xml`)
      .log(console.log);
    // intercept listing of specified site, full site object all sensors etc
    nock(netScope)
      .get('/xbn/2/installation/123456789/overview')
      .replyWithFile(200, `${__dirname}/test_site.json`)
      .log(console.log);
  });

  after(function (done) {
    helper.stopServer(done);
  });

  afterEach(function () {
    helper.unload();
  });

  var flow = [
    { 'id': 'n1', 'type': 'VerisureAlarmNode', 'z': 'f1', 'name': 'Verisure Alarm', 'user': 'nc', 'x': 240, 'y': 240, 'wires': [['nh']] },
    { 'id': 'nc', 'type': 'VerisureConfig', 'z': 'f1', 'displayName': 'Verisure Site', 'siteName': 'Home' },
    { id: 'nh', type: 'helper', 'z': 'f1' },
    { id: 'f1', type: 'tab', label: 'Test flow' }
  ];
  var credentials = { nc: { 'username': verEmail, 'password': verPassword } };

  it('should output alarmstatus', function (done) {
    helper.load([sureNode, confNode], flow, credentials, function () {
      var nh = helper.getNode('nh');
      var n1 = helper.getNode('n1');
      nh.on('input', function (msg) {
        try {
          msg.payload.should.have.properties({
            'currentStatus': 'DISARMED',
            'changed': false,
            'date': '2018-11-08T06:54:28.000Z',
            'name': 'Kristian' });
          done();
        }
        catch (error) {
          // console.log(error);
          console.log('Not expected output object from alarmstatus');
        }
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
});
