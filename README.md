# Node-red-contrib-Verisure

[![Greenkeeper badge](https://badges.greenkeeper.io/ksvan/node-red-contrib-verisure.svg)](https://greenkeeper.io/)
[![Travis CI badge](https://travis-ci.com/ksvan/node-red-contrib-verisure.svg?branch=master)](https://www.travis-ci.com)


This module provides three nodes, one config and two function nodes, to fetch the status of a Verisure alarm and sensors.
The module and it's dependencies is strictly unofficial, not supported in any way by Verisure AS (and use is probably not encouraged by them)

## Install
NB! Breaking changes in version 0.4, separation of alarm node and newly added sensor node. Only applicable if moving from < 0.4. No more breaks in 0.4.1

To install (node-red)
To install the stable version use the `Menu - Manage palette` option and search for `node-red-contrib-verisure`, or run the following command in your Node-RED user directory (typically `~/.node-red`):

	$ npm i node-red-contrib-verisure
	
Or, to install, download the files to a local folder, same structure. In this packages directory, run npm install or link. Switch to your .node-red directory and use npm link node-red-contrib-verisure (or npm install). Link is good if you want change the code and test.
[NPMJS link](https://www.npmjs.com/package/node-red-contrib-verisure)

## Dependencies

Depends on verisure package

	$ npm install verisure --save

[NPMJS Link](https://www.npmjs.com/package/verisure)

## Nodes

### Verisure config

This is just a credential node, to separate out storage of your credentials and simplify usage of multiple Verisure nodes/actions in the future

### Verisure Alarm node

This node connects to the first verisure site returned with your username and password. Then fetch the armed or unarmed status. The fetch happens whenever input is recieved. The node changes the payload, but nothing else in the message object. Payload returned is a simple json structure:
	
	{ 'current_status': "ARMED_AWAY", 'changed': false, 'date': "2016-01-01T00:00:00.000Z", 'name': "John D. Oe" }
	{ 'current_status': "ARMED_HOME", 'changed': false, 'date': "2016-01-01T00:00:00.000Z", 'name': "John D. Oe"  }
	{ 'current_status': "DISARMED", 'changed': false, 'date': "2016-01-01T00:00:00.000Z", 'name': "John D. Oe"  }

Verisure node is currently expecting alarm to be in DISARMED state when starting. If not, the first Changed status will be wrong.

### Verisure Sensor Node

This node connects to the first verisure site returned with your username and password. It can then be used to fetch values from named sensor in the site.
The node accepts input in json format. Only one identificator needs to be given/will be used. index, area or label, will be tried in that order.

	{'type': "climate", 'label': "2RTL M7"} // returns sensor data from this device
	{'type': "climate", 'index': 4} // returns sensor data from this device, number 4 in array list
	{'type': "climate", 'area': "Master Bedroom"} // returns sensor data from this device area
	{'type': "lock", 'label': "2YGL M8"} // returns lock data from this device
	{'type': "lock", 'index': 5} // returns lock data from this device
	{'type': "doorwindow", 'index': 5} // returns door or window state data from this device
	{'type': "site"} // returns full site overview as object. Hook up a debug to see all elements in object

You will find all indexes and labels if you output a fill site object and look through it. Note that access by index will be faster. The node always reaches out to get new data from Verisure.


#### Return objects
Climate: 
	
	{"deviceLabel":"2ZEL TMP","area":"Gang","deviceType":"SMOKE2","temperature":21.9,"humidity":40,"time":"2018-10-19T17:51:54.000Z"}

Climate may contain the deviceArea element as well, this is due to inconsistency in Verisure datamodel. This node normalizes this by adding the area element. Values will be the same. 

Doorlock: 

	{"deviceLabel":"2ZF7 SFG","area":"Hoveddør","userString":"Tor","method":"CODE","lockedState":"UNLOCKED","currentLockState":"UNLOCKED","pendingLockState":"NONE","eventTime":"2018-10-19T17:33:23.000Z","secureModeActive":false,"motorJam":false,"paired":true}

DoorWindow: 

	{"deviceLabel":"2JRY 4WTH","area":"Inngang","state":"CLOSE","wired":false,"reportTime":"2018-10-19T17:34:00.000Z"}

Error: 
	
	{ 'Error': true, 'message': 'No such device' }

# Security
Verisure system is quite secure as such, but care should be taken on your side as well when integrating. Node-red should be set up with your custom encryption key, that will be used for securing credentials. This is done by setting the credentialSecret key in the node-red settings files. 
You should also consider setting up a specific user account on your verisure site, used only for integration, with as few rights as possible.

# Troubleshooting
Not many common issues known at this point. 
- If you pull to often from Verisure, they will throttle your requests.
- They answer quite slowly some times, might be throttling on their side as well
- Remember it's the total requests/consume they count, each node will make a call. Watch how your total use of Verisure nodes are spread out in time
- If you need a lot of information often, consider using the full site object. Store it in flow or global context to further reduce calls
- It seems like use of the same account for this node and the verisure App might log you out of the app.
- Breaking change in version 0.4, node-red will complain about missing VerisureNode. You need to replace this in your flows with the new VerisureAlarmnode
- And by the way, do not expect that your installation company managed to keep naming standards consistent. Area for your main door lock and your main door open/closed sensor might be different...
- When working with the site object, note that naming standards in the objects properties are inconsistent, from the Verisure package, probably inherited from the Verisure apis/datamodel. For instance is area and devicearea properties used alternating.
- Not all errors are handled in the Verisure nodejs module being used here, so this might lead to unhandled exceptions in communication or return object issues from Verisure

# Legal Disclaimer

This software is not affiliated with Verisure Holding AB and the developers take no legal responsibility for the functionality or security of your alarms and devices. Neither does any of the contributers to this package. Treat your Verisure credentials with the uthermost care.
