'use strict';

const _ = require('lodash');
const async = require('async');

var toExport = module.exports = {}
	
toExport.getBySlug = function(stateSlug, callback) {
	const geoAgg = require(GLOBAL.paths.getData('medicare/agg/geo.json'));

	async.detect(
		Object.keys(geoAgg.states),
		function(stateKey, fn) {
			fn(geoAgg.states[stateKey].slug === stateSlug);
		},
		function(result) {
			callback(null, geoAgg.states[result]);
		}
	);
};

