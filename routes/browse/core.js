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

const url = require('url');
const util = require('util');

const _ = require('lodash');
const async = require('async');
const numeral = require('numeral');


const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const citiesSvc = require(GLOBAL.paths.getService('geo/cities'));




/*
*
*	PUBLIC PROPERTIES
*
*/

const STATICS = {
	filters: [
		{
			name: 'hemodialysis',
			label: 'Offers Hemodialysis',
			col: 'offersHemo',
			aggCol: 'offersHemoSum',
			val: 'yes',
		}, {
			name: 'peritonealdialysys',
			label: 'Offers Peritoneal Dialysis',
			col: 'offersPeri',
			aggCol: 'offersPeriSum',
			val: 'yes',
		}, {
			name: 'hemodialysistraining',
			label: 'Offers Home Training',
			col: 'offersTraining',
			aggCol: 'offersTrainingSum',
			val: 'yes',
		}, {
			name: 'lateshift',
			label: 'Has shifts after 5pm',
			col: 'offersLate',
			aggCol: 'offersLateSum',
			val: 'yes',
		}, {
			name: 'forprofit',
			label: 'For Profit Facility',
			col: 'forProfit',
			aggCol: 'forProfitSum',
			val: 'yes',
		}, {
			name: 'forprofit',
			label: 'Non Profit Facility',
			col: 'forProfit',
			aggCol: 'nonProfitSum',
			val: 'no',
		}, {
			name: 'chain',
			label: 'Chain Owned',
			col: 'isChain',
			aggCol: 'isChainSum',
			val: 'yes',
		}, {
			name: 'chain',
			label: 'Not Chain Owned',
			col: 'isChain',
			aggCol: 'notChainSum',
			val: 'no',
		},
	],
};


/*
*
*	PUBLIC METHODS
*
*/

me.render = function(req, res, place, facilities, state, city) {
	var options = {
		perPage: 20,
	};
	options.pageNum = getPageNum(req.query.page);
	options.startRow = getStartRow(options.pageNum, options.perPage);
	options.endRow = getEndRow(options.pageNum, options.perPage);
	options.filters = me.getFilters(req.query);

	options.numPages = Math.ceil(facilities.length / options.perPage);

	options.prevPageNum = getPrevPageNum(options.pageNum);
	options.nextPageNum = getNextPageNum(options.pageNum, options.numPages);

	options.prevPageUrl = getPageLink(options.prevPageNum, req.originalUrl);
	options.nextPageUrl = getPageLink(options.nextPageNum, req.originalUrl);
	options.firstPageUrl = getPageLink(1, req.originalUrl);
	options.lastPageUrl = getPageLink(options.numPages, req.originalUrl);

	if (options.pageNum !== 'viewall') {
		if (options.numPages && options.pageNum > options.numPages) {
			res.redirect(301, options.lastPageUrl);
		}

		if (options.pageNum !== Math.abs(options.pageNum)) {
			res.redirect(301, getPageLink(Math.abs(options.pageNum), req.originalUrl));
		}
	}

	options.state = state;
	options.city = city;

	var title = util.format('%s Dialysis Providers', place.placeName);
	var description = util.format('Find and compare the %s Medicare certified dialysis facilties in %s', numeral(place.numFacilities).format('0,0'), place.placeName);
	var canonical = place.getLink() + '?page=viewall';
	
	var pageTitle = util.format('%s <nobr>Dialysis Providers</nobr>', place.placeName);
	var pageDescription = description;


	options.hasFilter = !!(canonical !== req.originalUrl && place.getLink() !== req.originalUrl);

	async.auto({
		states: statesSvc.getTotals,
		cities: citiesSvc.getTotals.bind(null, {stateSlug: state.slug}),
	}, function(err, results) {
		// console.log('options', options);

		res.render('browse', {
			metaTitle: title,
			metaDescription: description,
			canonical: canonical,

			pageTitle: pageTitle,
			pageDescription: description,

			place: place,
			states: results.states,
			cities: results.cities,

			numFacilities: place.numFacilities,
			numResults: facilities.length,
			facilities: facilities.slice(options.startRow, options.endRow),
			options: options,

			textLabel: textLabel,
			scoreLabel: scoreLabel,

			numeral: numeral,
		});
	});

};


me.getFilters = function(inQuery) {
	var filters = _.cloneDeep(STATICS.filters);
	inQuery = _.cloneDeep(inQuery);
	delete inQuery.page;

	var curUrl = url.format({
		query: inQuery,
	});

	// console.log('curUrl', curUrl);

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


me.getState = function(stateSlug, callback) {
	statesSvc.getBySlug(stateSlug, function(err, state) {
		var httpErr = null;
		if (!state) {
			httpErr = {code: 404, msg: 'Not Found'};
		}

		// console.log('getState()', state);

		callback(httpErr, state);
	});
};


me.getCity = function(state, citySlug, callback) {
	citiesSvc.getBySlug(state, citySlug, function(err, city) {
		var httpErr = null;
		if (!city) {
			httpErr = {code: 404, msg: 'Not Found'};
		}

		callback(httpErr, city);
	});
};





function getPageNum(qryPage) {
	var pageNum = qryPage || 1;
	if (pageNum === 'viewall') {
		return pageNum;
	}
	// else if (isNaN(pageNum)) {
	// 	pageNum = 1;
	// }
	return _.parseInt(pageNum);
};



function getPrevPageNum(pageNum) {
	return Math.max(1, pageNum - 1);
}

function getNextPageNum(pageNum, numPages) {
	return Math.min(numPages, pageNum + 1);
}

function getPageLink(pageNum, originalUrl) {

	var urlObj = url.parse(originalUrl, true);
	urlObj.query.page = pageNum;

	if (pageNum === 1) {
		delete urlObj.query.page;
	};

	return url.format({
		pathname: urlObj.pathname,
		query: urlObj.query,
	});

}



function getStartRow(pageNum, perPage) {
	if (pageNum === 'viewall') return 0;

	return ((pageNum - 1) * perPage);
};


function getEndRow(pageNum, perPage) {
	if (pageNum === 'viewall') return Infinity;

	return getStartRow(pageNum, perPage) + perPage;
};


function textLabel(text) {
	if (text === 'Worse than Expected') return 'label-danger';
	if (text === 'Better than Expected') return 'label-success';
	if (text === 'As Expected') return 'label-info';
	return 'label-default';
}


function scoreLabel(score) {
	if (!_.isNumber(score)) return "label-default";

	if (score >= 90) return 'label-success';
	if (score >= 80) return 'label-info';
	if (score >= 60) return 'label-warning';
	if (score < 60) return 'label-danger';
	return 'label-default';
}
