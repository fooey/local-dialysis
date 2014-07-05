'use strict';


/*
*
*	Dependencies
*
*/

const util = require('util');

const _ = require('lodash');
const async = require('async');

const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const sitemapsSvc = require(GLOBAL.paths.getService('sitemaps'));


/*
*
*	PUBLIC METHODS
*
*/

module.exports = function(req, res) {
	async.auto({

		states: statesSvc.getTotals,
		lastMod: sitemapsSvc.getLastMod,

	}, function renderView(err, results) {
		var baseUrl = 'http://local-dialysis.com/sitemaps/geo/';

		var indexUrls = [baseUrl + 'list'];

		_.each(results.states, function(state) {
			indexUrls.push(baseUrl + state.slug);
		});

		sitemapsSvc.send(
			res,
			sitemapsSvc.generateIndex(results.lastMod, indexUrls)
		);
	});

};
