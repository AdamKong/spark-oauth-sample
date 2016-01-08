module.exports = function (req, writeLog, location) {
	var theSessionID = req.sessionID;
	req.session.destroy(function (err) {
		if (err) {
			writeLog(theSessionID, 'fatal', 'In ' + location + '. Failed to destroy session: ' + err);
		} else {
			writeLog(theSessionID, 'fatal', 'In ' + location + '. Session has been destroyed.');
		}
	});
};