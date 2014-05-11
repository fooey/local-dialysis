'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const async = require('async');
const request = require('request');


const myUtil = require(GLOBAL.paths.getLib('util'));



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


toExport.getViewUrl = function(viewId) {
	return 'http://data.medicare.gov/api/views/' + viewId;
};

toExport.getCsvUrl = function(viewId) {
	return toExport.getViewUrl(viewId) + '/rows.csv';
};

toExport.getJsonUrl = function(viewId) {
	return toExport.getViewUrl(viewId) + '/rows.json';
};


toExport.downloadJson = function(viewId, localPath, onDone) {
	const remoteUrl = toExport.getJsonUrl(viewId);

	__writeFromRemote(remoteUrl, localPath, onDone);
}


toExport.transformJson = function(tmpPath, jsonPath, callback) {
	async.auto({
		'load': __transformLoad.bind(null, tmpPath),
		'parse': ['load', __transformParse],
		'transform': ['parse', __transformJson],
		'write': ['transform', __transformWrite.bind(null, jsonPath)],
	}, function(err, results) {
		if (err) console.log('err!', err);
		callback();
	});
}



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
	request.get(remoteUrl)
		.pipe(fs.createWriteStream(localPath))
		.on('finish', function() {
			onGet(null, localPath);
		});
}



function __transformLoad(tmpPath, callback) {
	fs.readFile(tmpPath, 'utf-8', callback);
}

function __transformParse(callback, results) {
	callback(null, JSON.parse(results.load));
}

function __transformJson(callback, results) {
	let jsonData = [];

	_.forEach(results.parse.data, function(row, rowIndex) {
		let record = {};

		_.forEach(results.parse.data[rowIndex], function(columnData, colIndex) {
			var field = results.parse.meta.view.columns[colIndex];
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

	callback(null, jsonData);
}

function __transformWrite(jsonPath, callback, results) {
	fs.writeFile(jsonPath, JSON.stringify(results.transform, null, '\t'), function() {
		callback(null, jsonPath);
	});
}