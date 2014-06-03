'use strict';

const _ = require('lodash');
const async = require('async');


const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const facilitiesSvc = require(GLOBAL.paths.getService('facilities/core'));

const browseCore = require(GLOBAL.paths.getRoute('browse/core'));


module.exports = function(req, res) {
	async.auto({
		'state': getState.bind(null, req.params.stateSlug),
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

			browseCore.render(req, res, place, facilities);
		}
	});
};




function getState(stateSlug, callback) {
	statesSvc.getBySlug(stateSlug, function(err, state) {
		var httpErr = null;
		if (!state) {
			httpErr = {code: 404, msg: 'Not Found'};
		}

		// console.log('getState()', state);

		callback(httpErr, state);
	});
}



function getFacilities(req, callback) {
	var stateSlug = req.params.stateSlug;
	var browseFilters = browseCore.getFilters(req.query);

	var dataFilters = {
		stateSlug: stateSlug,
		// performanceScore: 80,
	}

	var activeFilters = _.where(browseFilters, {isActive: true}, 'col');

	_.each(activeFilters, function(filter) {
		var val = (filter.val === 'yes') ? 1 : 0;
		dataFilters[filter.col] = val;
	});


	console.log('dataFilters', dataFilters);

	facilitiesSvc.get(dataFilters, function(err, facilities) {
		// var httpErr = null;
		// if (!facilities || facilities.length === 0) {
		// 	httpErr = {code: 404, msg: 'Not Found'};
		// }

		callback(null, facilities);
	});
}