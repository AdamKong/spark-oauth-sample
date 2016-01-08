var https = require('https');

module.exports =
	function (roomId, accessToken, sessionID, writeLog, callback) {
		
		writeLog(sessionID, 'debug', 'Start deleting the roow now.');
	
		var deleteOptions = {
			host: 'api.ciscospark.com',
			path: '/v1/rooms/' + roomId,
			method: 'delete',
			headers: {
				'Content-type': 'application/json',
				'Authorization': 'Bearer ' + accessToken
			}
		};

		// Deleting the room according to the roomID.
		var deleteRequest = https.request(deleteOptions, function (res) {
			if (res.statusCode === 204) {
				writeLog(sessionID, 'debug', 'Room has been deleted: ' + roomId + '. Session is going to be destroyed.');
				callback(null);
			} else {
				writeLog(sessionID, 'error', 'Problem of deleting room. res.statusCode = ' + res.statusCode + '. Session is going to be destroyed.');
				callback('Problem of deleting room. res.statusCode = ' + res.statusCode + '. Session is going to be destroyed.');
			}
		});

		deleteRequest.on('error', function (err) {
			writeLog(sessionID, 'error', 'Problem of deleting room:' + err.message + '. Session is going to be destroyed.');
			callback('Problem of deleting room. res.statusCode = ' + err.message + '. Session is going to be destroyed.');
		});

		deleteRequest.write('');
		deleteRequest.end();
	};