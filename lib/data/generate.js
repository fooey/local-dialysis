'use strict';

/*
*
*	Export
*
*/

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const async = require('async');
const mkdirp = require('mkdirp');
const mv = require('mv');
const uuid = require('node-uuid');

const medicare = require(GLOBAL.paths.getLib('data/medicare'));

const dataConfigSrc = GLOBAL.paths.getData('config.json');


module.exports = function(callback) {
	if (require.cache.hasOwnProperty(dataConfigSrc)) {
		delete require.cache[dataConfigSrc];
	}
	var dataConfig = require(dataConfigSrc);


	async.auto({
		'transformData': transformData.bind(null, dataConfig),


		'ensureDirectories': ensureDirectories,

		'breakout': ['transformData', 'ensureDirectories', breakoutData],
		'topCities': ['breakout', buildTopCities],

		'writeGeoAgg': ['breakout', function(callback, results) {
			writeJson(
				GLOBAL.paths.getData('/medicare/agg/geo.json'),
				results.breakout.geoAgg,
				callback
			);
		}],

		'writeZip': ['breakout', function(callback, results) {
			writeJson(
				GLOBAL.paths.getData('/medicare/agg/zip.json'),
				results.breakout.zipAgg,
				callback
			);
		}],

		'writeTopCities': ['topCities', function(callback, results) {
			writeJson(
				GLOBAL.paths.getData('/medicare/agg/topCities.json'),
				results.topCities,
				callback
			);
		}],

	}, function() {
		callback();
	});
};







function writeJson(path, data, callback) {
	// console.log('writeJson()');

	fs.writeFile(path, JSON.stringify(data, null, '\t'), function(err) {
		if (err) console.log(err);
		console.log('writeFile()', path);

		callback(err);
	});
}



function transformData(dataConfig, callback, results) {
	async.each(
		Object.keys(dataConfig.views),
		function(viewId, nextView) {

			var tmpPath = GLOBAL.paths.getData('medicare/' + viewId + '.tmp.json');
			var jsonPath = GLOBAL.paths.getData('medicare/' + viewId + '.json');

			medicare.transformJson(
				tmpPath,
				jsonPath,
				function() {
					console.log('transform complete', viewId);
					nextView();
				}
			);
		},
		callback
	);
}



function ensureDirectories(callback) {
	console.log('ensureDirectories()');

	async.series([
		mkdirp.bind(null, GLOBAL.paths.getData('medicare/agg')),
		mkdirp.bind(null, GLOBAL.paths.getData('medicare/facilities')),
		// mkdirp.bind(null, GLOBAL.paths.getData('production')),
	], callback);
}


function getSlug(str) {
	str = str.toLowerCase();
	str = str.replace(/[^\w\-]{1,}/g, ' ');
	str = str.trim();
	str = str.replace(/\s{1,}/g, '-');

	return str;	
}





