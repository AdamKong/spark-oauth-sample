var passport = require('passport');
var sessionDisabler = require('../sessionDisabler.js');

module.exports = function (app, dbConfig, writeLog) {

	require('./strategies/local.strategy.js')(dbConfig, writeLog);

	// serialize user into the session
	passport.serializeUser(function (req, user, callback) {
		callback(null, user._id);
	});

	// deserializeUser
	passport.deserializeUser(function (req, id, callback) {
		var dbFunctions = require('../dbController.js')(
			dbConfig,
			req.sessionID,
			writeLog);
		dbFunctions.findUserByID(id, function (e, user) {
			if (e) {
				sessionDisabler(req, writeLog, 'line 21 of passport.js');
				callback(e, false);
			} else {
				writeLog(req.sessionID, 'debug',
					'Found the user:' + user.username + ' in deserializeUser function');
				callback(null, user);
			}
		});
	});

	app.use(passport.initialize());
	app.use(passport.session());
};