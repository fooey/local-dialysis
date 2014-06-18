'use strict';



/*
*
*	Dependencies
*
*/

const util = require('util');

const async = require('async');


const nationSvc = require(GLOBAL.paths.getService('geo/nation'));
const stateSvc = require(GLOBAL.paths.getService('geo/states'));
const citySvc = require(GLOBAL.paths.getService('geo/cities'));
const statsCore = require(GLOBAL.paths.getRoute('stats/core'));


/*
*
*	DEFAULT EXPORT
*
*/

module.exports = function(req, res) {
	async.auto({
		nation: [nationSvc.getStats],
		state: [stateSvc.getStatsBySlug.bind(null, req.params.stateSlug)],
		city: ['state', function(callback, results) {
			citySvc.getStatsBySlug(results.state, req.params.citySlug, callback);
		}],

	}, function(err, results) {

		var place = results.city;
		place.type = 'city';


		var places = {
			'nation': results.nation,
			'state': results.state,
			'city': results.city,
		}

		statsCore.render(req, res, place, places);
	});
};
