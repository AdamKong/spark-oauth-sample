var https = require('https');

module.exports = function (token, newRoomID, sessionID, writeLog, callback) {

	writeLog(sessionID, 'debug', 'Start sending the token into the new roow now.');
	var postMessageData = JSON.stringify({
		'roomId': newRoomID,
		'text': JSON.stringify(token)
	});

	var messageOptions = {
		host: 'api.ciscospark.com',
		path: '/v1/messages',
		method: 'post',
		headers: {
			'Content-type': 'application/json',
			'Authorization': 'Bearer ' + token.access_token,
			'Content-Length': postMessageData.length
		}
	};

	// Sending POST to SPARK API to send message, and get the messageID back.
	var messageRequest = https.request(messageOptions, function (response) {
		var data = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			if (JSON.parse(data).id) {
				var messageID = JSON.parse(data).id;
				writeLog(sessionID, 'debug', 'Token, as a message, has been sent into the room. message ID:' + messageID);
				callback(null, messageID);
			}else {
				writeLog(sessionID, 'fatal', 'Got JSON from Spark API, but failed to send token into the new room, because:' + data + '. Please copy/paste the token info and send to the requester directly in Spark.');
				callback('Got JSON from Spark API, but failed to send token into the new room, because:' + data + '. Please copy/paste the token info and send to the requester directly in Spark.', null);
			}
		});
	});

	messageRequest.on('error', function (err) {
		writeLog(sessionID, 'fatal', 'Failed to get response from Spark API when sending token into the room: ' + err.message + '. Please copy/paste the token info and send to the requester directlyin Spark.');
		callback('Failed to get response from Spark API when sending token into the room: ' + err.message + '. Please copy/paste the token info and send to the requester directlyin Spark.', null);
	});

	// write data to member request body
	messageRequest.write(postMessageData);
	messageRequest.end();
};