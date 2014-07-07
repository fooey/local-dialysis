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

me.getTotals = function getTotals(fnCallback) {
	// console.log('data::nation::getTotals');

	var statement = [
		'SELECT',
			common.getTotalsColumns().join(', '),
		'FROM facilities'
	].join('\n');

	// console.log(statement);
	// console.log(params);

	db.all(statement, fnCallback);
};



me.getStats = function getStats(fnCallback) {
	// console.log('data::nation::getStats');

	var columns = common.getTotalsColumns().concat(common.getStatsColumns());

	var statement = [
		'SELECT',
			columns.join(', '),
		'FROM facilityStats INNER JOIN facilities ON facilities.id = facilityStats.id'
	].join('\n');

	// console.log(statement);
	// console.log(params);

	db.all(statement, fnCallback);
};