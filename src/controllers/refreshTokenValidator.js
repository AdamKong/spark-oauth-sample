module.exports = function (sessionID, id, refreshToken, email, anchorID, writeLog, callback) {
	// remove leading and tailing spaces if have.
	var clearSpaces = function (string) {
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		string = string.replace(pattern1, '').replace(pattern2, '');
		return string;
	};

	id = clearSpaces(id);
	refreshToken = clearSpaces(refreshToken);
	email = clearSpaces(email);

	// Check if Token ID is 24 characters or not.
	if (/^[a-zA-Z0-9]{24}$/.test(id)) {
		// Check if refreshToken is 64 characters.
		if (/^[a-zA-Z0-9]{64}$/.test(refreshToken)) {
			// Check if email format is good.
			if (/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email)) {
				// Check if anchor format is good.
				if (/^[1-9]{1}[0-9]*$/.test(anchorID)) {
					writeLog(sessionID, 'debug', 'Refresh Token server side input validation is passed.');
					callback(null, {
						id: id,
						refreshToken: refreshToken,
						email: email,
						anchorID: anchorID
					});
				} else {
					writeLog(sessionID, 'fatal',
						'Refresh Token - The anchor format is not correct!');
					callback('Refresh Token - The anchor format is not correct!', null);
				}
			} else {
				writeLog(sessionID, 'fatal',
					'Refresh Token - The email format is not correct!');
				callback('Refresh Token - The email format is not correct!', null);
			}
		} else {
			writeLog(sessionID, 'fatal', 'Refresh Token - The Refresh Token format is not correct!');
			callback('Refresh Token - The Refresh Token format is not correct!', null);
		}
	} else {
		writeLog(sessionID, 'fatal', 'Refresh Token - The Token ID format is not correct!');
		callback('Refresh Token - The Token ID format is not correct!', null);
	}
};