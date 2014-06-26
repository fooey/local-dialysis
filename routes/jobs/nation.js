'use strict';



/*
*
*	Dependencies
*
*/

const util = require('util');

const async = require('async');


const nationSvc = require(GLOBAL.paths.getService('geo/nation'));
const jobsCore = require(GLOBAL.paths.getRoute('jobs/core'));


/*
*
*	DEFAULT EXPORT
*
*/

module.exports = function(req, res) {
	async.auto({
		nation: [nationSvc.getTotals],
	}, function(err, results) {

		var place = results.nation;
		place.type = 'nation';


		var places = {
			'nation': results.nation,
		}

		jobsCore.render(req, res, place, places);
	});
};
