module.exports = function (sessionID, username, password, re_password, email, writeLog, callback) {
	// remove leading and tailing spaces if have.
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

	if (!(/^[\w]{3,20}$/.test(username))) {
		// username validation
		writeLog(sessionID, 'fatal', 'Sign Up - Only letter, number and underscore are allowed in username, within 3~20 characters!');
		callback('Sign Up - Only letter, number and underscore are allowed in username, within 3~20 characters!', null);
	} else if (password.length < 6) {
		writeLog(sessionID, 'fatal', 'Sign Up - The length of password must be longer than 6 characters!');
		callback('Sign Up - The length of password must be longer than 6 characters!', null);
	} else if (password !== re_password) {
		// password validation
		writeLog(sessionID, 'fatal', 'Sign Up - Passwords you input do not match!');
		callback('Sign Up - Passwords you input do not match!', null);
	} else if (!(/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email))) {
		// simple email validation
		writeLog(sessionID, 'fatal', 'Sign Up - Email format is incorrect!');
		callback('Sign Up - Email format is incorrect!', null);
	} else {
		writeLog(sessionID, 'debug', 'Sign Up - Server side input validation is passed!');
		callback(null, {
			username: username,
			password: password,
			email: email
		});
	}
};