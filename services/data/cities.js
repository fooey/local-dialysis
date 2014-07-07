"use strict";

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

const _ = require('lodash');
const async = require('async');

const common = require('./common.js');

var db = GLOBAL.DATABASE;



/*
*
*	Public Methods
*
*/

me.getTotals = function getTotals(filters, fnCallback) {
	// console.log('data::cities::getTotals');

	filters = _.defaults(filters, {
		threshold: 0
	});

	var params = {};
	var where = [];
	var having = [];

	if (filters.stateSlug) {
		where.push('stateSlug = $stateSlug');
		params.$stateSlug = filters.stateSlug;
	}
	if (filters.citySlug) {
		where.push('citySlug = $citySlug');
		params.$citySlug = filters.citySlug;
	}

	if (filters.threshold) {
		having.push('COUNT(*) >= $threshold');
		params.$threshold = filters.threshold;
	}
	

	var columns = common.getTotalsColumns().concat([
		'state AS stateName',
		'stateSlug',
		'stateCode',
		'city AS name',
		'citySlug AS slug',
	]);

	var statement = [
		'SELECT',
			columns.join(', '),
		'FROM facilities',
		(where.length) ? 'WHERE ' + where.join(' and ') : '',
		'GROUP BY state, stateSlug, stateCode, city, citySlug',
		(having.length) ? 'HAVING ' + having.join(' and ') : '',
		'ORDER BY state, stateSlug, stateCode, city, citySlug',
	].join(' ');

	// console.log(statement);
	// console.log(params);

	db.all(statement, params, fnCallback);
};



me.getStats = function getStats(filters, fnCallback) {
	// console.log('data::cities::getStats');

	filters = _.defaults(filters, {
		threshold: 0
	});

	var params = {};
	var where = [];
	var having = [];

	if (filters.stateSlug) {
		where.push('stateSlug = $stateSlug');
		params.$stateSlug = filters.stateSlug;
	}
	if (filters.citySlug) {
		where.push('citySlug = $citySlug');
		params.$citySlug = filters.citySlug;
	}

	if (filters.threshold) {
		having.push('COUNT(*) >= $threshold');
		params.$threshold = filters.threshold;
	}
	

	var columns = [
			'state AS stateName',
			'stateSlug',
			'stateCode',
			'city AS name',
			'citySlug AS slug',
		]
		.concat(common.getTotalsColumns())
		.concat(common.getStatsColumns());

	var statement = [
		'SELECT',
			columns.join(', '),
		'FROM facilityStats INNER JOIN facilities ON facilities.id = facilityStats.id',
		(where.length) ? 'WHERE ' + where.join(' and ') : '',
		'GROUP BY facilities.state, facilities.stateSlug, facilities.stateCode, facilities.city, facilities.citySlug',
		(having.length) ? 'HAVING ' + having.join(' and ') : '',
		'ORDER BY facilities.state, facilities.stateSlug, facilities.stateCode, facilities.city, facilities.citySlug',
	].join(' ');

	// console.log(statement);
	// console.log(params);

	db.all(statement, params, fnCallback);
};