'use strict';

const _ = require('lodash');
const async = require('async');
const numeral = require('numeral');



const nationSvc = require(global.paths.getService('geo/nation'));
const statesSvc = require(global.paths.getService('geo/states'));
const citiesSvc = require(global.paths.getService('geo/cities'));

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
