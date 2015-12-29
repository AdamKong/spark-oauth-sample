var https = require('https');

module.exports = function (accessToken, newRoomID, userEmail, callback) {

	var postMemberData = JSON.stringify({
		'roomId': newRoomID,
		'personEmail': userEmail
	});

	var membershipOptions = {
		host: 'api.ciscospark.com',
		path: '/v1/memberships',
		method: 'post',
		headers: {
			'Content-type': 'application/json',
			'Authorization': 'Bearer ' + accessToken,
			'Content-Length': postMemberData.length
		}
	};

	// Sending POST to SPARK API to add member, and get back the membershipID.
	var memberRequest = https.request(membershipOptions, function (response) {
		var data = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			callback(null, JSON.parse(data).id);
		});
	});

	memberRequest.on('error', function (err) {
		console.log('problem of adding member request: ' + err.message);
		callback('problem of adding member request: ' + err, null);
	});

	// write data to member request body
	memberRequest.write(postMemberData);
	memberRequest.end();
};