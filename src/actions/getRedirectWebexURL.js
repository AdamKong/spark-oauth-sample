var request = require('request');

module.exports = function (config, callback) {
	// I can not find any original HTTP/HTTPS functions to follow redirect in HTTP/HTTPS packages.
	// Since the "request" supports HTTPS and follows redirects by default, it would be my need.
	// In this case, Spark needs to redirect the user to a user interface to let user fill email
	// address, and if the parameters are not in the URL, they will not be appended into the
	// redirected URL as well, (although they may be sent out in an Object in request body). So here
	// we have to compose the long url with the parameters manually.
	var url = 'https://api.ciscospark.com/v1/authorize?response_type=code&client_id=' +
		config.clientID + '&redirect_uri=' + config.redirectURI + '&scope=' +
		config.scope + '&state=' + config.state;
	var req = request.get(url, function (err) {
		if (!err) {
			callback(null, req.uri.href);
		} else {
			callback(err, '/');
		}
	});
};