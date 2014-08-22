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
const citiesSvc = require(GLOBAL.paths.getService('geo/cities'));
const sitemapsSvc = require(GLOBAL.paths.getService('sitemaps'));
const fsSvc = require(GLOBAL.paths.getService('fs'));


/*
*
*	PUBLIC METHODS
*
*/

module.exports = function(req, res) {
	console.log(req.params);

	async.auto({
		'state': statesSvc.getBySlug.bind(null, req.params.stateSlug),
		'cities': ['state', function(callback, results) {
			citiesSvc.getByState(results.state, callback);
		}],

	}, function renderView(err, results) {

		var urls = [];

		_.each(results.cities, function(city) {
			urls = urls.concat(sitemapsSvc.getPlaceUrls(city));
		});

		sitemapsSvc.send(
			res,
			sitemapsSvc.generate(GLOBAL.lastMod, urls)
		);
	});
};
