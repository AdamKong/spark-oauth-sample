var express = require('express');
var request = require('request');
var https = require('https');
var sessionDisabler = require('../controllers/sessionDisabler.js');
var actionsRouter = express.Router();

module.exports = function (requesterEmail, writeLog) {

	// This is the router of creating room and adding user into the newly created room.
	actionsRouter.route('/createAndJoinRoom')
		.all(function (req, res, next) {
			var theSessionID = req.sessionID;
			// This is to refuse direct access
			if (!req.session.token) {
				writeLog(theSessionID, 'fatal', 'Please do not access actions/createAndJoinRoom router directly. Go to home page to click the red HERE to come in. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 16 of actionsRouter.js');
				res.render('error', {
					error: 'Please do not come in actions/createAndJoinRoom directly. Illegal Operation, session destroyed!',
					tokenInfo: ''
				});
			} else if (req.session.newRoomID) {
				writeLog(theSessionID, 'fatal', 'You have ever reached actions/createAndJoinRoom in the session. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 23 of actionsRouter.js');
				res.render('error', {
					error: 'You have ever reached actions/createAndJoinRoom in the session. Illegal Operation, session is going to be destroyed!',
					tokenInfo: ''
				});
			} else {
				next();
			}
		})
		.post(function (req, res) {
			req.session.newRoomID = 'initial_value';
			var theSessionID = req.sessionID;
			writeLog(theSessionID, 'debug', 'Within the /createAndJoinRoom now!');
			var token = req.session.token;
			var savedToken = token;
			var roomName = req.body.roomName;

			// server side input validation.
			var pattern1 = /^\s+/;
			var pattern2 = /\s+$/;
			roomName = roomName.replace(pattern1, '').replace(pattern2, '');
			// Control the length of valid room name.
			if (roomName.length < 3 || roomName.length > 20) {
				writeLog(theSessionID, 'fatal', 'The length of valid room name should be within 3~20!. How do you pass the client validation? malicious access. Session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 47 of actionsRouter.js');
				res.render('error', {
					error: 'The length of valid room name should be within 3~20!. How do you pass the client validation? malicious access. Session is going to be destroyed!',
					tokenInfo: ''
				});
			}

			require('../actions/createRoom')(token,
				roomName,
				requesterEmail,
				theSessionID,
				writeLog,
				function (err, result) {
					if (!err) {
						writeLog(theSessionID, 'debug', 'Ok, a new room is created, the requester has been added into the room, token has been sent to the request in the room!');
						req.session.newRoomID = result.newRoomID;
						res.render('talk', {
							newRoomID: result.newRoomID,
							membershipID: result.membershipID,
							messageID: result.messageID
						});
					} else {
						writeLog(theSessionID, 'debug', err);
						sessionDisabler(req, writeLog, 'line 70 of actionsRouter.js');
						res.render('error', {
							error: err,
							tokenInfo: savedToken
						});
					}
				});
			});

	// This is the router of deleting room.
	actionsRouter.route('/deleteRoom')
		.all(function (req, res, next) {

			var theSessionID = req.sessionID;
			// This is to refuse direct access
			if (!req.session.newRoomID) {
				writeLog(theSessionID, 'fatal', 'Please do not access actions/deleteRoom router directly. Go to home page to click the red HERE to come in. Illegal Operation, session is going to be destroyed!');
				sessionDisabler(req, writeLog, 'line 87 of actionsRouter.js');
				res.render('error', {
					error: 'Please do not come in actions/deleteRoom directly. Illegal Operation, session destroyed!',
					tokenInfo: ''
				});
			} else if (!req.session) {
				writeLog(theSessionID, 'fatal', 'The session has been destroyed. Illegal Operation!');
				sessionDisabler(req, writeLog, 'line 94 of actionsRouter.js');
				res.render('error', {
					error: 'The session has been destroyed. Illegal Operation!',
					tokenInfo: ''
				});
			} else {
				next();
			}
		})
		.post(function (req, res) {
			var newRoomID = req.session.newRoomID;
			var theSessionID = req.sessionID;

			require('../actions/deleteRoom.js')(newRoomID,
				req.session.token.access_token,
				theSessionID,
				writeLog,
				function (err) {
					if (!err) {
						sessionDisabler(req, writeLog, 'line 113 of actionsRouter.js');
						res.render('index', {
							deleteRoom: 'The room with the room ID: ' + newRoomID + ' has been deleted. Session has been destroyed as well.'
						});
					} else {
						sessionDisabler(req, writeLog, 'line 118 of actionsRouter.js');
						res.render('error', {
							error: err + ' .RoomID:' + newRoomID + '. Please delete it from Web version API.',
							tokenInfo: ''
						});
					}
				});

		});

	return actionsRouter;
};