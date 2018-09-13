# Node-red-contrib-Verisure

This module provides two nodes, one config and one function node, to fetch the status of a Verisure site.
The module and it's dependencies is strictly unofficial, not supported in any way by Verisure AS (and use is probably not encouraged by them)

## Install (to come)

(not yet published) To install 
To install the stable version use the `Menu - Manage palette` option and search for `node-red-contrib-verisure`, or run the following command in your Node-RED user directory (typically `~/.node-red`):

	$ npm i node-red-contrib-verisure
Or, to install, download the files to a local folder, same structure. Switch to your .node-red directory and use npm link or npm install

## Dependencies

Depends on verisure package
	$ npm install verisure --save

## Nodes

### Verisure config

This is just a credential node, to separate out storage of your credentials and simplify usage of multiple Verisure nodes/actions in the future

### Verisure node

This node connects to the first verisure site returned with your username and password. Then fetch the armed or unarmed status. The fetch happens whenever input is recieved. The node changes the payload, but nothing else in the message object. Payload returned is a simple json structure:
	
	{'current_status': "armed", 'changed': false}

# Legal Disclaimer

This software is not affiliated with Verisure Holding AB and the developers take no legal responsibility for the functionality or security of your alarms and devices. Neither does any of the contributers to this package. Treat your Verisure credentials with the uthermost care.
