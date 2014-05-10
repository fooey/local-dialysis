"use strict";


var toExport = module.exports = {};


toExport.ensureDirectoryExists = function(localPath, callback) {
	var directoryPath = path.dirname(localPath);

	fs.mkdir(directoryPath, callback);
};
