
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


if (process.env.NODE_ENV === 'development') {
	startServer();
}
else {
	const async = require('async');
	const dataGetter = require(GLOBAL.paths.getLib('data/get'));
	const dataGenerator = require(GLOBAL.paths.getLib('data/generate'));

	async.series([
		function(callback) {
			console.log('INIT DATA: Retrieving');
			dataGetter(function() {
				console.log('INIT DATA: Retrieval Complete');
				callback();
			});
		},
		function(callback) {
			console.log('INIT DATA: Generating');
			dataGenerator(function() {
				console.log('INIT DATA: Generation Complete');
				callback();
			});
		},
	], startServer);
}



function startServer() {
	console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
	app.listen(app.get('port'), function() {
		console.log(Date.now(), 'Express server listening on port ' + app.get('port') + ' in mode: ' + process.env.NODE_ENV);
		// console.log(Date.now(), 'ENVIRONMENT:', process.env);
	});

}