function breakoutData(callback) {
	const states = require(GLOBAL.paths.getData('states.json'));

	console.log('breakoutData()');

	const facilitiesPath = GLOBAL.paths.getData('/medicare/facilities');
	const jsonPath = GLOBAL.paths.getData('/medicare/23ew-n7w9.json');

	var aggTemplate = {
		providers: [],
		count: 0,
		stations: 0,
		chain: 0,
		profit: 0,
		nonprofit: 0,
		lateShift: 0,
		hemodialysis: 0,
		peritoneal: 0,
		training: 0,
	};
	var aggTemplateState = _.cloneDeep(aggTemplate);
	aggTemplateState.cities = {};
	aggTemplateState.counties = {};


	var geoAgg = _.cloneDeep(aggTemplate);
	geoAgg.states = {};
	delete geoAgg.providers;

	var zipAgg = {};



	fs.readFile(jsonPath, function(err, data) {
		if (err) throw err;
		var jsonData = JSON.parse(data);

		fs.mkdir(facilitiesPath, function() {

			async.eachLimit(
				jsonData,
				128,
				function(data, callback) {

					if (!zipAgg.hasOwnProperty(data.zip)) {
						zipAgg[data.zip] = _.cloneDeep(aggTemplate);
						zipAgg[data.zip].zip = data.zip;
					}
					if (!geoAgg.states.hasOwnProperty(data.state)) {
						geoAgg.states[data.state] = _.cloneDeep(aggTemplateState);
						geoAgg.states[data.state].abbr = data.state;
						geoAgg.states[data.state].name = states[data.state].name;
						geoAgg.states[data.state].slug = states[data.state].slug;
					}
					if (!geoAgg.states[data.state].cities.hasOwnProperty(data.city)) {

						geoAgg.states[data.state].cities[data.city] = _.cloneDeep(aggTemplate);
						geoAgg.states[data.state].cities[data.city].name = data.city;
						geoAgg.states[data.state].cities[data.city].slug = getSlug(data.city);
					}
					if (!geoAgg.states[data.state].counties.hasOwnProperty(data.county)) {
						geoAgg.states[data.state].counties[data.county] = _.cloneDeep(aggTemplate);
						geoAgg.states[data.state].counties[data.county].name = data.county;
						geoAgg.states[data.state].counties[data.county].slug = getSlug(data.county);
					}
					

					geoAgg.states[data.state].providers.push(data.provider_number);
					geoAgg.states[data.state].cities[data.city].providers.push(data.provider_number);
					geoAgg.states[data.state].counties[data.county].providers.push(data.provider_number);
					zipAgg[data.zip].providers.push(data.provider_number);


					geoAgg.count++;
					geoAgg.states[data.state].count++;
					geoAgg.states[data.state].cities[data.city].count++;
					geoAgg.states[data.state].counties[data.county].count++;
					zipAgg[data.zip].count++;


					let toAgg = {
						stations: parseInt(data._of_dialysis_stations),
						chain: (data.chain_owned) ? 1 : 0,
						profit: (data.profit_or_non_profit_ === 'Profit') ? 1 : 0,
						nonprofit: (data.profit_or_non_profit_ === 'Non-Profit') ? 1 : 0,
						lateShift: (data.late_shift_) ? 1 : 0,
						hemodialysis: (data.offers_in_center_hemodialysis) ? 1 : 0,
						peritoneal: (data.offers_in_center_peritoneal_dialysis) ? 1 : 0,
						training: (data.offers_home_hemodialysis_training) ? 1 : 0,
					};

					_.forEach(toAgg, function(val, key) {
						geoAgg[key] += val;
						geoAgg.states[data.state][key] += val;
						geoAgg.states[data.state].cities[data.city][key] += val;
						geoAgg.states[data.state].counties[data.county][key] += val;
						zipAgg[data.zip][key] += val;
					});

					let facilityPath = path.join(facilitiesPath, data.provider_number + '.json');

					data.slug = getSlug(data.facility_name);

					fs.writeFile(facilityPath, JSON.stringify(data, null, '\t'), function(err) {
						if (err) console.log(err);
						callback();
					});
				},
				function(err) {
					if (err) console.log(err);

					callback(null, {
						geoAgg: geoAgg,
						zipAgg: zipAgg
					});
				}
			);




		});
	});
}



function buildTopCities(callback, results) {
	console.log('buildTopCities()');
	
	var topCities = [];

	var states = results.breakout.geoAgg.states;

	async.each(
		Object.keys(states),
		function(stateCode, nextState) {

			async.each(
				Object.keys(states[stateCode].cities),
				function(cityName, nextCity) {

					topCities.push({
						count: states[stateCode].cities[cityName].count,
						state: stateCode,
						city: cityName,
						citySlug: states[stateCode].cities[cityName].slug,
					});

					nextCity();
				},
				nextState
			);
		},
		function() {
			topCities.sort(function(a, b) {
				return b.count - a.count;
			});

			topCities.splice(100, topCities.length);

			callback(null, topCities);
		}
	);
}
