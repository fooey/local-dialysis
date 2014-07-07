'use strict';



/*
*
*	Dependencies
*
*/

const util = require('util');

const async = require('async');


const facilitySvc = require(GLOBAL.paths.getService('facilities/core'));
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
		facility: [facilitySvc.getFacility.bind(null, req.params.facilityId)],

		nation: [nationSvc.getStats],
		// state: [stateSvc.getStatsBySlug.bind(null, req.params.stateSlug)],
		state: ['facility', function(callback, results) {
			stateSvc.getStatsBySlug(results.facility.state.slug, callback);
		}],
		city: ['facility', function(callback, results) {
			citySvc.getStatsBySlug(results.facility.state, results.facility.city.slug, callback);
		}],

	}, function(err, results) {

		if (!results.facility || !results.facility.id) {
			var httpErr = {code: 404, msg: 'Not Found'};

			res.status(httpErr.code);
			res.render('_error', {
				msg: httpErr.msg,
			});

		}
		else {

			var place = results.facility;
			place.type = 'provider';

			// console.log(place);


			var places = {
				'facility': results.facility,
				'nation': results.nation,
				'state': results.state,
				'city': results.city,
			}

			statsCore.render(req, res, place, places);
		}
	});
};
