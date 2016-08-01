module.exports = function (sessionID, username, password, writeLog, callback) {
	// remove leading and tailing spaces if have.
	var clearSpaces = function (string) {
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		string = string.replace(pattern1, '').replace(pattern2, '');
		return string;
	};

	username = clearSpaces(username);
	password = clearSpaces(password);

	if (!(/^[\w]{3,20}$/.test(username))) {
		// username validation
		writeLog(sessionID, 'fatal', 'Sign In - Only letter, number and underscore are allowed in username, within 3~20 characters!');
		callback('Sign In - Only letter, number and underscore are allowed in username, within 3~20 characters!', null);
	} else if (password.length < 6) {
		writeLog(sessionID, 'fatal', 'Sign In - The length of password must be longer than 6 characters!');
		callback('Sign In - The length of password must be longer than 6 characters!', null);
	} else {
		writeLog(sessionID, 'debug', 'Sign In - Server side input validation is passed!');
		callback(null, {
			username: username,
			password: password
		});
	}
};