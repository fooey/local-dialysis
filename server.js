
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
console.log('App Environment', app.get('env'));

if (app.get('env') === 'development') {
	require('longjohn');

	// ['log', 'warn'].forEach(function(method) {
	// 	var old = console[method];
	// 	console[method] = function() {
	// 	var stack = (new Error()).stack.split(/\n/);
	// 	// Chrome includes a single "Error" line, FF doesn't.
	// 	if (stack[0].indexOf('Error') === 0) {
	// 		stack = stack.slice(1);
	// 	}
	// 	var args = [].slice.apply(arguments).concat(['\n', stack[1].trim(), '\n']);
	// 	return old.apply(console, args);
	// 	};
	// });
}




/*
*
* Data
*
*/

GLOBAL.DATA = {
	reference: {}
};

GLOBAL.DATABASE = require(GLOBAL.paths.getConfig('db'))(app.get('env'));



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

var generateDatabase = (process.env.NODE_ENV !== 'development');
// generateDatabase = false;


if (!generateDatabase) {
	const referenceData = require(GLOBAL.paths.getService('data/reference'));
	referenceData.setGlobals(startServer);
}
else {
	const async = require('async');
	const dataGetter = require(GLOBAL.paths.getService('data/get'));
	const dataGenerator = require(GLOBAL.paths.getService('data/generate'));

	async.series([
		function retrieveData(callback) {
			console.log('INIT DATA: Retrieving');
			dataGetter(function() {
				console.log('INIT DATA: Retrieval Complete');
				callback();
			});
		},
		function generateData(callback) {
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

