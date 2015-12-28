var express = require('express');
var request = require('request');
var https = require('https');
var actionsRouter = express.Router();

// This is the router of creating room and adding user into the newly created room.
actionsRouter.route('/createAndJoinRoom')
	.all(function (req, res, next) {
		if (req.session.accessToken && req.session.refreshToken) {
			next();
		} else {
			req.session.securityCode = null;
			req.session.accessToken = null;
			req.session.refreshToken = null;
			res.render('error', {
				error: 'Illegal Operation, You are logged out now!'
			});
		}
	})
	.post(function (req, res) {
		var accessToken = req.session.accessToken;
		var roomName = req.body.roomName;
		var userEmail = req.body.userEmail;
		var flag = true;

		if (/[<>\'\"]/.test(roomName)) {
			console('here1');
			flag = false;
		} else if (!(/^[\w-\.]+@[\w-\.]+(\.\w+)+$/.test(userEmail))) {
			console('here2');
			flag = false;
		} else if (roomName.length < 2 || roomName.length > 20) {
			console('here3');
			flag = false;
		}

		if (!flag) {
			console.log('Server side input validation failed');
			res.render('error', {
				error: 'Room name or user email is invalid, or both are invalid'
			});
		} else {
			require('../actions/createRoom')(accessToken, roomName, userEmail, function (err, result) {
				if (!err) {
					req.session.newRoomID = result.newRoomID;
					res.render('talk', {
						newRoomID: result.newRoomID,
						membershipID: result.membershipID
					});
				} else {
					console.log(err);
					res.render('error', {
						error: err
					});
				}
			});
		}
	});

// This is the router of deleting room.
actionsRouter.route('/deleteRoom')
	.all(function (req, res, next) {
		if (req.session.accessToken && req.session.refreshToken) {
			next();
		} else {
			req.session.securityCode = null;
			req.session.accessToken = null;
			req.session.refreshToken = null;
			res.render('error', {
				error: 'Illegal Operation, You are logged out now!'
			});
		}
	})
	.post(function (req, res) {
		var newRoomID = req.session.newRoomID;
		require('../actions/deleteRoom')(newRoomID, req.session.accessToken, function (err) {
			if (!err) {
				req.session.newRoomID = null;
				req.session.accessToken = null;
				req.session.refreshToken = null;
				res.render('index', {
					deleteRoom: 'The room has been deleted:' + newRoomID
				});
			} else {
				console.log('Deleting room failed.');
				res.render('error', {
					error: err + 'RoomID:' + newRoomID + '. Please delete it from Web API.'
				});
			}
		});
	});

module.exports = actionsRouter;