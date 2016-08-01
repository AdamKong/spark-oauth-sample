var https = require('https');

module.exports = function (accessToken, sessionID, writeLog, callback) {

	writeLog(sessionID, 'debug', 'Start getting user email now.');
	
	var emailOptions = {
		host: 'api.ciscospark.com',
		path: '/v1/people/me',
		method: 'get',
		headers: {
			'Content-type': 'application/json',
			'Authorization': 'Bearer ' + accessToken
		}
	};

	// Sending GET to SPARK API to get personal info.
	var emailRequest = https.request(emailOptions, function (response) {
		var data = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			var email = JSON.parse(data).emails[0];
			if (email) {
				writeLog(sessionID, 'debug', 'Got requester email: ' + email);
				callback(null, email);
			} else {
				writeLog(sessionID, 'fatal', 'Got JSON from Spark API, however it is failed to get user email: ' + data + '. Please copy/paste the Token info and send to requester directly in Spark.');
				callback('Got JSON from Spark API, however it is failed to get user email: ' + data + '. Please copy/paste the Token info and send to requester directly in Spark.', null);
			}
		});
	});

	emailRequest.on('error', function (err) {
		writeLog(sessionID, 'fatal', 'Failed to get user email: ' + err.message + '. Please copy/paste the Token info and send to requester directly in Spark.');
		callback('Failed to get user email: ' + err.message + '. Please copy/paste the Token info and send to requester directly in Spark.', null);
	});

	// write data to room request body
	emailRequest.write('');
	emailRequest.end();
};