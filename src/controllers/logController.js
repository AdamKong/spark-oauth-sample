var log4js = require('log4js');

var config = {
	appenders: [{
		category: 'logger',
		type: 'dateFile',
		filename: './logs/log.txt',
		pattern: '-yyyy-MM-dd-hh',
		alwaysIncludePattern: true,
		layout: {
			type: 'pattern',
			pattern: '%d{ISO8601_WITH_TZ_OFFSET} %h %p %m'
		}
	}]
};

log4js.configure(config);

module.exports = function (logLevel) {

	var logger = log4js.getLogger('logger');

	var levelArray = ['trace','debug','info','warn','error','fatal'];

	var levelFlag = false;

	// This is to verify is the logLevel in config.json is set correctly.
	// If not, default it to "debug".
	for (var i = 0; i < levelArray.length; i++) {
		if (logLevel === levelArray[i]) {
			logger.setLevel(logLevel);
			levelFlag = true;
			break;
		}
	}

	if (!levelFlag) {
		logger.setLevel('debug');
		console.log('logLevel in conf/config.json is not set correctly!');
	}

	var writeLog = function (sessionID, level, logContent) {

			switch (level) {
			case 'trace':
				logger.trace(sessionID + ': ' + logContent);
				break;
			case 'debug':
				logger.debug(sessionID + ': ' + logContent);
				break;
			case 'info':
				logger.info(' ' + sessionID + ': ' + logContent);
				break;
			case 'warn':
				logger.warn(' ' + sessionID + ': ' + logContent);
				break;
			case 'error':
				logger.error(sessionID + ': ' + logContent);
				break;
			case 'fatal':
				logger.fatal(sessionID + ': ' + logContent);
				break;
			default:
				logger.error(sessionID + ': ' + 'log level is not correctly set!');
			}
	};

	return writeLog;
};

