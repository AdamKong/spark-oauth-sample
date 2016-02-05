module.exports = function (sessionID, userID, superAdminID, writeLog, callback) {
	// remove leading and tailing spaces if there are.
	var clearSpaces = function (string) {
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		string = string.replace(pattern1, '').replace(pattern2, '');
		return string;
	};

	userID = clearSpaces(userID);
	superAdminID = clearSpaces(superAdminID);

	// Check if user ID is 24 characters or not.
	if (/^[a-zA-Z0-9]{24}$/.test(userID)) {
		// Check if super admin ID is 24 characters or not.
		if (/^[a-zA-Z0-9]{24}$/.test(superAdminID)) {
			callback(null, {
				userID: userID,
				superAdminID: superAdminID
			});
		} else {
			writeLog(sessionID, 'fatal', 'Super Admin Removes a user - superAdminID format is incorrect!');
			callback('Super Admin Removes a user - superAdminID format is incorrect!', null);
		}
	} else {
		writeLog(sessionID, 'fatal', 'Super Admin Removes a user - UesrID format is incorrect!');
		callback('Super Admin Removes a user - UesrID format is incorrect!', null);
	}
};