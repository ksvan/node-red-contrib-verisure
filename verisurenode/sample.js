module.exports = function(context, cb) {

  const Verisure = require('verisure');
  var http = require('http');
  var url = require('url');

  // Verisure
  const verisure = new Verisure(context.secrets.username, context.secrets.password);
  var last_status = "";
  var current_status = "";

  // IFTTT
  var key = context.secrets.iftttkey;

  function triggerIftttMakerWebhook(event, key, value1, value2, value3) {
    let iftttNotificationUrl = `https://maker.ifttt.com/trigger/${event}/with/key/${key}`;
    let postData = JSON.stringify({ value1, value2, value3 });

    var parsedUrl = url.parse(iftttNotificationUrl);
    var post_options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
        });
    });

    // Trigger a POST to the url with the body.
    post_req.write(postData);
    post_req.end();
  }

  context.storage.get(function (error, data) {
      if (error) return cb(error);
      last_status = data.last_status;
  });

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
        
        // Trigger IFTTT Maker Webhook
        triggerIftttMakerWebhook(current_status, key);
        
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
  
};