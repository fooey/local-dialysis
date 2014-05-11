
/*
*
*	GLOBAL path helpers
*
*/

GLOBAL.paths = require('./config/paths');



/*
*
* Express
*
*/

const express = require('express');
const app = express();



/*
*
* Configuration
*
*/

require(GLOBAL.paths.getConfig('express'))(app, express);



/*
*
* Routes
*
*/

require(GLOBAL.paths.getRoute())(app, express);



/*
*
* Start Server
*
*/

const async = require('async');

async.series([
	function(callback) {
		console.log('call /data/get');
		if (process.env.NODE_ENV !== 'development') {
			require(GLOBAL.paths.getRoute('data/get'))(null, null, callback);
		}
		else {
			callback()
		}
	},
	function(callback) {
		console.log('call /data/generate');
		if (process.env.NODE_ENV !== 'development') {
			require(GLOBAL.paths.getRoute('data/generate'))(null, null, callback);
		}
		else {
			callback()
		}
	},
], function(err) {
	console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
	app.listen(app.get('port'), function() {
		console.log(Date.now(), 'Express server listening on port ' + app.get('port'));
	});
});


