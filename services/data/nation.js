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

me.getTotals = function getTotals(fnCallback) {
	console.log('data::nation::getTotals');

	var columns = [
		'COUNT(*) AS numFacilities',
		'SUM(numStations) AS numStationsSum',
		'AVG(numStations) AS numStationsAvg',
		'SUM(offersLate) AS offersLateSum',
		'SUM(offersHemo) AS offersHemoSum',
		'SUM(offersPeri) AS offersPeriSum',
		'SUM(offersTraining) AS offersTrainingSum',
		'SUM(forProfit) AS forProfitSum',
		'SUM(isChain) AS isChainSum',

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
		'FROM facilities AS f'
	].join(' ');

	db.all(statement, fnCallback);
};