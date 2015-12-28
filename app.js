var express = require('express');
var app = express();
var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var ejs = require('ejs');

// The config.json contains the basical configuration items (some would be confidential like 
// ClientID/Client Secret). If you want to install this program, you need to change them accordingly. 
// If you want to make the program public, please protect the config file well (like remove or 
// edit it before uploading).
 
var config = JSON.parse(fs.readFileSync(__dirname + '/conf/config.json'));
var port = config.port;
var host = config.host;

var authRouter = require('./src/routes/authRouter')(config);
var actionsRouter = require('./src/routes/actionsRouter');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));
app.set('views', './src/views/');
app.set('view engine', 'ejs');

app.use(cookieParser('everything is awesome!'));
app.use(session({
	secret: 'everything is awesome!',
	resave: false,
	saveUninitialized: false
}));

app.get('/', function (req, res) {
	res.render('index', {
		deleteRoom: ''
	});
});

// This is the OAuth Router
app.use('/auth', authRouter);

// This is the Router, for creating room, adding user in, and deleting room.
app.use('/actions', actionsRouter);

app.listen(port, host, function (err) {
	if (err) {
		console.log('Server is failed to startup at ' + port + '@' + host + ':' + err);
	}else {
		console.log('Server is ready on ' + host + ':' + port);
	}
});