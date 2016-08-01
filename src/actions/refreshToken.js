var request = require('request');

module.exports = function (oauth, sessionID, refresh_token, writeLog, callback) {

	writeLog(sessionID, 'debug', 'Start refreshing token now.');

	var postData = {
		'grant_type': oauth.refreshToken_type,
		'client_id': oauth.clientID,
		'client_secret': oauth.clientSecret,
		'refresh_token': refresh_token
	};

	// Do Post to gain the refresh Token
	request.post({
		url: 'https://api.ciscospark.com/v1/access_token',
		form: postData
	}, function (err, response, body) {
		if (!err) {
			writeLog(sessionID, 'debug', 'Refresh Token: Got response from Spark API: ' + body);
			callback(null, JSON.parse(body));
		} else {
			writeLog(sessionID, 'fatal', 'Got problem when refreshing token: ' + err);
			callback('Got problem when refreshing token: ' + err, null);
		}
	});
};