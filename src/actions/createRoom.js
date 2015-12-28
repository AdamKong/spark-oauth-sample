var https = require('https');

module.exports = function (accessToken, roomName, userEmail, callback) {

	var postRoomData = JSON.stringify({
		'title': roomName
	});

	var roomOptions = {
		host: 'api.ciscospark.com',
		path: '/v1/rooms',
		method: 'post',
		headers: {
			'Content-type': 'application/json',
			'Authorization': 'Bearer ' + accessToken,
			'Content-Length': postRoomData.length
		}
	};

	// Sending POST to SPARK API to create room, and get back the room ID.
	var roomRequest = https.request(roomOptions, function (response) {
		var data = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			var newRoomID = JSON.parse(data).id;
			require('./addMember')(accessToken, newRoomID, userEmail, function (err, membershipID) {
				if (!err) {
					callback(null, {
						newRoomID: newRoomID,
						membershipID: membershipID
					});
				} else {
					callback(err, null);
				}
			});
		});
	});

	roomRequest.on('error', function (err) {
		console.log('problem with room request: ' + err.message);
		callback('creating room failed:' + err, null);
	});

	// write data to room request body
	roomRequest.write(postRoomData);
	roomRequest.end();
};