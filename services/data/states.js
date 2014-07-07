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
	// console.log('data::states::getTotals');

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

	var columns = [
		'facilities.state AS name',
		'facilities.stateSlug AS slug',
		'facilities.stateCode AS code',
	].concat(common.getTotalsColumns());

	var statement = [
		'SELECT',
			columns.join(', '),
		'FROM facilities',
		(where.length) ? 'WHERE ' + where.join(' and ') : '',
		'GROUP BY state, stateSlug, stateCode',
		(having.length) ? 'HAVING ' + having.join(' and ') : '',
		'ORDER BY state, stateSlug, stateCode',
	].join(' ');

	// console.log(statement);
	// console.log(params);

	db.all(statement, params, fnCallback);
};



me.getStats = function getStats(filters, fnCallback) {
	// console.log('data::states::getStats');
	// console.log(filters, fnCallback);

	var params = {};
	var where = [];
	var having = [];

	if (filters.stateSlug) {
		where.push('stateSlug = $stateSlug');
		params.$stateSlug = filters.stateSlug;
	}

	var columns = [
			'facilities.state AS name',
			'facilities.stateSlug AS slug',
			'facilities.stateCode AS code',
		]
		.concat(common.getTotalsColumns())
		.concat(common.getStatsColumns());

	var statement = [
		"SELECT",
			columns.join(', '),
		'FROM facilityStats INNER JOIN facilities ON facilities.id = facilityStats.id',
		// "FROM facilityStats",
		(where.length) ? 'WHERE ' + where.join(' and ') : '',
		'GROUP BY facilities.state, facilities.stateSlug, facilities.stateCode',
		(having.length) ? 'HAVING ' + having.join(' and ') : '',
		'ORDER BY facilities.state, facilities.stateSlug, facilities.stateCode',
	].join(' ');

	// console.log(statement);
	// console.log(params);

	db.all(statement, params, fnCallback);
};