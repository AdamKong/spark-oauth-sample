var express = require('express');
var adminRouter = express.Router();
var sessionDisabler = require('../controllers/sessionDisabler.js');
var passport = require('passport');
var bcrypt = require('bcrypt');

module.exports = function (dbConfig, superAdminAccount, oauth, writeLog) {

	// Initialize Super Admin Account in configuration file.
	adminRouter.route('/initialize')
		.get(function (req, res) {
			var theSessionID = req.sessionID;
			require('../controllers/superAdminAccInitializer.js')(theSessionID,
				superAdminAccount,
				dbConfig,
				writeLog,
				function (err, result) {
					if (err) {
						res.render('adminError', {
							error: err,
							next: '/admin'
						});
					} else {
						req.logIn(result, function (error) {
							if (error) {
								writeLog(theSessionID, 'error', 'Super Admin Initialization - Login Failure: ' + error);
								sessionDisabler(req, writeLog,
									'line 28 of adminRouter.js');
								res.render('adminError', {
									error: 'Super Admin Initialization - Login Failure: ' + error,
									next: '/admin'
								});
							} else {
								writeLog(theSessionID, 'debug',
									'Super Admin Initialization is complete. Logged in!');
								res.render('manageTokens', {
									user: result.username,
									anchorID: '',
									error: null,
									tokens: null,
									superAdminUsername: superAdminAccount.username
								});
							}
						});
					}
				});
		});

	// Going to sign up page
	adminRouter.route('/signUpPage')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				if (req.user.username !== superAdminAccount.username) {
					sessionDisabler(req, writeLog, 'line 408 of adminRouter.js');
					res.render('adminError', {
						error: 'Please log in as the super admin first. Current session has been destoryed!',
						next: '/admin'
					});
				} else {
					next();
				}
			} else {
				res.render('adminError', {
					error: 'Please log in as the Super Admin first!',
					next: '/admin'
				});
			}
		})
		.get(function (req, res) {
			var theSessionID = req.sessionID;
			req.session.signUpSessionID = theSessionID;
			writeLog(theSessionID, 'debug',
				'In /admin/signUpPage path now. Added a session variable "signUpSessionID"');
			res.render('signUp');
		});

	// Going to do sign up action
	adminRouter.route('/signUp')
		.all(function (req, res, next) {
			var theSessionID = req.sessionID;
			if (req.isAuthenticated()) {
				if (req.user.username !== superAdminAccount.username) {
					sessionDisabler(req, writeLog, 'line 408 of adminRouter.js');
					res.render('adminError', {
						error: 'Please log in as the Super Admin first. Current session has been destoryed!',
						next: '/admin'
					});
				} else {
					// This is to refuse direct access
					if (!req.session.signUpSessionID) {
						writeLog(theSessionID, 'fatal', 'Please do not access /admin/signUp router directly. Go to admin/signUpPage to come in. Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 22 of adminRouter.js');
						res.render('adminError', {
							error: 'Please do not come into /admin/signUp directly. Illegal Operation, session destroyed!',
							next: '/admin/signUpPage'
						});
					} else if (req.session.signedUp) {
						writeLog(theSessionID, 'fatal', 'You have ever reached /admin/signUp in the session. Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 28 of adminRouter.js');
						res.render('adminError', {
							error: 'You have ever reached /admin/signUp in the session. Illegal Operation, session is going to be destroyed!',
							next: '/admin/signUpPage'
						});
					} else {
						next();
					}
				}
			} else {
				res.render('adminError', {
					error: 'Please log in as the Super Admin first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			var theSessionID = req.sessionID;
			// server side input validation
			require('../controllers/signUpValidator.js')(theSessionID,
				req.body.username,
				req.body.password,
				req.body.re_password,
				req.body.email,
				writeLog,
				function (err, user) {
					if (err) {
						writeLog(theSessionID, 'fatal',
							err + ' How did you get in here? Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 52 of adminRouter.js');
						res.render('adminError', {
							error: err + ' How did you get in here? Illegal Operation, session is going to be destroyed!',
							next: '/admin/signUpPage'
						});
					} else {
						var dbFunctions = require('../controllers/dbController.js')(
							dbConfig,
							theSessionID,
							writeLog);

						dbFunctions.findUsersByUsername(user.username, function (er, users) {
							if ((users === null) && (er === 'The user with username: ' + user.username + ' does not exist!')) {
								// insert to db.
								var salt = bcrypt.genSaltSync(10);
								var hash = bcrypt.hashSync(user.password, salt);
								user.password = hash;
								dbFunctions.insertDB(user, dbConfig.adminDBName,
									function (e, result) {
										if (e) {
											writeLog(theSessionID, 'fatal', e);
											sessionDisabler(req, writeLog,
												'line 67 of adminRouter.js');
											res.render('adminError', {
												error: e,
												next: '/admin/signUpPage'
											});
										} else {
											// display all admin users.
											dbFunctions.displayAllAdminUsers(
												function (erro, all_users) {
													if (erro) {
														res.render('adminError', {
															error: erro,
															next: '/admin'
														});
													} else {
														writeLog(theSessionID, 'debug', 'In super Admin page - display all Admin users.');
														res.render('displayAllAdminUsers', {
															actionResult: null,
															superAdminID: req.user._id,
															superAdminUsername: superAdminAccount.username,
															users: all_users
														});
													}
												});
										}
									});
							} else {
								// Error happened when chekcing user, or the user has already existed.
								var message = '';
								if (err) {
									message = err;
								} else {
									message = 'A user with the username "' + user.username + '" has existed. Please use other username to try again!';
								}
								writeLog(theSessionID, 'error', message);
								res.render('adminError', {
									error: 'Sign Up failed. Because: ' + message,
									next: '/admin/signUpPage'
								});
							}
						});
					}
				});
		});

	// Going to sign in page
	adminRouter.route('/')
		.get(function (req, res) {
			var theSessionID = req.sessionID;
			req.session.signInSessionID = theSessionID;
			writeLog(theSessionID, 'debug', 'In /admin path now. Added a session variable "signInSessionID"');
			res.render('signIn');
		});

	// Going to do sign in action
	adminRouter.route('/signIn')
		.all(function (req, res, next) {
			var theSessionID = req.sessionID;
			// This is to refuse direct access
			if (!req.session.signInSessionID) {
				writeLog(theSessionID, 'fatal', 'Please do not access /admin/signIn router directly. Go to /admin page to come in. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 132 of adminRouter.js');
				res.render('adminError', {
					error: 'Please do not come in /admin/signIn directly. Illegal Operation, session destroyed!',
					next: '/admin'
				});
			} else if (req.isAuthenticated()) {
				writeLog(theSessionID, 'debug', 'You have realdy logged in as ' + req.user.username + ', so redirect to token management center direclty');
				res.render('manageTokens', {
					user: req.user.username,
					anchorID: '',
					error: null,
					tokens: null,
					superAdminUsername: superAdminAccount.username
				});
			} else {
				next();
			}
		})
		.post(function (req, res, next) {
			//start verifying user.
			passport.authenticate('local', function (err, user, info) {
				if (err) {
					return res.redirect('/admin');
				}
				if (!user) {
					return res.render('adminError', {
						error: info.message,
						next: '/admin'
					});
				}
				req.logIn(user, function (e) {
					if (e) {
						res.render('adminError', {
							error: info.message + '. ' + e,
							next: '/admin'
						});
					} else {
						res.render('manageTokens', {
							user: user.username,
							anchorID: '',
							error: null,
							tokens: '',
							superAdminUsername: superAdminAccount.username
						});
					}
				});
			})(req, res, next);
		});

	// Going to display all tokens of a specific person
	adminRouter.route('/displayTokens')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				next();
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			var theSessionID = req.sessionID;
			require('../controllers/manageTokenValidator.js')(theSessionID,
				req.body.email,
				writeLog,
				function (err, email) {
					if (err) {
						writeLog(theSessionID, 'fatal',
							err + ' How did you get in here? Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 183 of adminRouter.js');
						res.render('adminError', {
							error: err,
							next: '/admin'
						});
					} else {
						var dbFunctions = require('../controllers/dbController.js')(
							dbConfig,
							theSessionID,
							writeLog);
						dbFunctions.findTokensByEmail(email, function (e, tokens) {
							if (e) {
								res.render('manageTokens', {
									user: req.user.username,
									anchorID: '',
									error: e,
									tokens: null,
									superAdminUsername: superAdminAccount.username
								});
							} else {
								res.render('manageTokens', {
									user: req.user.username,
									anchorID: '',
									error: null,
									tokens: tokens,
									superAdminUsername: superAdminAccount.username
								});
							}
						});
					}
				});
		});

	// Refresh a specific token
	// Form data input validation although no user input, preventing XSS.
	adminRouter.route('/refreshTokens')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				next();
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			var theSessionID = req.sessionID;
			var id = req.body.token_id;
			var refreshToken = req.body.refresh_token;
			var email = req.body.email;
			var anchorID = req.body.anchorID;
		
			require('../controllers/refreshTokenValidator.js')(theSessionID,
				id,
				refreshToken,
				email,
			    anchorID,
				writeLog,
				function (error, obj) {
					if (error) {
						writeLog(theSessionID, 'fatal',
							error + '. You should not be able to modify anything in the form of last step. Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 243 of adminRouter.js');
						res.render('adminError', {
							error: error + '. You should not be able to modify anything in the form of last step. Illegal Operation, session is going to be destroyed!',
							next: '/admin'
						});
					} else {
						require('../actions/refreshToken.js')(oauth,
							theSessionID,
							obj.refreshToken,
							writeLog,
							function (err, newTokenInfoObj) {
								if (err) {
									res.render('manageTokens', {
										user: req.user.username,
										anchorID: '',
										error: err,
										tokens: null,
										superAdminUsername: superAdminAccount.username
									});
								} else {
									var dbFunctions = require('../controllers/dbController.js')(
										dbConfig,
										theSessionID,
										writeLog);

									dbFunctions.updateTokenByID(obj.id,
										newTokenInfoObj,
										function (e, result) {
											if (e) {
												res.render('manageTokens', {
													user: req.user.username,
													anchorID: '',
													error: e,
													tokens: null,
													superAdminUsername: superAdminAccount.username
												});
											} else {
												dbFunctions.findTokensByEmail(obj.email,
													function (er, tokens) {
														if (er) {
															res.render('manageTokens', {
																user: req.user.username,
																anchorID: '',
																error: er,
																tokens: null,
																superAdminUsername: superAdminAccount.username
															});
														} else {
															res.render('manageTokens', {
																user: req.user.username,
																anchorID: obj.anchorID,
																error: null,
																tokens: tokens,
																superAdminUsername: superAdminAccount.username
															});
														}
													});
											}
										});
								}
							});
					}
				});
		});

	// Remove a specific token
	// Form data input validation although no user input, preventing XSS.
	adminRouter.route('/removeTokens')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				next();
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			var theSessionID = req.sessionID;
			var id = req.body.token_id;
			var email = req.body.email;
			var anchorID = req.body.anchorID;
			require('../controllers/removeTokenValidator.js')(theSessionID,
				id,
				email,
			    anchorID,
				writeLog,
				function (error, obj) {
					if (error) {
						writeLog(theSessionID, 'fatal',
							error + ' You should not be able to modify anything in the form of last step. Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 324 of adminRouter.js');
						res.render('adminError', {
							error: error + ' You should not be able to modify anything in the form of last step. Illegal Operation, session is going to be destroyed!',
							next: '/admin'
						});
					} else {
						var dbFunctions = require('../controllers/dbController.js')(
							dbConfig,
							theSessionID,
							writeLog);
						dbFunctions.removeTokenByID(obj.id, function (e, result) {
							if (e) {
								res.render('manageTokens', {
									user: req.user.username,
									anchorID: obj.anchorID,
									error: e,
									tokens: null,
									superAdminUsername: superAdminAccount.username
								});
							} else {
								dbFunctions.findTokensByEmail(obj.email, function (er, tokens) {
									if (er) {
										res.render('manageTokens', {
											user: req.user.username,
											anchorID: '',
											error: er,
											tokens: null,
											superAdminUsername: superAdminAccount.username
										});
									} else {
										res.render('manageTokens', {
											user: req.user.username,
											anchorID: (parseInt(obj.anchorID) - 1).toString(),
											error: null,
											tokens: tokens,
											superAdminUsername: superAdminAccount.username
										});
									}
								});
							}
						});
					}
				});
		});

	// Show a user's profile
	adminRouter.route('/profile')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				next();
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.get(function (req, res) {
			writeLog(req.sessionID, 'debug',
				'User:' + req.user.username + 'is trying to update his/her profile');
			res.render('adminUpdateP', {
				username: req.user.username,
				email: req.user.email,
				superAdminUsername: superAdminAccount.username
			});
		});

	// Update a user's profile
	adminRouter.route('/updateProfile')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				next();
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			var theSessionID = req.sessionID;
			// server side input validation
			require('../controllers/updateProfileValidator.js')(theSessionID,
				req.body.username,
				req.body.password,
				req.body.re_password,
				req.body.email,
				writeLog,
				function (err, newProfile) {
					var count = 0;
					for (var key in newProfile) {
						count++;
					}
					if (err) {
						writeLog(theSessionID, 'fatal',
							err + ' How did you get in here? Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 370 of adminRouter.js');
						res.render('adminError', {
							error: err + ' How did you get in here? Illegal Operation, session is going to be destroyed!',
							next: '/admin'
						});
					} else {
						var dbFunctions = require('../controllers/dbController.js')(
							dbConfig,
							theSessionID,
							writeLog);
						// If the username has been changed, then invalid operation, and go back to
						// re-login
						dbFunctions.findUserByID(req.user._id, function (err, user) {
							if (err) {
								writeLog(theSessionID, 'fatal',
									err + ' Got problem when looking for the logged-in user. Plaese re-login. The current senssion is going to be destroyed!');
								sessionDisabler(req, writeLog, 'line 370 of adminRouter.js');
								res.render('adminError', {
									error: err + ' Got problem when looking for the logged-in user. Plaese re-login. The current senssion has been destroyed!',
									next: '/admin'
								});
							} else {
								require('../controllers/formDbComparer.js')(theSessionID,
									newProfile,
									count,
									user,
									writeLog,
									function (er, newProfileAfterComparison) {
										if (er) {
											res.render('manageTokens', {
												user: user.username,
												anchorID: '',
												error: er,
												tokens: '',
												superAdminUsername: superAdminAccount.username
											});
										} else {
											// If usernames are not equal,
											// it's not allowed to modify profile.
											if (user.username === newProfileAfterComparison.username) {
												writeLog(theSessionID, 'debug',
													'usernames in DB and form are the same');
												// update user in db.
												dbFunctions.updateUserByID(req.user._id,
													newProfileAfterComparison,
													function (e, result) {
														if (e) {
															res.render('adminError', {
																error: e,
																next: '/admin'
															});
														} else {
															// common admin user can only modify
															// himself/herself profile, so here
															// we can use req.user._id
															dbFunctions.findUserByID(req.user._id,
																function (er, user) {
																	if (er) {
																		res.render('adminError', {
																			error: er,
																			next: '/admin'
																		});
																	} else {
																		writeLog(theSessionID, 'debug',
																			'username: ' + user.username + 'has been modified!. The current session has been destroyed and the user needs to re-login.');
																		sessionDisabler(req, writeLog,
																			'line 391 of adminRouter.js');
																		res.render('adminError', {
																			error: 'Your profile has been updated, and the current session has been destroyed. Please click the below red Here to re-login.',
																			next: '/admin'
																		});
																	}
																});
														}
													});
											} else {
												writeLog(theSessionID, 'fatal', 'Can not modify username here. How did you get in here? I see the modified username is : ' + user.username + '. Session is going to be destroyed. Please re-login.');
												sessionDisabler(req, writeLog, 'line 370 of adminRouter.js');
												res.render('adminError', {
													error: 'Can not modify username here. How did you get in here? I see the modified username is: ' + user.username + '. Session is going to be destroyed. Please re-login.',
													next: '/admin'
												});
											}
										}
									});
							}
						});
					}
				});
		});

	// Display all admin users
	adminRouter.route('/superAdmin')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				if (req.user.username !== superAdminAccount.username) {
					sessionDisabler(req, writeLog, 'line 408 of adminRouter.js');
					res.render('adminError', {
						error: 'Please log in as the super admin first. Current session has been destoryed!',
						next: '/admin'
					});
				} else {
					next();
				}
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.get(function (req, res) {
			var theSessionID = req.sessionID;
				// display all admin users.
				var dbFunctions = require('../controllers/dbController.js')(
					dbConfig,
					theSessionID,
					writeLog);

				dbFunctions.displayAllAdminUsers(function (err, users) {
					if (err) {
						res.render('adminError', {
							error: err,
							next: '/admin'
						});
					} else {
						writeLog(theSessionID, 'debug', 'In super Admin page now.');
						res.render('displayAllAdminUsers', {
							actionResult: null,
							superAdminID: req.user._id,
							superAdminUsername: superAdminAccount.username,
							users: users
						});
					}
				});
		});

	// The page of super admin updateing a user's profile
	adminRouter.route('/superAdminUpdatePage')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				if (req.user.username !== superAdminAccount.username) {
					sessionDisabler(req, writeLog, 'line 408 of adminRouter.js');
					res.render('adminError', {
						error: 'Please log in as the super admin first. Current session has been destoryed!',
						next: '/admin'
					});
				} else {
					next();
				}
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			writeLog(req.sessionID, 'debug',
				'Super admin is in the page of updating user:' + req.body.username);
			res.render('superAdminUpdatePage', {
				userID: req.body.userID,
				superAdminID: req.body.superAdminID,
				superAdminUsername: superAdminAccount.username,
				username: req.body.username,
				email: req.body.email
			});
		});

	// Super admin updates a specific user
	// Form data input validation although no user input, preventing XSS.
	adminRouter.route('/superAdminUpdateProfile')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				if (req.user.username !== superAdminAccount.username) {
					sessionDisabler(req, writeLog, 'line 526 of adminRouter.js');
					res.render('adminError', {
						error: 'Please log in as the super admin first. Current session has been destoryed!',
						next: '/admin'
					});
				} else {
					next();
				}
			} else {
				res.render('adminError', {
					error: 'Please log in as the Super Admin first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			var theSessionID = req.sessionID;
			var userID = req.body.userID;
			var superAdminID = req.body.superAdminID;
			var username = req.body.username;
			var password = req.body.password;
			var re_password = req.body.re_password;
			var email = req.body.email;
			writeLog(theSessionID, 'debug',
				'Super admin is trying to update the profile of the user:' + req.body.username);
			require('../controllers/superAdminUpdateProfileValidator.js')(theSessionID,
				userID,
				superAdminID,
				username,
				password,
				re_password,
				email,
				writeLog,
				function (error, _userID, _superAdminID, newProfile) {
					var count = 0;
					for (var key in newProfile) {
						count++;
					}
					if (error) {
						writeLog(theSessionID, 'fatal',
							error + ' How did you get in here? Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 562 of adminRouter.js');
						res.render('adminError', {
							error: error + ' How did you get in here? Illegal Operation, session is going to be destroyed!',
							next: '/admin'
						});
					} else {
						var dbFunctions = require('../controllers/dbController.js')(
							dbConfig,
							theSessionID,
							writeLog);
						// Judge if the Super Admin is trying to change itself or someone else.
						if (_userID === _superAdminID) {
							// If usernames in form and config are not the same, username has
							// been changed, invalid operation.
							if (newProfile.username !== superAdminAccount.username) {
								dbFunctions.displayAllAdminUsers(function (err, users) {
									if (err) {
										res.render('adminError', {
											error: err,
											next: '/admin'
										});
									} else {
										writeLog(theSessionID, 'debug', 'Nothing has been modified. It is not allowed to update the username of the Super Admin account. Go to config.json to modify it instead!');
										res.render('displayAllAdminUsers', {
											actionResult: 'Nothing has been modified. It is not allowed to update the username of the Super Admin account. Go to config.json to modify it instead!',
											superAdminID: _superAdminID,
											superAdminUsername: superAdminAccount.username,
											users: users
										});
									}
								});
							} else {
								// 比较是否form的值发生变化. 如果没有发生变化, 则报提示,并不执行.
								dbFunctions.findUserByID(req.user._id, function (e, user) {
									if (e) {
										writeLog(theSessionID, 'error', 'Ohh, I can not find the super admin whose ID is :' + req.user._id + '. Please re-login');
										sessionDisabler(req, writeLog, 'the line 767 of adminRouter.js');
										res.render('adminError', {
											error: 'Ohh, I can not find the super admin whose ID is :' + req.user._id + '. Please re-login',
											next: '/admin'
										});
									} else {
										require('../controllers/formDbComparer.js')(theSessionID,
											newProfile,
											count,
											user,
											writeLog,
											function (er, newProfileAfterComparison) {
												if (er) {
													dbFunctions.displayAllAdminUsers(
														function (err, users) {
															if (err) {
																res.render('adminError', {
																	error: err,
																	next: '/admin'
																});
															} else {
																writeLog(theSessionID, 'debug', er);
																res.render('displayAllAdminUsers', {
																	actionResult: 'The profile of the super admin has not been modified, because: ' + er,
																	superAdminID: _superAdminID,
																	superAdminUsername: superAdminAccount.username,
																	users: users
																});
															}
														});
												} else {
													// The username is not changed, and the Super
													// admin just wants to modify his personal info.
													dbFunctions.updateUserByID(_userID,
														newProfileAfterComparison,
														function (er, result) {
															if (er) {
																// If it's failed to update Super
																// admin, just go back to display
																// all the admin users
																writeLog(theSessionID, 'error', 'Failed to udpate Super admin, just go back to display all the admin users');
																dbFunctions.displayAllAdminUsers(function (err, users) {
																	if (err) {
																		res.render('adminError', {
																			error: err,
																			next: '/admin'
																		});
																	} else {
																		res.render('displayAllAdminUsers', {
																			actionResult: er,
																			superAdminID: _superAdminID,
																			superAdminUsername: superAdminAccount.username,
																			users: users
																		});
																	}
																});
															} else {
																// If it succeeded to update Super admin,
																// He/she needs to re-login
																writeLog(theSessionID, 'debug',
																	'Your profile (as Super Admin) has been updated, and the current session has been destroyed. Needs to re-login. The Super Admin ID is:' + _userID);
																sessionDisabler(req, writeLog, 'line 673 of adminRouter.js');
																res.render('adminError', {
																	error: 'Your profile (as Super Admin) has been updated, and the current session has been destroyed. Please click the below red Here to re-login.',
																	next: '/admin'
																});
															}
														});
												}
											});
									}
								});
							}
						} else {
							// Check if super admin user is trying to change the user's username
							dbFunctions.findUserByID(_userID, function (e, user) {
								if (e) {
									dbFunctions.displayAllAdminUsers(function (err, users) {
										if (err) {
											res.render('adminError', {
												error: err,
												next: '/admin'
											});
										} else {
											writeLog(theSessionID, 'debug', 'Ohh, at this step, we event can not find out the user by ID:' + _userID);
											res.render('displayAllAdminUsers', {
												actionResult: 'Ohh, at this step, we event can not find out the user by ID:' + _userID,
												superAdminID: _superAdminID,
												superAdminUsername: superAdminAccount.username,
												users: users
											});
										}
									});
								} else {
									// Found out the user by the user ID,
									// and no change to the username.
									if (user.username === newProfile.username) {
										// check if there is any change in form compared to the user in db.
										require('../controllers/formDbComparer.js')(theSessionID,
											newProfile,
											count,
											user,
											writeLog,
											function (er, newProfileAfterComparison) {
												if (er) {
													dbFunctions.displayAllAdminUsers(
														function (err, users) {
															if (err) {
																res.render('adminError', {
																	error: err,
																	next: '/admin'
																});
															} else {
																writeLog(theSessionID, 'debug', er);
																res.render('displayAllAdminUsers', {
																	actionResult: 'The user ' + user.username + ' has not been modified, because: ' + er,
																	superAdminID: _superAdminID,
																	superAdminUsername: superAdminAccount.username,
																	users: users
																});
															}
														});
												} else {
													// The username is not changed, and the Super
													// admin just wants to modify his personal info.
													dbFunctions.updateUserByID(_userID,
														newProfileAfterComparison,
														function (err, result) {
															var actionResult = null;
															if (err) {
																actionResult = 'Failed to update the user whose ID is: ' + _userID + '. error: ' + err;
															} else {
																actionResult = 'Succeeded to update the user whose ID is: ' + _userID;
															}
															dbFunctions.displayAllAdminUsers(function (erro, users) {
																if (erro) {
																	res.render('adminError', {
																		error: erro,
																		next: '/admin'
																	});
																} else {
																	writeLog(theSessionID, 'debug',
																		'Super admin updated the user whose ID is:' + _userID + '. In display all admin user page now.');
																	res.render('displayAllAdminUsers', {
																		actionResult: actionResult,
																		superAdminID: _superAdminID,
																		superAdminUsername: superAdminAccount.username,
																		users: users
																	});
																}
															});
														});
												}
											});
									} else {
										// Can not find out any record by newProfile.username, so
										// the new username is usable.
										dbFunctions.findUsersByUsername(newProfile.username,
											function (er, _user) {
												if ((_user === null) && (er === 'The user with username: ' + newProfile.username + ' does not exist!')) {
													require('../controllers/formDbComparer.js')(theSessionID,
														newProfile,
														count,
														user,
														writeLog,
														function (err, newProfileAfterComparison) {
															if (err) {
																dbFunctions.displayAllAdminUsers(
																	function (erro, users) {
																		if (erro) {
																			res.render('adminError', {
																				error: erro,
																				next: '/admin'
																			});
																		} else {
																			writeLog(theSessionID, 'debug', err);
																			res.render('displayAllAdminUsers', {
																				actionResult: 'The user whose ID ' + _user + ' has not been modified, because: ' + err,
																				superAdminID: _superAdminID,
																				superAdminUsername: superAdminAccount.username,
																				users: users
																			});
																		}
																	});
															} else {
																// The new username is not occupied and available.
																dbFunctions.updateUserByID(_userID,
																	newProfileAfterComparison,
																	function (erro, result) {
																		var actionResult = null;
																		if (erro) {
																			actionResult = 'Failed to update the user whose ID is: ' + _userID + '. error: ' + erro;
																		} else {
																			actionResult = 'Succeeded to update the user whose ID is: ' + _userID;
																		}
																		dbFunctions.displayAllAdminUsers(function (error, users) {
																			if (error) {
																				res.render('adminError', {
																					error: error,
																					next: '/admin'
																				});
																			} else {
																				writeLog(theSessionID, 'debug',
																					'Super admin updated the user whose ID is:' + _userID + '. In display all admin user page now.');
																				res.render('displayAllAdminUsers', {
																					actionResult: actionResult,
																					superAdminID: _superAdminID,
																					superAdminUsername: superAdminAccount.username,
																					users: users
																				});
																			}
																		});
																	});
															}
														});
												} else {
													dbFunctions.displayAllAdminUsers(function (err, users) {
														if (err) {
															res.render('adminError', {
																error: err,
																next: '/admin'
															});
														} else {
															writeLog(theSessionID, 'debug', 'The user name "' + newProfile.username + '" has been occupied. Please change the username and try again!');
															res.render('displayAllAdminUsers', {
																actionResult: 'The user name "' + newProfile.username + '" has been occupied. Please change the username and try again!',
																superAdminID: _superAdminID,
																superAdminUsername: superAdminAccount.username,
																users: users
															});
														}
													});
												}
											});
									}
								}
							});
						}
					}
				});
		});

	// Super admin remove the a specific user
	// Form data input validation although no user input, preventing XSS.
	adminRouter.route('/superAdminRemoveUser')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				if (req.user.username !== superAdminAccount.username) {
					sessionDisabler(req, writeLog, 'line 408 of adminRouter.js');
					res.render('adminError', {
						error: 'Please log in as the super admin first. Current session has been destoryed!',
						next: '/admin'
					});
				} else {
					next();
				}
			} else {
				res.render('adminError', {
					error: 'Please log in as Super Admin first!',
					next: '/admin'
				});
			}
		})
		.post(function (req, res) {
			var theSessionID = req.sessionID;
			var userID = req.body.userID;
			var superAdminID = req.body.superAdminID;
			require('../controllers/superAdminRemoveUserValidator.js')(theSessionID,
				userID,
				superAdminID,
				writeLog,
				function (error, obj) {
					if (error) {
						writeLog(theSessionID, 'fatal',
							error + ' You should not be able to modify anything in the form of last step. Illegal Operation, session is going to be destroyed!');
						sessionDisabler(req, writeLog, 'line 633 of adminRouter.js');
						res.render('adminError', {
							error: error + ' You should not be able to modify anything in the form of last step. Illegal Operation, session is going to be destroyed!',
							next: '/admin'
						});
					} else {
						var dbFunctions = require('../controllers/dbController.js')(
							dbConfig,
							theSessionID,
							writeLog);

						if (obj.userID === obj.superAdminID) {
							// The Super Admin can not remove itself.
							dbFunctions.displayAllAdminUsers(function (err, users) {
								if (err) {
									res.render('adminError', {
										error: err,
										next: '/admin'
									});
								} else {
									writeLog(theSessionID, 'debug', 'The Super Admin account can not remove itself. In displayAllAdminUsers page now.');
									res.render('displayAllAdminUsers', {
										actionResult: 'The Super Admin account can not remove itself!',
										superAdminID: req.user._id,
										superAdminUsername: superAdminAccount.username,
										users: users
									});
								}
							});
						} else {
							dbFunctions.removeUserByID(obj.userID,
								function (e, result) {
									if (e) {
										dbFunctions.displayAllAdminUsers(function (err, users) {
											if (err) {
												res.render('adminError', {
													error: err,
													next: '/admin'
												});
											} else {
												writeLog(theSessionID, 'debug', ' Got error when removing the user: ' + obj.userID + '. In displayAllAdminUsers page now.');
												res.render('displayAllAdminUsers', {
													actionResult: e,
													superAdminID: req.user._id,
													superAdminUsername: superAdminAccount.username,
													users: users
												});
											}
										});
									} else {
										dbFunctions.displayAllAdminUsers(function (err, users) {
											if (err) {
												res.render('adminError', {
													error: err,
													next: '/admin'
												});
											} else {
												writeLog(theSessionID, 'debug',
													'Super admin removed the user whose ID is: ' + obj.userID + '. In display all admin user page now.');
												res.render('displayAllAdminUsers', {
													actionResult: 'Super admin removed the user whose ID is: ' + obj.userID + '. In display all admin user page now.',
													superAdminID: obj.superAdminID,
													superAdminUsername: superAdminAccount.username,
													users: users
												});
											}
										});
									}
								});
						}
					}
				});
		});

	// Admin user logs out
	adminRouter.route('/adminUserLogout')
		.all(function (req, res, next) {
			if (req.isAuthenticated()) {
				writeLog(req.sessionID, 'debug', 'User: ' + req.user.username + ' logged out.');
				next();
			} else {
				res.render('adminError', {
					error: 'Please log in first!',
					next: '/admin'
				});
			}
		})
		.get(function (req, res) {
			req.logOut();
			// res.render('signIn');
			res.redirect('/admin');
		});

	return adminRouter;
};