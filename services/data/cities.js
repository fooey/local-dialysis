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

var db = GLOBAL.DATABASE;



/*
*
*	Public Methods
*
*/

me.getTotals = function getTotals(filters, fnCallback) {
	console.log('data::cities::getTotals');

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

	if (filters.threshold) {
		having.push('COUNT(*) >= $threshold');
		params.$threshold = filters.threshold;
	}
	

	var columns = [
		'state as stateName',
		'stateSlug',
		'stateCode',
		'city as name',
		'citySlug as slug',
		'COUNT(*) AS numFacilities',
		'SUM(numStations) AS numStationsSum',
		'AVG(numStations) AS numStationsAvg',
		'SUM(offersLate) AS offersLateSum',
		'SUM(offersHemo) AS offersHemoSum',
		'SUM(offersPeri) AS offersPeriSum',
		'SUM(offersTraining) AS offersTrainingSum',

		'SUM(forProfit) AS forProfitSum',
		'SUM(CASE WHEN forProfit = 0 THEN 1 ELSE NULL END) AS nonProfitSum',

		'SUM(isChain) AS isChainSum',
		'SUM(CASE WHEN isChain = 0 THEN 1 ELSE NULL END) AS notChainSum',

		'AVG(performanceScore) AS performanceScoreAvg',
		'MIN(performanceScore) AS performanceScoreMin',
		'MAX(performanceScore) AS performanceScoreMax',

		'AVG(vascularScore) AS vascularScoreAvg',
		'MIN(vascularScore) AS vascularScoreMin',
		'MAX(vascularScore) AS vascularScoreMax',

		'AVG(CASE WHEN typeOf(ichScore) <> "integer" THEN NULL ELSE ichScore END) AS ichScoreAvg',
		'MIN(CASE WHEN typeOf(ichScore) <> "integer" THEN NULL ELSE ichScore END) AS ichScoreMin',
		'MAX(CASE WHEN typeOf(ichScore) <> "integer" THEN NULL ELSE ichScore END) AS ichScoreMax',
		
		'AVG(nhsnScore) AS nhsnScoreAvg',
		'MIN(nhsnScore) AS nhsnScoreMin',
		'MAX(nhsnScore) AS nhsnScoreMax',

		'AVG(mineralScore) AS mineralScoreAvg',
		'MIN(mineralScore) AS mineralScoreMin',
		'MAX(mineralScore) AS mineralScoreMax',
		

		'AVG(hospitalizationRatio) AS hospitalizationRatioAvg',
		'MIN(hospitalizationRatio) AS hospitalizationRatioMin',
		'MAX(hospitalizationRatio) AS hospitalizationRatioMax',

		'AVG(mortalityRatio) AS mortalityRatioAvg',
		'MIN(mortalityRatio) AS mortalityRatioMin',
		'MAX(mortalityRatio) AS mortalityRatioMax',

		// 'AVG(certificationDate) AS certificationDateAvg',
		'MIN(certificationDate) AS certificationDateMin',
		'MAX(certificationDate) AS certificationDateMax',
	];

	var statement = [
		'SELECT',
			columns.join(', '),
		'FROM facilities AS f',
		(where.length) ? 'WHERE ' + where.join(' and ') : '',
		'GROUP BY state, stateSlug, stateCode, city, citySlug',
		(having.length) ? 'HAVING ' + having.join(' and ') : '',
		'ORDER BY state, stateSlug, stateCode, city, citySlug',
	].join(' ');

	// console.log(statement);
	// console.log(params);

	db.all(statement, params, fnCallback);
};