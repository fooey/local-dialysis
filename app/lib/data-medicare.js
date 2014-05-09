'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const async = require('async');
const request = require('request');



/*
*
*	Export
*
*/

var toExport = module.exports = {};



/*
*
*	Public Methods
*
*/
toExport.getView = function(viewId, onGet) {
	var remoteUrl = toExport.getViewUrl(viewId);
	__getFromRemote(remoteUrl, onGet);
};


toExport.getData = function(viewId, dataPath, onGet) {
	const jsonUrl = toExport.getJsonUrl(viewId);
	const jsonPathTmp = path.join(dataPath, viewId + '.tmp.json');
	const jsonPath = path.join(dataPath, viewId + '.json');

	const facilitiesPath = path.join(dataPath, '/facilities');

	async.auto({
		'mdData': __ensureDirectoryExists.bind(null, jsonPath),
		'mdFacilities': __ensureDirectoryExists.bind(null, facilitiesPath),

		'get': ['mdData', 'mdFacilities', __writeFromRemote.bind(null, jsonUrl, jsonPathTmp)],

		'transform': ['get', __transformJson.bind(null, jsonPathTmp, jsonPath, facilitiesPath)],
	}, function(err, results) {
		// console.log('getData()', arguments);
		onGet(err, jsonPath);
	});

};



toExport.getViewUrl = function(viewId) {
	return 'http://data.medicare.gov/api/views/' + viewId;
};

toExport.getCsvUrl = function(viewId) {
	return toExport.getViewUrl(viewId) + '/rows.csv';
};

toExport.getJsonUrl = function(viewId) {
	return toExport.getViewUrl(viewId) + '/rows.json';
};



/*
*
*	Private Methods
*
*/

function __getFromRemote(remoteUrl, onGet) {
	// console.log('__getFromRemote()', remoteUrl);
	request.get(remoteUrl, function(err, httpResponse, body) {
		onGet(null, body);
	});
}


function __writeFromRemote(remoteUrl, localPath, onGet) {
	// console.log('__writeFromRemote()', remoteUrl, localPath);
	// request.get(remoteUrl)
	// 	.pipe(fs.createWriteStream(localPath))
	// 	.on('finish', function() {
			// console.log('__writeFromRemote() finished', remoteUrl, localPath);
			onGet(null, localPath);
		// });
}


function __transformJson(tmpPath, jsonPath, facilitiesPath, callback) {
 	// console.log('__transformJson()', jsonPath);

	async.auto({
		'loadTmp': function(cb) {
			fs.readFile(tmpPath, 'utf-8', cb);
		},
		'tmpJson': ['loadTmp', function(cb, results) {
			cb(null, JSON.parse(results.loadTmp));
		}],

	}, function(err, results) {
		let jsonData = [];

		_.forEach(results.tmpJson.data, function(row, rowIndex) {
			let record = {};

			_.forEach(results.tmpJson.data[rowIndex], function(columnData, colIndex) {
				var field = results.tmpJson.meta.view.columns[colIndex];
				var fieldName = field.fieldName;

				// discard metadata
				if (fieldName.charAt(0) === ':') {
					return;
				}

				if (field.subColumnTypes && field.subColumnTypes.length) {
					let richColumn = {};
					_.forEach(field.subColumnTypes, function(subType, stIndex) {
						try {
							richColumn[subType] = JSON.parse(columnData[stIndex]);
						}
						catch (e) {
							richColumn[subType] = columnData[stIndex];
						}
					});
					record[fieldName] = richColumn;
				}
				else {
					record[fieldName] = columnData;
				}

				// console.log(index, fieldName, columnData);
			});

			jsonData.push(record);
		});



		fs.writeFile(jsonPath, JSON.stringify(jsonData, null, '\t'), function() {
			callback(null, jsonPath);
		});
	});
}


/*
*	Utility
*/

function __ensureDirectoryExists(localPath, callback) {
	var directoryPath = path.dirname(localPath);

	fs.mkdir(directoryPath, callback);
}
