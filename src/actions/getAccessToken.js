var request = require('request');

module.exports = function (config, oAuthCode, state, callback) {

	// Comparing the original state and the state sent back from SPARK API, to see if data is tampered/
	if (state === config.state) {

		var postData = {
			'grant_type': config.grantType,
			'client_id': config.clientID,
			'client_secret': config.cilentSecret,
			'code': oAuthCode,
			'redirect_uri': config.redirectURIUnencoded
		};

		// Do Post to gain the Access Token
		request.post({
			url: 'https://api.ciscospark.com/v1/access_token',
			form: postData
		}, function (err, response, body) {
			if (!err) {
				callback(null, JSON.parse(body));
			} else {
				console.log('Get error when requesting Access Token:' + err);
				callback('Get error when requesting Access Token:' + err, null);
			}
		});

	} else {
		console.log('The state has been tampered. Redirect to home page');
		callback('The state has been tampered. Redirect to home page', null);
	}
};