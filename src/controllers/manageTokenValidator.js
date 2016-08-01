module.exports = function (sessionID, email, writeLog, callback) {
	// remove leading and tailing spaces if have.
	var clearSpaces = function (string) {
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		string = string.replace(pattern1, '').replace(pattern2, '');
		return string;
	};
	
	email = clearSpaces(email);

	// simple email validation
	if (/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email)) {
		writeLog(sessionID, 'debug', 'Get Token - Server side input validation is passed!');
		callback(null, email);
	} else {
		writeLog(sessionID, 'fatal', 'Get Token - Email format is incorrect!');
		callback('Get Token - Email format is incorrect!', null);
	}
};