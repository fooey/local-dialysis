'use strict';


/*
*
*	Dependencies
*
*/

const util = require('util');

const _ = require('lodash');
const async = require('async');

const nationSvc = require(GLOBAL.paths.getService('geo/nation'));
const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const sitemapsSvc = require(GLOBAL.paths.getService('sitemaps'));


/*
*
*	PUBLIC METHODS
*
*/

module.exports = function(req, res) {
	async.auto({

		nation: nationSvc.getTotals,
		states: statesSvc.getTotals,
		lastMod: sitemapsSvc.getLastMod,

	}, function renderView(err, results) {

		var urls = sitemapsSvc.getPlaceUrls(results.nation);

		_.each(results.states, function(state) {
			urls = urls.concat(sitemapsSvc.getPlaceUrls(state));
		});

		sitemapsSvc.send(
			res,
			sitemapsSvc.generate(results.lastMod, urls)
		);
	});
};
