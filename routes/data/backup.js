'use strict';

const fs = require('fs');
const path = require('path');

const async = require('async');
const _ = require('lodash');


const dataMedicare = global.paths.requireLib('data-medicare');
const configSrc = global.paths.getData('config.json');
const dataPath = global.paths.getData('');


module.exports = function(req, res, next) {
	console.log('data/get.js', arguments);


	// var meta = [];

	// var aggTemplate = {
	// 	providers: [],
	// 	count: 0,
	// 	stations: 0,
	// 	chain: 0,
	// 	profit: 0,
	// 	nonprofit: 0,
	// 	lateShift: 0,
	// 	hemodialysis: 0,
	// 	peritoneal: 0,
	// 	training: 0,
	// };
	// var aggTemplateState = _.cloneDeep(aggTemplate);
	// aggTemplateState.cities = {};
	// aggTemplateState.counties = {};


	// var geoAgg = _.cloneDeep(aggTemplate);
	// geoAgg.states = {};
	// delete geoAgg.providers;

	// var zipAgg = {};


	// async.each(
	// 	Object.keys(config.views),
	// 	updateToLatest,
	// 	function() {
	// 		updateConfigFile();

	// 		breakoutFacilityRecords();
	// 	}
	// );


	// function breakoutFacilityRecords() {
	// 	console.log('breakoutFacilityRecords()');

	// 	const incomingPath = path.join(dataPath, 'incoming');
	// 	const facilitiesPath = path.join(incomingPath, 'facilities');

	// 	const jsonPath = path.join(incomingPath, '23ew-n7w9' + '.json');

	// 	const geoAggPath = path.join(incomingPath, 'agg', 'geo.json');
	// 	const zipAggPath = path.join(incomingPath, 'agg', 'zip.json');



	// 	fs.readFile(jsonPath, function(err, data) {
	// 		if (err) throw err;
	// 		var jsonData = JSON.parse(data);

	// 		fs.mkdir(facilitiesPath, function() {

	// 			async.eachLimit(
	// 				jsonData,
	// 				128,
	// 				function(data, callback) {
	// 					data.citySlug = data.city.toLowerCase();
	// 					data.citySlug = data.citySlug.replace(/[^a-z\-]{1,}/g, '-');
	// 					data.citySlug = data.citySlug.replace(/-{2,}/g, '-');



	// 					if (!zipAgg.hasOwnProperty(data.zip)) {
	// 						zipAgg[data.zip] = _.cloneDeep(aggTemplate);
	// 						zipAgg[data.zip].zip = data.zip;
	// 					}
	// 					if (!geoAgg.states.hasOwnProperty(data.state)) {
	// 						geoAgg.states[data.state] = _.cloneDeep(aggTemplateState);
	// 						geoAgg.states[data.state].abbr = data.state;
	// 					}
	// 					if (!geoAgg.states[data.state].cities.hasOwnProperty(data.city)) {
	// 						geoAgg.states[data.state].cities[data.city] = _.cloneDeep(aggTemplate);
	// 						geoAgg.states[data.state].cities[data.city].name = data.city;
	// 						geoAgg.states[data.state].cities[data.city].slug = data.citySlug;
	// 					}
	// 					if (!geoAgg.states[data.state].counties.hasOwnProperty(data.county)) {
	// 						geoAgg.states[data.state].counties[data.county] = _.cloneDeep(aggTemplate);
	// 						geoAgg.states[data.state].counties[data.county].name = data.county;
	// 					}

	// 					geoAgg.states[data.state].providers.push(data.provider_number);
	// 					geoAgg.states[data.state].cities[data.city].providers.push(data.provider_number);
	// 					geoAgg.states[data.state].counties[data.county].providers.push(data.provider_number);
	// 					zipAgg[data.zip].providers.push(data.provider_number);


	// 					geoAgg.count++;
	// 					geoAgg.states[data.state].count++;
	// 					geoAgg.states[data.state].cities[data.city].count++;
	// 					geoAgg.states[data.state].counties[data.county].count++;
	// 					zipAgg[data.zip].count++;


	// 					let toAgg = {
	// 						stations: parseInt(data._of_dialysis_stations),
	// 						chain: (data.chain_owned) ? 1 : 0,
	// 						profit: (data.profit_or_non_profit_ === 'Profit') ? 1 : 0,
	// 						nonprofit: (data.profit_or_non_profit_ === 'Non-Profit') ? 1 : 0,
	// 						lateShift: (data.late_shift_) ? 1 : 0,
	// 						hemodialysis: (data.offers_in_center_hemodialysis) ? 1 : 0,
	// 						peritoneal: (data.offers_in_center_peritoneal_dialysis) ? 1 : 0,
	// 						training: (data.offers_home_hemodialysis_training) ? 1 : 0,
	// 					};

	// 					_.forEach(toAgg, function(val, key) {
	// 						geoAgg[key] += val;
	// 						geoAgg.states[data.state][key] += val;
	// 						geoAgg.states[data.state].cities[data.city][key] += val;
	// 						geoAgg.states[data.state].counties[data.county][key] += val;
	// 						zipAgg[data.zip][key] += val;
	// 					});


	// 					let facilityPath = path.join(facilitiesPath, data.provider_number + '.json');
	// 					fs.writeFile(facilityPath, JSON.stringify(data, null, '\t'), function(err) {
	// 						if (err) console.log(err);
	// 						callback();
	// 					});
	// 				},
	// 				function(err) {
	// 					if (err) console.log(err);


	// 					async.parallel([
	// 						buildTopCities.bind(null, incomingPath),

	// 						function(callback) {
	// 							fs.writeFile(zipAggPath, JSON.stringify(zipAgg, null, '\t'), function(err) {
	// 								if (err) throw err;
	// 								console.log('It\'s saved!', zipAggPath);
	// 								callback();
	// 							});
	// 						},
	// 						function(callback) {
	// 							fs.writeFile(geoAggPath, JSON.stringify(geoAgg, null, '\t'), function(err) {
	// 								if (err) throw err;
	// 								console.log('It\'s saved!', geoAggPath);
	// 								callback();
	// 							});
	// 						},

	// 					], function(err) {
	// 						if (err) console.log(err);

	// 						res.json(geoAgg.states['UT']);

	// 						console.log('breakoutFacilityRecords() complete');


	// 					});
	// 				}
	// 			);




	// 		});
	// 	});

	// }




	// function updateToLatest(viewId, callback) {
	// 	var view = config.views[viewId];

	// 	dataMedicare.getView(viewId, function(err, data) {
	// 		var jsonData = JSON.parse(data);

	// 		if (!view.rowsUpdatedAt || view.rowsUpdatedAt < jsonData.rowsUpdatedAt) {
	// 			console.log(viewId, 'needs updating');

	// 			var incomingDataPath = path.join(dataPath, 'incoming');

	// 			dataMedicare.getData(viewId, incomingDataPath, function(err, localPath) {
	// 				console.log(viewId, 'updated', localPath);

	// 				callback();
	// 			});

	// 		}
	// 		else {
	// 			callback();
	// 		}
	// 		meta.push(jsonData);
	// 	});
	// }




	// function updateConfigFile() {
	// 	fs.writeFile(
	// 		configSrc,
	// 		JSON.stringify(config, null, '\t'),
	// 		function(err) {
	// 			// res.end(JSON.stringify(config));

	// 			// res.json(meta);
	// 			// res.json(geoAgg);
	// 		}
	// 	);


	// 	delete require.cache[configSrc];
	// }



	// function buildTopCities(incomingPath, callback) {
	// 	const topCitiesPath = path.join(incomingPath, '/agg/', 'topCities.json');
	// 	var topCities = [];

	// 	async.each(
	// 		Object.keys(geoAgg.states),
	// 		function(stateCode, nextState) {

	// 			async.each(
	// 				Object.keys(geoAgg.states[stateCode].cities),
	// 				function(cityName, nextCity) {

	// 					topCities.push({
	// 						count: geoAgg.states[stateCode].cities[cityName].count,
	// 						state: stateCode,
	// 						city: cityName,
	// 						citySlug: geoAgg.states[stateCode].cities[cityName].slug,
	// 					});

	// 					nextCity();
	// 				},
	// 				nextState
	// 			);
	// 		},
	// 		function() {
	// 			topCities.sort(function(a, b) {
	// 				return b.count - a.count;
	// 			});

	// 			topCities.splice(100, topCities.length);

	// 			fs.writeFile(topCitiesPath, JSON.stringify(topCities, null, '\t'), function(err) {
	// 				if (err) throw err;
	// 				console.log('It\'s saved!', topCitiesPath);
	// 				callback();
	// 			});
	// 		}
	// 	);
	// }

};

