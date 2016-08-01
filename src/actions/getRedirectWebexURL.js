var request = require('request');

module.exports = function (oauth, sessionID, writeLog, callback) {
	writeLog(sessionID, 'debug', 'Start requesting a webex link now.');
	// I can not find any original HTTP/HTTPS functions to follow redirect in HTTP/HTTPS packages.
	// Since the "request" supports HTTPS and follows redirects by default, it would be my need.
	// In this case, Spark needs to redirect the user to a user interface to let user fill email
	// address, and if the parameters are not in the URL, they will not be appended into the
	// redirected URL as well, (although they may be sent out in an Object in request body). So here
	// we have to compose the long url with the parameters manually.
	var url = 'https://api.ciscospark.com/v1/authorize?response_type=code&client_id=' +
		oauth.clientID + '&redirect_uri=' + oauth.redirectURI + '&scope=' +
		oauth.scope + '&state=' + oauth.state;
	var req = request.get(url, function (err) {

		if (!err) {
			writeLog(sessionID, 'debug', 'Got Webex redirect URL: ' + req.uri.href);
			callback(null, req.uri.href);
		} else {
			writeLog(sessionID, 'fatal', 'Failed to get Webex login URL: ' + err);
			callback('Failed to get Webex login URL: ' + err, '/');
		}
	});
};