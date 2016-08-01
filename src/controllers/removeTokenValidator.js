module.exports = function (sessionID, id, email, anchorID, writeLog, callback) {
	// remove leading and tailing spaces if have.
	var clearSpaces = function (string) {
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		string = string.replace(pattern1, '').replace(pattern2, '');
		return string;
	};

	id = clearSpaces(id);
	email = clearSpaces(email);
	anchorID = clearSpaces(anchorID);

	// Check if Token ID is 24 characters or not.
	if (/^[a-zA-Z0-9]{24}$/.test(id)) {
		// Check if email format is good.
		if (/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email)) {
			// Check if anchor ID is good.
			if (/^[1-9]{1}[0-9]*$/.test(anchorID)) {
				writeLog(sessionID, 'debug', 'Remove Token server side input validation is passed.');
				callback(null, {
					id: id,
					email: email,
					anchorID: anchorID
				});
			} else {
				writeLog(sessionID, 'fatal',
					'Remove Token - The anchor ID format is not correct!');
				callback('Remove Token - The anchor ID format is not correct!', null);
			}
		} else {
			writeLog(sessionID, 'fatal',
				'Remove Token - The email format is not correct!');
			callback('Remove Token - The email format is not correct!', null);
		}
	} else {
		writeLog(sessionID, 'fatal', 'Remove Token - The Token ID format is not correct!');
		callback('Remove Token - The Token ID format is not correct!', null);
	}
};