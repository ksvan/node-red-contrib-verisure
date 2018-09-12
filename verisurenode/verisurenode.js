module.exports = function(RED) {

const Verisure = require('verisure');
  var http = require('http');
  var url = require('url');

    function VerisureNode(config) {
        RED.nodes.createNode(this,function);
        


//initial config of the node  ///  
// Retrieve the config node
    this.credentials = RED.nodes.getNode(config.VerisureConfig);

// Verisure setup
  const verisure = new Verisure(this.credentials.username, this.credentials.password);
  var last_status = "test1";
  var current_status = "test";   


//what to do with payload incoming ///
        node.on('input', function(msg) {
            this.status({fill:"green",shape:"ring",text:"fetching"});
        	//add input validate

        	//take action, check status

  verisure.getToken()
    .then(() => verisure.getInstallations())
    .then(installations => installations[0].getOverview())
    .then((overview) => {
      current_status = overview.armState.statusType;
      if (current_status !== last_status)
      {
        // Update Webtask Storage with new status
        context.storage.set({'last_status': current_status}, function (error) {
            if (error) return cb(error);
        });
        cb(null, {'current_status': current_status, 'changed': true});
      }
      else
      {
        // Nothing has changed, just return the state as JSON
        cb(null, {'current_status': current_status, 'changed': false});
      }
    })
    .catch((error) => {
      cb(null,{'Error': error});
    });


        	//return current status, reuse existing object, replace only payload
        	msg.payload = current_status;
        	this.status({fill:"red",shape:"ring",text:"waiting"});
            this.send(msg);
        });


    }
//tidy up 
this.on('close', function() {
    verisure.
});

    RED.nodes.registerType("VerisureNode",VerisureNode);
}