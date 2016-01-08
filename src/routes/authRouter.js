var express = require('express');
var request = require('request');
var uuid = require('uuid');
var authRouter = express.Router();
var sessionDisabler = require('../controllers/sessionDisabler.js');

module.exports = function (oauth, writeLog) {

	// This is the router of sending request to get Webex link, after user input
	// email it redirects to Spark API (api.ciscospark.com/v1/access_token) to
	// get accessToken.
	authRouter.route('/spark')
		.all(function (req, res, next) {
			var theMySessionID = req.session.mySessionID;
			var theSessionID = req.sessionID;
			if (!theMySessionID) {
				writeLog(theSessionID, 'fatal', 'Please do not access auth/spark router directly. Go to home page to click the red HERE to come in. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 18 of authRouter.js');
				res.render('error', {
					error: 'Please do not come in auth/spark directly. Illegal Operation, session destroyed!',
					tokenInfo: ''
				});
			}else if (req.session.sparkCallbackToken) {
				writeLog(theSessionID, 'fatal', 'You have ever reached auth/spark in the session. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 25 of authRouter.js');
				res.render('error', {
					error: 'You have ever reached auth/spark in the session. Illegal Operation, session is going to be destroyed!',
					tokenInfo: ''
				});
			} else {
				next();
			}
		})
		.get(function (req, res) {
			// Add a new session variable, for security purpose of next step.
			req.session.sparkCallbackToken = uuid.v4();
			var theSessionID = req.sessionID;
			writeLog(theSessionID, 'debug', 'Now within auth/spark now.');
			require('../actions/getRedirectWebexURL.js')(oauth,
				theSessionID,
				writeLog,
				function (err, webexURL) {
					if (!err) {
						res.redirect(webexURL);
					} else {
						sessionDisabler(req, writeLog, 'line 46 of authRouter.js');
						console.log('error: ' + err);
						res.render('error', {
							error: err,
							tokenInfo: ''
						});
					}
				});
		});

	// Get response of Spark API, which sends the accessToken and state back via HTTP GET.
	authRouter.route('/spark/callback')
		.all(function (req, res, next) {
			var theSparkCallbackToken = req.session.sparkCallbackToken;
			var theSessionID = req.sessionID;
			if (!theSparkCallbackToken) {
				writeLog(theSessionID, 'fatal', 'Please do not access auth/spark/callback router directly. Go to home page to click the red HERE to come in. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 63 of authRouter.js');
				res.render('error', {
					error: 'Please do not come in auth/spark/callback directly. Illegal Operation, session destroyed!',
					tokenInfo: ''
				});
			}else if (req.session.token) {
				writeLog(theSessionID, 'fatal', 'You have ever reached auth/spark/callback in the session. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 70 of authRouter.js');
				res.render('error', {
					error: 'You have ever reached auth/spark/callback in the session. Illegal Operation, session is going to be destroyed!',
					tokenInfo: ''
				});
			} else {
				next();
			}
		})
		.get(function (req, res) {
			req.session.token = 'initial_value';
			var theSessionID = req.sessionID;
			// Validate that if the "state" has been tampered.
			if (req.query.state !== oauth.state) {
				writeLog(theSessionID, 'fatal', '"state" has been tampered. Session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 85 of authRouter.js');
				res.render('error', {
					error: '"state" has been tampered. Session has been destroyed!',
					tokenInfo: ''
				});
			}else {
				require('../actions/getAccessToken.js')(oauth,
					theSessionID,
					req.query.code,
					writeLog,
					function (err, bodyObj) {
						if (!err) {
							if (bodyObj.access_token) {
									req.session.token = bodyObj;
									writeLog(theSessionID, 'debug', 'Token is saved in session.');
									res.render('access_interface', {
										tokenInfo: bodyObj
									});
								} else {
									writeLog(theSessionID, 'fatal', 'Failed to get Access Token. Session is going to be destroyed: ' + bodyObj.message);
									sessionDisabler(req, writeLog, 'line 105 of authRouter.js');
									res.render('error', {
										error: 'You are not anthorizated!',
										tokenInfo: ''
									});
								}
						} else {
							writeLog(theSessionID, 'fatal', err + 'Session is going to be destroyed!');
							sessionDisabler(req, writeLog, 'line 113 of authRouter.js');
							console.log(err);
							res.render('error', {
								error: err,
								tokenInfo: ''
							});
						}
				});
			}
	});

	return authRouter;
};