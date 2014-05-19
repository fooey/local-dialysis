'use strict';

const util = require('util');

const _ = require('lodash');
const async = require('async');


const States = require(GLOBAL.paths.getLib('geo/state'));
const Facilities = require(GLOBAL.paths.getLib('facilities/facility'));


const CONSTS = {
	perPage: 20
};


module.exports = function(req, res, next) {
	var __INSTANCE = {};
	__INSTANCE.pageNum = __getPageNum(req.query.page);
	__INSTANCE.startRow = __getStartRow(__INSTANCE.pageNum);
	__INSTANCE.endRow = __getEndRow(__INSTANCE.pageNum);
	__INSTANCE.filterOptions = __getFilterOptions(req.query);


	console.log(req.params);
	console.log(req.query);



	async.auto({
			'state': __getState.bind(null, req.params.stateSlug),
			'facilities': ['state', __getFacilities],
			'refined': ['facilities', __refineResults],
		},
		__render.bind(null, res)
	);







	function __getState(stateSlug, callback) {
		States.getBySlug(stateSlug, function(err, state) {
			var httpErr = null;
			if (!state) {
				httpErr = {code: 404, msg: 'Not Found'};
			}

			callback(httpErr, state);
		});
	}



	function __getFacilities(callback, results) {
		Facilities.getByState(results.state.abbr, function(err, facilities) {
			var httpErr = null;
			if (!facilities || facilities.length === 0) {
				httpErr = {code: 404, msg: 'Not Found'};
			}

			callback(httpErr, facilities);
		});
	}


	function __refineResults(callback, results) {
		async.filter(
			results.facilities,
			__applyFilters,
			function(refinedResults) {
				callback(null, {
					count: refinedResults.length,
					results: refinedResults.slice(__INSTANCE.startRow, __INSTANCE.endRow),
				});
			}
		)
	}


	function __applyFilters(facility, callback) {
		async.every(
			__INSTANCE.filterOptions,
			function(filter, nextFilter) {
				nextFilter(facility[filter]);
			},
			callback
		);
	}



	function __render(res, err, results) {
		if (err && err.code && err.msg) {
			res.status(err.code).send(err.msg);
		}
		else {
			var title = util.format('Dialysis Providers in %s', results.state.name);
			var description = util.format('We can help you find and compare the %d Medicare certified dialysis facilties in %s', results.state.count, results.state.name);


			console.log('INSTANCE', __INSTANCE);


			res.render('browse', {
				metaTitle: title,
				metaDescription: description,

				pageTitle: title,
				pageDescription: description,

				stateFacilities: results.state.count,
				facilities: results.refined,

				pageNum: __INSTANCE.pageNum,
				startRow: __INSTANCE.startRow,
				endRow: __INSTANCE.endRow,
			});

		}

	}





};



function __getPageNum(qryPage) {
	console.log('qryPage', qryPage);
	var pageNum = qryPage || 1;
	if (pageNum !== 'viewall' && isNaN(pageNum)) {
		pageNum = 1;
	}
	return pageNum;
}


function __getStartRow(pageNum) {
	if (pageNum === 'viewall') return 0;

	return ((pageNum - 1) * CONSTS.perPage);
}


function __getEndRow(pageNum) {
	if (pageNum === 'viewall') return Infinity;

	return __getStartRow(pageNum) + CONSTS.perPage;
}


function __getFilterOptions(query) {
	var filters = [];

	query.chain && filters.push('chain_owned');
	query.lateshift && filters.push('late_shift_');
	query.hemodialysis && filters.push('offers_in_center_hemodialysis');
	query.peritonealdialysys && filters.push('offers_in_center_peritoneal_dialysis');
	query.hemodialysistraining && filters.push('offers_home_hemodialysis_training');

	return filters;
}



