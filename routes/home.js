'use strict';

const _ = require('lodash');
const async = require('async');
const numeral = require('numeral');



const nationSvc = require(GLOBAL.paths.getService('geo/nation'));
const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const citiesSvc = require(GLOBAL.paths.getService('geo/cities'));

const thresholdDefault = 12;


module.exports = function(req, res, next) {
	var threshold = _.parseInt(req.query.threshold) || thresholdDefault;

	async.auto({

		nation: nationSvc.getTotals,
		states: statesSvc.getTotals,
		cities: citiesSvc.getTotals.bind(null, {threshold: threshold}),
		stateCities: ['states', 'cities', attachCities],

	}, function renderView(err, results) {
		var numStates = results.states.length;
		var numCities = results.cities.length;
		var numPlaces = numStates + numCities;

		var numCols = 4;
		var itemsPerCol = Math.ceil(numPlaces / numCols);

		var placesCount = 0;
		results.stateCities = results.stateCities.map(function(state) {
			state.column = Math.floor(placesCount / itemsPerCol);
			placesCount += (1 + state.cities.length);
			return state;
		});

		var place = results.nation;
		place.type = 'nation';


		res.render('home', {
			metaTitle: 'Local Dialysis Providers',
			metaDescription: 'We can help you find and compare the ' + numeral(results.nation.numFacilities).format('0,0') + ' Medicare certified dialysis facilties near you',

			numCols: numCols,
			numStates: numStates,
			numCities: numCities,
			numPlaces: numPlaces,

			place: place,
			nation: results.nation,
			states: results.stateCities,

			threshold: threshold,
			thresholdDefault: thresholdDefault,

			numeral: numeral,
			_: _,
		});
	});
};


function attachCities(fnCallback, data) {
	console.log('num cities', data.cities.length);

	async.each(
		data.states,
		function(state, nextState) {
			async.filter(
				data.cities,
				function(city, fnFilter) {
					fnFilter(city.state.code === state.code);
				},
				function(filterResults) {
					state.cities = filterResults;
					nextState();
				}
			);
		},
		function(err) {
			fnCallback(err, data.states);
		}
	);
	// console.log('attachCities', results.states.length, results.topCities.length);
}




/*
module.exports = function(req, res, next) {

	const geoAgg = require(GLOBAL.paths.getData('medicare/agg/geo.json'));
	var topCities = require(GLOBAL.paths.getData('medicare/agg/topCities.json'));

	const metaNational = {
		count: geoAgg.count,
		stations: geoAgg.stations,
		chain: geoAgg.chain,
		profit: geoAgg.profit,
		nonprofit: geoAgg.nonprofit,
		lateShift: geoAgg.lateShift,
		hemodialysis: geoAgg.hemodialysis,
		peritoneal: geoAgg.peritoneal,
		training: geoAgg.training,
	};

	topCities = _.filter(topCities, function(city) {return city.count >= 10});
	// topCities = _.sortBy(topCities, 'name');



	var numStates = Object.keys(geoAgg.states).length;
	var numCities = topCities.length;
	var numItems = numStates + numCities;

	var numCols = 4;
	var itemsPerCol = Math.ceil(numItems / numCols);

	console.log('numStates', numStates);
	console.log('numCities', numCities);
	console.log('itemsPerCol', itemsPerCol);


	var geoFacilties = [];

	var runningTotal = 0;

	_.forEach(geoAgg.states, function(geoState) {
		// var colNumber = Math.floor(runningTotal / itemsPerCol);

		// // runningTotal++;
		// runningTotal += (stateTopCities.length + 1);

		var cities = _.sortBy(_.filter(topCities, {state: geoState.abbr}), 'name');


		geoFacilties.push({
			name: geoState.name,
			abbr: geoState.abbr,
			slug: geoState.slug,
			column: 0,
			cities: cities,
		});
	});

	geoFacilties = _.sortBy(geoFacilties, 'name');

	var placesCount = 0;
	geoFacilties = geoFacilties.map(function(facility) {
		facility.column = Math.floor(placesCount / itemsPerCol);

		placesCount += (facility.cities.length + 1);
		return facility;
	});





	res.render('home', {
		metaTitle: 'Local Dialysis Providers',
		metaDescription: 'We can help you find and compare the ' + numeral(metaNational.count).format('0,0') + ' Medicare certified dialysis facilties near you',

		numCols: numCols,
		metaNational: metaNational,
		geoFacilties: geoFacilties,


		numeral: numeral,
		_: _,
	});
};

*/