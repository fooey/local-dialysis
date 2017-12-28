'use strict';

const _ = require('lodash');
const async = require('async');


const facilitiesSvc = require(GLOBAL.paths.getService('facilities/core'));
const browse = require(GLOBAL.paths.getRoute('browse/core'));


module.exports = function(req, res) {
	async.auto({
		'state': browse.getState.bind(null, req.params.stateSlug),
		'city': ['state', function(callback, results) {
			browse.getCity(results.state, req.params.citySlug, callback);
		}],
		'facilities': ['state', 'city', getFacilities.bind(null, req)],
	}, function(err, results) {
		if (err && err.code && err.msg) {
			res.status(err.code);
			res.render('_error', {
				code: err.code,
				msg: err.msg,
			});
		}
		else {
			var place = results.city;
			var facilities = results.facilities;

			place.type = 'city';

			browse.render(req, res, place, facilities, results.state, results.city);
		}
	});
};


function getFacilities(req, callback, results) {
	// console.log('browse::city::getFacilities()', results);
	var browseFilters = browse.getFilters(req.query);

	var state = results.state;
	var city = results.city;

	var dataFilters = {
		stateSlug: state.slug,
		citySlug: city.slug,
		// performanceScore: 80,
	}

	var activeFilters = _.find(browseFilters, {isActive: true}, 'col');

	_.each(activeFilters, function(filter) {
		var val = (filter.val === 'yes') ? 1 : 0;
		dataFilters[filter.col] = val;
	});


	// console.log('dataFilters', dataFilters);

	facilitiesSvc.get(dataFilters, function(err, facilities) {
		callback(null, facilities);
	});
}