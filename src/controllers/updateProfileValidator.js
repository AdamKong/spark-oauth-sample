module.exports = function (sessionID, username, password, re_password, email, writeLog, callback) {
	// remove leading and tailing spaces if there are.
	var clearSpaces = function (string) {
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		string = string.replace(pattern1, '').replace(pattern2, '');
		return string;
	};

	username = clearSpaces(username);
	password = clearSpaces(password);
	re_password = clearSpaces(re_password);
	email = clearSpaces(email);

	// username validation.
	if (/^[\w]{3,20}$/.test(username)) {
		// simple email validation
		if (/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email)) {
			// password validation
			if ((password.length === 0) && (re_password.length === 0)) {
				writeLog(sessionID, 'debug', 'Update Profile - No password modification!');
				callback(null, {
					username: username,
					email: email
				});
			} else {
				// check if the passwords input twice are equal.
				if (password !== re_password) {
					writeLog(sessionID, 'fatal',
						'Update Profile - The passwords input twice are not equal.');
					callback('Update Profile - The passwords input twice are not equal.', null);
				} else {
					if (password.length < 6) {
						writeLog(sessionID, 'fatal',
							'Update Profile - The passwords length should be greater than 6 characters.');
						callback('Update Profile - The passwords length should be greater than 6 characters.', null);
					} else {
						writeLog(sessionID, 'debug',
							'Update Profile - Password length validation are passed!');
						callback(null, {
							username: username,
							password: password,
							email: email
						});
					}
				}
			}
		} else {
			writeLog(sessionID, 'fatal', 'Update Profile - Email format is incorrect!');
			callback('Update Profile - Email format is incorrect!', null);
		}
	} else {
		writeLog(sessionID, 'fatal', 'Update Profile - username format is incorrect!');
		callback('Update Profile - username format is incorrect!', null);
	}
};