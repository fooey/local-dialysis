'use strict';

const _ = require('lodash');
const async = require('async');


const facilitiesSvc = require(GLOBAL.paths.getService('facilities/core'));
const browse = require(GLOBAL.paths.getRoute('browse/core'));


module.exports = function(req, res) {
	async.auto({
		'state': browse.getState.bind(null, req.params.stateSlug),
		'facilities': ['state', getFacilities.bind(null, req)],
	}, function(err, results) {
		if (err && err.code && err.msg) {
			res.status(err.code);
			res.render('_error', {
				code: err.code,
				msg: err.msg,
			});
		}
		else {
			var place = results.state;
			var facilities = results.facilities;

			place.type = 'state';

			browse.render(req, res, place, facilities, results.state);
		}
	});
};


function getFacilities(req, callback, results) {
	var stateSlug = results.state.slug;

	var browseFilters = browse.getFilters(req.query);

	var dataFilters = {
		stateSlug: stateSlug,
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