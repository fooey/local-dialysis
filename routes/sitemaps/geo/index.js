'use strict';


/*
*
*	Dependencies
*
*/

const util = require('util');

const _ = require('lodash');
const async = require('async');

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

		states: statesSvc.getTotals,

	}, function renderView(err, results) {
		var baseUrl = 'http://local-dialysis.com/sitemaps/geo/';

		var indexUrls = [baseUrl + 'list'];

		_.each(results.states, function(state) {
			indexUrls.push(baseUrl + state.slug);
		});

		sitemapsSvc.send(
			res,
			sitemapsSvc.generateIndex(global.lastMod, indexUrls)
		);
	});

};
