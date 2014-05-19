'use strict';

const fs = require('fs');

const _ = require('lodash');
const numeral = require('numeral');


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

	topCities.sort(function(a, b) {
		return (a.city > b.city) ? 1 : -1;
	});


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

		var stateTopCities = _.filter(topCities, {state: geoState.abbr});
		var colNumber = Math.floor(runningTotal / itemsPerCol);

		// runningTotal++;
		runningTotal += (stateTopCities.length + 1);


		geoFacilties.push({
			name: geoState.name,
			abbr: geoState.abbr,
			slug: geoState.slug,
			column: colNumber,
			cities: stateTopCities
		});
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
