var bcrypt = require('bcrypt');

module.exports = function (sessionID, userID, superAdminID, username, password, re_password, email, writeLog, callback) {
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
	userID = clearSpaces(userID);
	superAdminID = clearSpaces(superAdminID);

	// Check if user ID is 24 characters or not.
	if (/^[a-zA-Z0-9]{24}$/.test(userID)) {
		// Check if Super Admin ID is 24 characters or not.
		if (/^[a-zA-Z0-9]{24}$/.test(superAdminID)) {
			// username validation
			if (/^[\w]{3,20}$/.test(username)) {
				// simple email validation
				if (/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email)) {
					// password validation
					if ((password.length === 0) && (re_password.length === 0)) {
						writeLog(sessionID, 'debug',
							'Super Admin Update Profile - No password modification!');
						callback(null, userID, superAdminID, {
							username: username,
							email: email
						});
					} else {
						// check the password input twice are equal or not.
						if (password !== re_password) {
							writeLog(sessionID, 'fatal',
								'Super Admin Update Profile - password you input are not equal!');
							callback('Super Admin Update Profile - password you input are not equal!', null, null, null);
						} else {
							// password length validation
							if (password.length < 6) {
								writeLog(sessionID, 'fatal',
									'Super Admin Update Profile - password length should greater than 6 characters!');
								callback('Super Admin Update Profile - password length should greater than 6 characters!!', null, null, null);
							} else {
								writeLog(sessionID, 'debug',
									'Super Admin Update Profile - password setting is valid !');
								var salt = bcrypt.genSaltSync(10);
								var hash = bcrypt.hashSync(password, salt);
								callback(null, userID, superAdminID, {
									username: username,
									password: hash,
									email: email
								});
							}
						}
					}
				} else {
					writeLog(sessionID, 'fatal',
						'Super Admin Update Profile - email format is incorrect!');
					callback('Super Admin Update Profile - email format is incorrect!', null, null, null);
				}
			} else {
				writeLog(sessionID, 'fatal', 'Super Admin Update Profile - Username format is incorrect!');
				callback('Super Admin Update Profile - Username format is incorrect!', null, null, null);
			}
		} else {
			writeLog(sessionID, 'fatal', 'Super Admin Update Profile - superAdminID format is incorrect!');
			callback('Super Admin Update Profile - superAdminID format is incorrect!', null, null, null);
		}
	} else {
		writeLog(sessionID, 'fatal', 'Super Admin Update Profile - UesrID format is incorrect!');
		callback('Super Admin Update Profile - UesrID format is incorrect!', null, null, null);
	}
};