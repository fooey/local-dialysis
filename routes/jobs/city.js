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
const jobsCore = require(global.paths.getRoute('jobs/core'));


/*
*
*	DEFAULT EXPORT
*
*/

module.exports = function(req, res) {
	async.auto({
		nation: [nationSvc.getTotals],
		state: [stateSvc.getBySlug.bind(null, req.params.stateSlug)],
		city: ['state', function(callback, results) {
			citySvc.getBySlug(results.state, req.params.citySlug, callback);
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

			jobsCore.render(req, res, place, places);
		}
	});
};
