var express = require('express');
var app = express();
var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var uuid = require('uuid');

var config = JSON.parse(fs.readFileSync(__dirname + '/conf/config.json'));
var port = config.server.port;
var host = config.server.host;

// Import logging functions
var writeLog = require('./src/controllers/logController.js')(config.logLevel);

// Import authentication function
var authRouter = require('./src/routes/authRouter')(config.oauth, writeLog);

// Import API operation functions
var actionsRouter = require('./src/routes/actionsRouter')(config.oauth.contactEmail, writeLog);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));
app.set('views', './src/views/');
app.set('view engine', 'ejs');

app.use(cookieParser('everything is awesome!'));
app.use(session({
	genid: function (req) {
		return uuid.v4();
	},
	secret: 'everything is awesome!',
	resave: false,
	saveUninitialized: false
}));

app.get('/', function (req, res) {
	// Define a session variable, for a) making sure the session IDs subsequentially
	// obtained from session are the same. b) avoid directly accessing the auth/spark router.
	req.session.mySessionID = req.sessionID;
	writeLog(req.sessionID, 'debug', 'Added a session variable "mySessionID"');
	res.render('index', {
		deleteRoom: ''
	});
});

// This is the OAuth Router
app.use('/auth', authRouter);
// This is for creating room, adding user in, sending message, deleting room.
app.use('/actions', actionsRouter);
app.listen(port, host, function (err) {
	if (err) {
		console.log('Server is failed to startup at ' + port + '@' + host + ':' + err);
	}else {
		console.log('Server is ready on ' + host + ':' + port);
	}
});