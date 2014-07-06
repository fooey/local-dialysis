'use strict';

const _ = require('lodash');
const async = require('async');
const numeral = require('numeral');



const nationSvc = require(GLOBAL.paths.getService('geo/nation'));
const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const citiesSvc = require(GLOBAL.paths.getService('geo/cities'));

const thresholdDefault = 12;


module.exports = function(req, res, next) {
	async.auto({

		nation: nationSvc.getTotals,

	}, function renderView(err, results) {

		var place = results.nation;
		place.type = 'nation';


		res.render('search', {
			metaTitle: 'Search Results - Local Dialysis Providers',
			metaDescription: 'Search Results',

			place: place,
		});
	});
};