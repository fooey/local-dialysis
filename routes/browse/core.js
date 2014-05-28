'use strict';

/*
*
*	Export
*
*/

var me = module.exports = {};



/*
*
*	Dependencies
*
*/

const util = require('util');

const _ = require('lodash');
const async = require('async');




/*
*
*	PUBLIC PROPERTIES
*
*/

me.STATICS = {
	filters: [
		{
			name: 'hemodialysis',
			label: 'Offers Hemodialysis',
			col: 'offersHemo',
			val: 'yes',
		}, {
			name: 'peritonealdialysys',
			label: 'Offers Peritoneal Dialysis',
			col: 'offersPeri',
			val: 'yes',
		}, {
			name: 'hemodialysistraining',
			label: 'Offers Home Training',
			col: 'offersTraining',
			val: 'yes',
		}, {
			name: 'lateshift',
			label: 'Has shifts after 5pm',
			col: 'offersLate',
			val: 'yes',
		}, {
			name: 'forprofit',
			label: 'For Profit Facility',
			col: 'forProfit',
			val: 'yes',
		}, {
			name: 'forprofit',
			label: 'Non Profit Facility',
			col: 'forProfit',
			val: 'no',
		}, {
			name: 'chain',
			label: 'Chain Owned',
			col: 'isChain',
			val: 'yes',
		}, {
			name: 'chain',
			label: 'Not Chain Owned',
			col: 'isChain',
			val: 'no',
		},
	],
};


/*
*
*	PUBLIC METHODS
*
*/

me.render = function(res, place, facilities, options){
	var title = util.format('Dialysis Providers in %s', place.placeName);
	var description = util.format('We can help you find and compare the %d Medicare certified dialysis facilties in %s', place.numFacilities, place.placeName);

	options.numPages = Math.ceil(facilities.length / options.perPage);

	res.render('browse', {
		metaTitle: title,
		metaDescription: description,

		pageTitle: title,
		pageDescription: description,

		place: place,

		numFacilities: place.numFacilities,
		numResults: facilities.length,
		facilities: facilities.slice(options.startRow, options.endRow),
		options: options,
	});
};


me.getPageNum = function(qryPage) {
	var pageNum = qryPage || 1;
	if (pageNum !== 'viewall' && isNaN(pageNum)) {
		pageNum = 1;
	}
	return pageNum;
};


me.getStartRow = function(pageNum, perPage) {
	if (pageNum === 'viewall') return 0;

	return ((pageNum - 1) * perPage);
};


me.getEndRow = function(pageNum, perPage) {
	if (pageNum === 'viewall') return Infinity;

	return me.getStartRow(pageNum, perPage) + perPage;
};


me.getFilters = function(inQuery) {
	var url = require('url');

	var filters = _.cloneDeep(me.STATICS.filters);

	var curUrl = url.format({
		query: inQuery,
	});

	console.log('curUrl', curUrl);

	filters = _.map(filters, function(filter) {
		var thisQuery = _.cloneDeep(inQuery);

		filter.isActive = (_.has(inQuery, filter.name) && inQuery[filter.name] === filter.val);

		if (filter.isActive) {
			delete thisQuery[filter.name];
		}
		else {
			thisQuery[filter.name] = filter.val;
		}

		filter.link = url.format({
			query: thisQuery
		});

		return filter;
	})

	return filters;
};
