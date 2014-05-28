"use strict";

/*
*
*	Export
*
*/

var me = module.exports = {};



/*
*
*	Dependencies
*
*/

const fs = require('fs');



/*
*
*	Public Methods
*
*/


me.writeJson = function(path, data, callback) {
	// console.log('writeJson()');

	fs.writeFile(path, JSON.stringify(data, null, '\t'), function(err) {
		if (err) console.log(err);
		// console.log('writeFile()', path);

		callback(err);
	});
};
