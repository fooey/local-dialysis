'use strict';



/*
*
*	Dependencies
*
*/

const util = require('util');

const async = require('async');


const nationSvc = require(global.paths.getService('geo/nation'));
const stateSvc = require(global.paths.getService('geo/states'));
const citySvc = require(global.paths.getService('geo/cities'));
const statsCore = require(global.paths.getRoute('stats/core'));


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

		if (!results.state || !results.city) {
			var httpErr = {code: 404, msg: 'Not Found'};

			res.status(httpErr.code);
			res.render('_error', {
				msg: httpErr.msg,
			});

		}
		else {
			var place = results.city;
			place.type = 'city';

			var places = {
				'nation': results.nation,
				'state': results.state,
				'city': results.city,
			}

			statsCore.render(req, res, place, places);
		}

	});
};
