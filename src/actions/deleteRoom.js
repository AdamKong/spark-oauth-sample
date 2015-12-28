var https = require('https');

module.exports =
	function (roomId, accessToken, callback) {
		var deleteOptions = {
			host: 'api.ciscospark.com',
			path: '/v1/rooms/' + roomId,
			method: 'delete',
			headers: {
				'Content-type': 'application/json',
				'Authorization': 'Bearer ' + accessToken
			}
		};

		// Deleting the room based on the roomID.
		var deleteRequest = https.request(deleteOptions, function (res) {
			if (res.statusCode === 204) {
				console.log('Room has been deleted: ' + roomId);
				callback(null);
			} else {
				console.log('res.statusCode: ' + res.statusCode);
				callback('Problem with deleting room. res.statusCode = ' + res.statusCode);
			}
		});

		deleteRequest.on('error', function (err) {
			console.log('Problem with deleting room: ' + err.message);
			callback('Problem with deleting room: ' + err);
		});

		deleteRequest.end();
	};