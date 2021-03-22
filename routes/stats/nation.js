'use strict';



/*
*
*	Dependencies
*
*/

const util = require('util');

const async = require('async');


const nationSvc = require(global.paths.getService('geo/nation'));
const statsCore = require(global.paths.getRoute('stats/core'));


/*
*
*	DEFAULT EXPORT
*
*/

module.exports = function(req, res) {
	async.auto({
		nation: [nationSvc.getStats],
	}, function(err, results) {

		var place = results.nation;
		place.type = 'nation';


		var places = {
			'nation': results.nation,
		}

		statsCore.render(req, res, place, places);
	});
};
