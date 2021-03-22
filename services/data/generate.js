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

// const facilitySVc = require(global.paths.getService('facilities/core'));

const medicareData = require(global.paths.getService('data/medicare'));
const referenceData = require(global.paths.getService('data/reference'));
const facilityData = require(global.paths.getService('data/facilities'));

const fsSvc = require(global.paths.getService('fs'));


var db = global.DATABASE;






module.exports = function(fnCallback) {
	console.log('data::generate::main()');


	async.auto({
		'transformData': [transformData],
		'mergeData': ['transformData', mergeData],

		// 'mergeData': function(callback) {callback();}, //FIXME

		'reference': ['mergeData', referenceData.init],
		'facilities': ['reference', facilityData.init],

	}, function(err, results) {
		if (err) console.log('!!ERROR!!', err);
		console.log('data::generate::main() complete');

		db.exec('VACUUM', fnCallback);
	});
};



function transformData(callback, results) {
	console.log('data::generate::transformData()');

	async.each(
		['23ew-n7w9', 'qg5v-bgia'],
		function(viewId, nextView) {

			var tmpPath = global.paths.getData('medicare/' + viewId + '.tmp.json');
			var jsonPath = global.paths.getData('medicare/' + viewId + '.json');

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
	console.log('data::generate::mergeData()');
	var mergedData = {};

	var facilitiesPath = require(global.paths.getData('medicare/23ew-n7w9.json'));
	var scoresPath = require(global.paths.getData('medicare/qg5v-bgia.json'));
	var mergedPath = global.paths.getData('medicare/merged.json');

	async.auto({
		'mergeFacilities': function(cbFacilities) {
			async.each(
				facilitiesPath,
				function(data, fn) {
					mergedData[data.provider_number] = data;
					fn();
				},
				cbFacilities
			);
		},
		'mergeScores': ['mergeFacilities', function(cbFacilities) {
			async.each(
				scoresPath,
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

		fsSvc.writeJson(mergedPath, mergedData, callback);

	});
}
