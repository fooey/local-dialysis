'use strict';

const util = require('util');

const _ = require('lodash');
const async = require('async');


const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const facilitiesSvc = require(GLOBAL.paths.getService('facilities/core'));

const browseCore = require(GLOBAL.paths.getRoute('browse/core'));

const STATICS = {
	filters: [
		{
			name: 'hemodialysis',
			key: 'offersHemo',
			label: 'Offers Hemodialysis',
		},
		{
			name: 'peritonealdialysys',
			key: 'offersPeri',
			label: 'Offers Peritoneal Dialysis',
		},
		{
			name: 'hemodialysistraining',
			key: 'offersTraining',
			label: 'Offers Home Training',
		},
		{
			name: 'lateshift',
			key: 'offersLate',
			label: 'Has shifts after 5pm',
		},
		{
			name: 'forprofit',
			key: 'forProfit',
			label: 'For Profit Facility',
		},
		{
			name: 'chain',
			key: 'isChain',
			label: 'Chain Owned',
		},
	]
};


module.exports = function(req, res, next) {
	var INSTANCE = {
		perPage: 20,
	};
	INSTANCE.pageNum = browseCore.getPageNum(req.query.page);
	INSTANCE.startRow = browseCore.getStartRow(INSTANCE.pageNum, INSTANCE.perPage);
	INSTANCE.endRow = browseCore.getEndRow(INSTANCE.pageNum, INSTANCE.perPage);
	INSTANCE.filters = browseCore.getFilters(req.query);


	async.auto({
		'state': getState.bind(null, req.params.stateSlug),
		'facilities': ['state', getFacilities.bind(null, req.params.stateSlug)],
	}, function(err, results) {
		if (err && err.code && err.msg) {
			res.status(err.code);
			res.render('_error', {
				code: err.code,
				msg: err.msg,
			});
		}
		else {
			var place = results.state;
			var facilities = results.facilities;

			browseCore.render(res, place, facilities, INSTANCE);
		}
	});







	function getState(stateSlug, callback) {
		statesSvc.getBySlug(stateSlug, function(err, state) {
			var httpErr = null;
			if (!state) {
				httpErr = {code: 404, msg: 'Not Found'};
			}

			// console.log('getState()', state);

			callback(httpErr, state);
		});
	}



	function getFacilities(stateSlug, callback) {

		var dataFilters = {
			stateSlug: stateSlug,
		}

		var activeFilters = _.where(INSTANCE.filters, {isActive: true}, 'col');

		_.each(activeFilters, function(filter) {
			var val = (filter.val === 'yes') ? 1 : 0;
			dataFilters[filter.col] = val;
		});


		console.log('dataFilters', dataFilters);

		facilitiesSvc.get(dataFilters, function(err, facilities) {
			// var httpErr = null;
			// if (!facilities || facilities.length === 0) {
			// 	httpErr = {code: 404, msg: 'Not Found'};
			// }

			callback(null, facilities);
		});
	}



};



