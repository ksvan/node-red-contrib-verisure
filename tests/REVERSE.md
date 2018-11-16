# Verisure reverse engineering
Documentation of verisure reverse engineering. Based on the nodejs verisure package.

## API gateways

	https://e-api01.verisure.com/
	https://e-api02.verisure.com/

## Endpoints
With these endpoints used in the following manner

### Logon
	'/xbn/2/cookie'
This endpoint is or logon, getting the token. Expect a reply on this format

	response>
		<string>ExampleToken</string>
	</response>

Authentication is done by basic method, in the header of your request. 

### Getting sites
	'/xbn/2/installation/search?email=' + verisureEmail
This is for finding sites for the mentioned user, email

Expect a format of

	{
    "giid": "123456789",
    "firmwareVersion": 0,
    "routingGroup": "SE",
    "shard": 10,
    "locale": "sv_SE",
    "signalFilterId": 1,
    "deleted": false,
    "cid": "00123456",
    "street": "Sveavägen 1",
    "streetNo1": "",
    "streetNo2": "",
    "alias": "Sveavägen"
  }

### Getting a site
	/xbn/2/installation/{giid}/overview
And this endpoint is for getting a full site object. The site object contains the full data output for the whole site. Sensor data, door and lock status, alarm state etc. Please mind that the information modelling from verisure is not entirely consequent. Especially deviceArea and Area elements are mixed, meaning the same. Giid is the ID from the site list shown above

