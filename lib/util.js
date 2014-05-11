"use strict";

const fs = require('fs');
const path = require('path');


var toExport = module.exports = {};


toExport.ensureDirectoryExists = function(localPath, callback) {
	const directoryPath = path.dirname(localPath);

	console.log('ensureDirectoryExists()', localPath, directoryPath);

	fs.exists(directoryPath, function(doesExist) {
		console.log('doesExist', doesExist);
		if (!doesExist) {
			fs.mkdir(directoryPath, function(err) {
				if (err) throw (err);

				callback(null);
			});
		}
		else {
			callback(null);
		}

	});
		

};
