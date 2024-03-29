'use strict';


/*
*
*	Dependencies
*
*/

const util = require('util');

const _ = require('lodash');
const async = require('async');

const nationSvc = require(global.paths.getService('geo/nation'));
const statesSvc = require(global.paths.getService('geo/states'));
const sitemapsSvc = require(global.paths.getService('sitemaps'));
const fsSvc = require(global.paths.getService('fs'));


/*
*
*	PUBLIC METHODS
*
*/

module.exports = function(req, res) {
	async.auto({

		nation: nationSvc.getTotals,
		states: statesSvc.getTotals,

	}, function renderView(err, results) {

		var urls = sitemapsSvc.getPlaceUrls(results.nation);

		_.each(results.states, function(state) {
			urls = urls.concat(sitemapsSvc.getPlaceUrls(state));
		});

		sitemapsSvc.send(
			res,
			sitemapsSvc.generate(global.lastMod, urls)
		);
	});
};
