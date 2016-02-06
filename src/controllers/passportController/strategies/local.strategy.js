var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcrypt = require('bcrypt');
var sessionDisabler = require('../../sessionDisabler.js');

module.exports = function (dbConfig, writeLog) {
	passport.use('local', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, function (req, username, password, callback) {
		var theSessionID = req.sessionID;

		require('../../signInValidator.js')(req.sessionID,
			username,
			password,
			writeLog,
			function (err, user) {
				if (err) {
					writeLog(theSessionID, 'fatal',
						err + ' How did you get in here? Illegal Operation, session is going to be destroyed!');
					sessionDisabler(req, writeLog, 'line 22 of local.strategy.js');
					callback(err + ' How did you get in here? Illegal Operation, session is going to be destroyed!', false);
				} else {
					// looking for user by username.
					var dbFunctions = require('../../dbController.js')(
						dbConfig,
						theSessionID,
						writeLog);

					dbFunctions.findUsersByUsername(user.username, function (e, users) {
						if (e) {
							writeLog(theSessionID, 'fatal', e);
							sessionDisabler(req, writeLog, 'line 34 of local.strategy.js');
							callback(null, false, {
								message: e
							});
						} else {
							writeLog(theSessionID, 'debug',
								'Found out at least one user with the username:' + username);
							req.session.signedIn = theSessionID;
							//If there are more than one user with the username,
							//try checking the password of each one.
							var i = 0;
							for (i = 0; i < users.length; i++) {
								if (bcrypt.compareSync(password, users[i].password)) {
									break;
								}
							}
							if (i === users.length) {
								callback(null, false, {
									message: 'Password is wrong!'
								});
							} else {
								callback(null, users[i]);
							}
						}
					});
				}
			});
	}));
};