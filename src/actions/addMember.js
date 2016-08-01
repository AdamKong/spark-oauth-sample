var https = require('https');

module.exports = function (token, newRoomID, requesterEmail, sessionID, writeLog, callback) {

	writeLog(sessionID, 'debug', 'Start adding the requester into the new roow now.');
	var postMemberData = JSON.stringify({
		'roomId': newRoomID,
		'personEmail': requesterEmail
	});

	var membershipOptions = {
		host: 'api.ciscospark.com',
		path: '/v1/memberships',
		method: 'post',
		headers: {
			'Content-type': 'application/json',
			'Authorization': 'Bearer ' + token.access_token,
			'Content-Length': postMemberData.length
		}
	};

	// Sending POST to SPARK API to add member, and get the membershipID back.
	var memberRequest = https.request(membershipOptions, function (response) {
		var data = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			if (JSON.parse(data).id) {
				var membershipID = JSON.parse(data).id;
				writeLog(sessionID, 'debug', 'Requester has been added in. Start sending token into the room. MembershipID:' + membershipID);
				require('./sendMessage.js')(token,
					newRoomID,
					sessionID,
					writeLog,
					function (err, messageID) {
						if (!err) {
							callback(null, membershipID, messageID);
						} else {
							callback(err, null, null);
						}
					});
			} else {
				writeLog(sessionID, 'debug', 'Got JSON from Spark API, but failed to add the requester into the new room, because:' + data + '. Please copy/paste the token info and send to the requester directlyin Spark.');
				callback('Got JSON from Spark API, but failed to add the requester into the new room, because:' + data + '. Please copy/paste the token info and send to the requester directlyin Spark.', null, null);
			}
		});
	});

	memberRequest.on('error', function (err) {
		writeLog(sessionID, 'fatal', 'Failed to get response from Spark API when adding requester to the room: ' + err.message + '. Please copy/paste the token info and send to the requester directlyin Spark.');
		callback('Failed to get response from Spark API when adding requester to the room: ' + err.message + '. Please copy/paste the token info and send to the requester directlyin Spark.', null, null);
	});

	// write data to member request body
	memberRequest.write(postMemberData);
	memberRequest.end();
};