var https = require('https');

module.exports = function (token, roomName, requesterEmail, sessionID, writeLog, callback) {

	writeLog(sessionID, 'debug', 'Start creating a new roow now.');
	var postRoomData = JSON.stringify({
		'title': roomName
	});

	var roomOptions = {
		host: 'api.ciscosparkxx.com',
		path: '/v1/rooms',
		method: 'post',
		headers: {
			'Content-type': 'application/json',
			'Authorization': 'Bearer ' + token.access_token
		}
	};

	// Sending POST to SPARK API to create room, and get the room ID back.
	var roomRequest = https.request(roomOptions, function (response) {
		var data = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			if (JSON.parse(data).id) {
				var newRoomID = JSON.parse(data).id;
				require('../actions/getUserEmail.js')(token.access_token,
					sessionID,
					writeLog,
					function (error, email) {
						if (!error) {
							if (email === requesterEmail) {
								writeLog(sessionID, 'fatal', 'User email can not be the same as the requester email.');
								callback('User email can not be the same as the requester email.', null);
							} else {
								writeLog(sessionID, 'debug', 'New room has been created. Start adding the requester into the new room. Room ID: ' + newRoomID);
								require('./addMember.js')(token,
									newRoomID,
									requesterEmail,
									sessionID,
									writeLog,
									function (err, membershipID, messageID) {
										if (!err) {
											callback(null, {
												newRoomID: newRoomID,
												membershipID: membershipID,
												messageID: messageID
											});
										} else {
											callback(err, null);
										}
									});
							}
						} else {
							writeLog(sessionID, 'fatal', error);
							callback(error, null);
						}
					});
			} else {
				writeLog(sessionID, 'fatal', 'Got proper JSON from Spark API, however it is failed to create room: ' + data + '. Please copy/paste the Token info and send to requester directly in Spark.');
				callback('Got proper JSON from Spark API, however it is failed to create room: ' + data + '. Please copy/paste the Token info and send to requester directly in Spark.', null);
			}
		});
	});

	roomRequest.on('error', function (err) {
		writeLog(sessionID, 'fatal', 'Got error from Spark API. Failed to create room: ' + err.message + '. Please copy/paste the Token info and send to requester directly in Spark');
		callback('Got error from Spark API. Failed to create room: ' + err.message + '. Please copy/paste the Token info and send to requester directly in Spark', null);
	});

	// write data to room request body
	roomRequest.write(postRoomData);
	roomRequest.end();
};