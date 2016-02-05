// This function is to compare the values in form with the values in db when updating user profile.
// If no change, then it returns null, if there is change,
// it returns newProfile (including hashed password if passworded is changed).
var bcrypt = require('bcrypt');

module.exports = function (sessionID, newProfile, count, userInDB, writeLog, callback) {
	// When there is no password change in newProfile, the length of content is 2, otherwise it's 3.
	if (count === 2) {
		if ((newProfile.username === userInDB.username) && (newProfile.email === userInDB.email)) {
			writeLog(sessionID, 'fatal', 'You have not changed anything to the form. How did you get into here.');
			callback('You have not changed anything to the form.', false);
		} else {
			callback(null, newProfile);
		}
	} else {
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(newProfile.password, salt);
		newProfile.password = hash;
		if ((newProfile.username === userInDB.username) && (newProfile.email === userInDB.email) && (bcrypt.compareSync(newProfile.password, userInDB.password))) {
			writeLog(sessionID, 'fatal', 'You have not changed anything to the form.');
			callback('You have not changed anything to the form.', false);
		} else {
			callback(null, newProfile);
		}
	}
};