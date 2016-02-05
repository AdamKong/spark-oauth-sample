var MongodbClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

module.exports = function (dbConfig, sessionID, writeLog) {
	//DB connection.
	var dbConnection = function (host, port, dbName, callback) {
		var url = 'mongodb://' + host + ':' + port + '/' + dbName;
		MongodbClient.connect(url, function (err, db) {
			if (err) {
				writeLog(sessionID, 'fatal', 'Failed to connect database:' + dbName + ':' + err);
				callback('Failed to connect database:' + dbName + ':' + err, null);
			} else {
				writeLog(sessionID, 'debug', 'Connected to database:' + dbName);
				callback(null, db);
			}
		});
	};

	// Insert Object Into DB
	var insertDB = function (object, dbName, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbName + 'Collection');
				collection.insertOne(object, function (e, result) {
					if (!e) {
						writeLog(sessionID, 'debug', 'object has been inserted into database:' + dbName + '. Object:' + JSON.stringify(object));
						db.close();
						callback(null, result.ops[0]);
					} else {
						writeLog(sessionID, 'fatal', 'Failed to insert object into database ' + dbName + ':' + e + '. object:' + JSON.stringify(object));
						db.close();
						callback('Failed to insert object into database ' + dbName + ':' + e + '. object:' + JSON.stringify(object), null);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Find out user by ID
	var findUserByID = function (id, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.adminDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.adminDBName + 'Collection');
				collection.find({_id:new ObjectID(id)}).toArray(function (e, user) {
					if (e) {
						writeLog(sessionID, 'error', 'Error happened when looking up user by ID:' + id + '. error:' + e);
						db.close();
						callback('Error happened when looking up user by ID:' + id + '. error:' + e, null);
					}else if (!user[0]) {
						writeLog(sessionID, 'error', 'The user with ID: ' + id + ' does not exist!');
						db.close();
						callback('The user with ID: ' + id + ' does not exist!', null);
					}else {
						writeLog(sessionID, 'debug', 'The user has been found out. username:' + user[0].username);
						db.close();
						callback(null, user[0]);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Find out users by username
	var findUsersByUsername = function (username, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.adminDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.adminDBName + 'Collection');
				collection.find({username:username}).toArray(function (e, users) {
					if (e) {
						writeLog(sessionID, 'error', 'Error happened when looking up users by username:' + username + '. error:' + e);
						db.close();
						callback('Error happened when looking up users by username:' + username + '. error:' + e, null);
					}else if (!users[0]) {
						writeLog(sessionID, 'error', 'The user with username: ' + username + ' does not exist!');
						db.close();
						callback('The user with username: ' + username + ' does not exist!', null);
					}else {
						writeLog(sessionID, 'debug', 'There is at least one user found:' + JSON.stringify(users));
						db.close();
						callback(null, users);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Get tokens by user's email
	var findTokensByEmail = function (email, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.tokenDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.tokenDBName + 'Collection');
				collection.find({email:email}).toArray(function (e, tokens) {
					if (e) {
						writeLog(sessionID, 'error', 'Error happened when looking up tokens by email:' + email + '. error:' + e);
						db.close();
						callback('Error happened when looking up tokens by email:' + email + '. error:' + e, null);
					}else if (!tokens[0]) {
						writeLog(sessionID, 'error', 'No token found with email: ' + email);
						db.close();
						callback('No token found with email: ' + email, null);
					}else {
						writeLog(sessionID, 'debug', 'There is at least one token found:' + JSON.stringify(tokens));
						db.close();
						callback(null, tokens);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Update token by token ID.
	var updateTokenByID = function (id, newToken, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.tokenDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.tokenDBName + 'Collection');
				collection.updateOne({
					_id: new ObjectID(id)
				}, {
					$set: newToken
				}, {
					upsert: true,
					w: 1
				}, function (e, result) {
					if (e) {
						writeLog(sessionID, 'error', 'Error happened when updating token in DB by ID:' + id + '. error:' + e);
						db.close();
						callback('Error happened when updating token in DB by ID:' + id + '. error:' + e, null);
					} else {
						writeLog(sessionID, 'debug', 'Token has been updated in DB by ID:' + id);
						db.close();
						callback(null, result);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Remove token by token ID.
	var removeTokenByID = function (id, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.tokenDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.tokenDBName + 'Collection');
				collection.removeOne({
					_id: new ObjectID(id)
				}, {
					w: 1
				}, function (e, result) {
					if (e) {
						writeLog(sessionID, 'error',
							'Error happened when removing token in DB by ID:' + id + '. error:' + e);
						db.close();
						callback('Error happened when removing token in DB by ID:' + id + '. error:' + e, null);
					} else {
						writeLog(sessionID, 'debug', 'Token has been removed in DB by ID:' + id);
						db.close();
						callback(null, result);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Update user profile by user ID.
	var updateUserByID = function (id, newProfile, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.adminDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.adminDBName + 'Collection');
				collection.updateOne({
					_id: new ObjectID(id)
				}, {
					$set: newProfile
				}, {
					upsert: true,
					w: 1
				}, function (e, result) {
					// result only contains updating result, no new user info.
					// for example: {"ok":1,"nModified":1,"n":1}
					if (e) {
						writeLog(sessionID, 'error',
							'Error happened when updating a user in DB by ID:' + id + '. error:' + e);
						db.close();
						callback('Error happened when updating a user in DB by ID:' + id + '. error:' + e, null);
					} else {
						writeLog(sessionID, 'debug', 'A user has been updated in DB by ID:' + id + '. Changed part:' + JSON.stringify(newProfile));
						db.close();
						callback(null, result);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Display all admin users
	var displayAllAdminUsers = function (callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.adminDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.adminDBName + 'Collection');
				collection.find().toArray(function (e, users) {
					if (e) {
						writeLog(sessionID, 'error', 'Error happened when looking up all admin users' + e);
						db.close();
						callback('Error happened when looking up all admin users' + e, null);
					}else if (!users[0]) {
						writeLog(sessionID, 'error', 'There is no admim user found!');
						db.close();
						callback('There is no admin user found!', null);
					}else {
						writeLog(sessionID, 'debug', 'There is at least one user found!');
						db.close();
						callback(null, users);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	// Remove a user by user ID.
	var removeUserByID = function (id, callback) {
		dbConnection(dbConfig.host, dbConfig.port, dbConfig.adminDBName, function (err, db) {
			if (!err) {
				var collection = db.collection(dbConfig.adminDBName + 'Collection');
				collection.removeOne({
					_id: new ObjectID(id)
				}, {
					w: 1
				}, function (e, result) {
					if (e) {
						writeLog(sessionID, 'error',
							'Error happened when removing a user in DB by ID:' + id + '. error:' + e);
						db.close();
						callback('Error happened when removing a user in DB by ID:' + id + '. error:' + e, null);
					} else {
						writeLog(sessionID, 'debug', 'A user has been removed in DB by ID:' + id);
						db.close();
						callback(null, result);
					}
				});
			} else {
				callback(err, null);
			}
		});
	};

	return {
		insertDB: insertDB,
		findUserByID: findUserByID,
		findUsersByUsername: findUsersByUsername,
		findTokensByEmail: findTokensByEmail,
		updateTokenByID: updateTokenByID,
		removeTokenByID: removeTokenByID,
		updateUserByID: updateUserByID,
		displayAllAdminUsers: displayAllAdminUsers,
		removeUserByID: removeUserByID
	};
};