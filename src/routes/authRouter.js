var express = require('express');
var request = require('request');
var authRouter = express.Router();

module.exports = function (config) {

	// This is the router of sending request to get Webex link, then after user input email it
	// redirects to Spark API (api.ciscospark.com/v1/access_token) to get accessToken.
	authRouter.route('/spark')
		.get(function (req, res) {
			require('../actions/getRedirectWebexURL')(config, function (err, webexURL) {
				req.session.securityCode = 'key cat';
				if (!err) {
					res.redirect(webexURL);
				} else {
					console.log('error: ' + err);
					res.render('error', {
						error: err
					});
				}
			});
		});

	// Get response of Spark API, which sends the accessToken and state back via HTTP GET.
	authRouter.route('/spark/callback')
		.all(function (req, res, next) {
			if(req.session.securityCode === 'key cat'){
				next();
			}else{
				res.render('error', {
					error: 'Please come in from initial page'
				});
			}
		})
		.get(function (req, res) {
			require('../actions/getAccessToken')(config, req.query.code, req.query.state,
				function (err, parsedBody) {
					if (!err) {
						if (!!parsedBody.access_token) {
							req.session.accessToken = parsedBody.access_token;
							req.session.refreshToken = parsedBody.refresh_token;
							res.render('access_interface', {
								tokenInfo: parsedBody
							});
						} else {
							req.session.securityCode = null;
							req.session.accessToken = null;
							req.session.refreshToken = null;
							res.render('error', {
								error: 'Illegal Operation, You are out now!'
							});
						}
					} else {
						console.log(err);
						res.render('error', {
							error: err
						});
					}
				});
		});

	return authRouter;
};