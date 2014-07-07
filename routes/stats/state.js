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

	}, function(err, results) {

		if (!results.state) {
			var httpErr = {code: 404, msg: 'Not Found'};

			res.status(httpErr.code);
			res.render('_error', {
				msg: httpErr.msg,
			});

		}
		else {

			var place = results.state;
			place.type = 'state';


			var places = {
				'nation': results.nation,
				'state': results.state,
			}

			statsCore.render(req, res, place, places);
		}
	});
};
