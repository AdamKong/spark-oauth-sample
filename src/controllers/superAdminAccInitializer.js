var bcrypt = require('bcrypt');

module.exports = function (sessionID, superAdminAccount, dbConfig, writeLog, callback) {

	var dbFunctions = require('./dbController.js')(
	dbConfig,
	sessionID,
	writeLog);

	dbFunctions.findUsersByUsername(superAdminAccount.username, function (err, users) {
		if (err) {
			// Only if the user does not exist, it creates the super admin account.
			if ((err === 'The user with username: ' + superAdminAccount.username + ' does not exist!') && (users === null)) {
				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(superAdminAccount.password, salt);
				dbFunctions.insertDB({
						username: superAdminAccount.username,
						password: hash,
						email: superAdminAccount.email
					}, dbConfig.adminDBName,
					function (e, result) {
						if (e) {
							writeLog(sessionID, 'fatal', e);
							callback('Problem happened when initialzing Super Admin account: ' + e, null);
						} else {
							writeLog(sessionID, 'debug', 'Super Admin user has been initialized.');
							callback(null, result);
						}
					});
			} else {
				writeLog(sessionID, 'debug', err);
				callback(err, false);
			}
		} else {
			writeLog(sessionID, 'debug', 'There is already a user with the username: ' + superAdminAccount.username);
			callback('There is already a user with the username: ' + superAdminAccount.username, false);
		}
	});
};