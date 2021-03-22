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
const citiesSvc = require(global.paths.getService('geo/cities'));
const sitemapsSvc = require(global.paths.getService('sitemaps'));
const fsSvc = require(global.paths.getService('fs'));


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
			sitemapsSvc.generate(global.lastMod, urls)
		);
	});
};
