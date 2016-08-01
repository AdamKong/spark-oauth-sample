var request = require('request');

module.exports = function (oauth, sessionID, oAuthCode, writeLog, callback) {

	writeLog(sessionID, 'debug', 'Start getting token now.');

	var postData = {
		'grant_type': oauth.grantType,
		'client_id': oauth.clientID,
		'client_secret': oauth.clientSecret,
		'code': oAuthCode,
		'redirect_uri': oauth.redirectURIUnencoded
	};

	// Do Post to gain the Access Token
	request.post({
		url: 'https://api.ciscospark.com/v1/access_token',
		form: postData
	}, function (err, response, body) {
		if (!err) {
			writeLog(sessionID, 'debug', 'Got response from Spark API: ' + body);
			callback(null, JSON.parse(body));
		} else {
			writeLog(sessionID, 'fatal', 'Got problem when requesting token: ' + err);
			callback('Got problem when requesting token: ' + err, null);
		}
	});
};