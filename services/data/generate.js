"use strict";

/*
*
*	Export
*
*/

const fs = require('fs');
const path = require('path');
const util = require('util');

const _ = require('lodash');
const async = require('async');
const mkdirp = require('mkdirp');
// const mv = require('mv');
// const uuid = require('node-uuid');

// const facilitySVc = require(GLOBAL.paths.getService('facilities/core'));

const medicareData = require(GLOBAL.paths.getService('data/medicare'));
const referenceData = require(GLOBAL.paths.getService('data/reference'));
const facilityData = require(GLOBAL.paths.getService('data/facilities'));

const fsSvc = require(GLOBAL.paths.getService('fs'));

const dataConfigSrc = GLOBAL.paths.getData('config.json');


var db = GLOBAL.DATABASE;






module.exports = function(fnCallback) {
	console.log('generate::main()');

	if (require.cache.hasOwnProperty(dataConfigSrc)) {
		delete require.cache[dataConfigSrc];
	}
	var dataConfig = require(dataConfigSrc);


	async.auto({
		// FIXME
		'transformData': [transformData],
		'mergeData': ['transformData', mergeData],

		'reference': [referenceData.init],
		'facilities': ['reference', facilityData.init],

	}, function(err, results) {
		console.log(err, results);

		db.exec('VACUUM', fnCallback);
	});
};



function transformData(callback, results) {
	console.log('transformData()');

	async.each(
		['23ew-n7w9', 'qg5v-bgia'],
		function(viewId, nextView) {

			var tmpPath = GLOBAL.paths.getData('medicare/' + viewId + '.tmp.json');
			var jsonPath = GLOBAL.paths.getData('medicare/' + viewId + '.json');

			medicareData.transformJson(
				tmpPath,
				jsonPath,
				function() {
					nextView();
				}
			);
		},
		callback
	);
}



function mergeData(callback, results) {
	console.log('mergeData()');
	var mergedData = {};

	var facilities = require(GLOBAL.paths.getData('medicare/23ew-n7w9.json'));
	var scores = require(GLOBAL.paths.getData('medicare/qg5v-bgia.json'));

	async.auto({
		'mergeFacilities': function(cbFacilities) {
			async.each(
				facilities,
				function(data, fn) {
					mergedData[data.provider_number] = data;
					fn();
				},
				cbFacilities
			);
		},
		'mergeScores': ['mergeFacilities', function(cbFacilities) {
			async.each(
				scores,
				function(data, fn) {
					if (mergedData[data.cmscertificationnumber]) {
						var provider_number = mergedData[data.cmscertificationnumber].provider_number;
						delete data.address1;
						delete data.address2;
						delete data.zip_code;
						delete data.cmscertificationnumber;
						mergedData[provider_number] = _.merge(mergedData[provider_number], data);
					}
						
					fn();
				},
				cbFacilities
			);
		}],

	}, function(err, results) {

		fsSvc.writeJson(GLOBAL.paths.getData('medicare/merged.json'), mergedData, callback);

	});
}