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
const facilitiesSvc = require(GLOBAL.paths.getService('facilities/core'));
const sitemapsSvc = require(GLOBAL.paths.getService('sitemaps'));


/*
*
*	PUBLIC METHODS
*
*/

module.exports = function(req, res) {
	console.log(req.params);

	async.auto({
		lastMod: sitemapsSvc.getLastMod,

		'state': statesSvc.getBySlug.bind(null, req.params.stateSlug),
		'facilities': ['state', function(callback, results) {
			facilitiesSvc.get({stateSlug: results.state.slug}, callback);
		}],

	}, function renderView(err, results) {

		var urls = [];

		_.each(results.facilities, function(place) {
			urls = urls.concat(sitemapsSvc.getProviderUrls(place));
		});

		// res.send(results);

		sitemapsSvc.send(
			res,
			sitemapsSvc.generate(results.lastMod, urls)
		);
	});
};
