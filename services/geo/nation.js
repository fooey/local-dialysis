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

const nationData = require(GLOBAL.paths.getService('data/nation'));
const statsCore = require(GLOBAL.paths.getRoute('stats/core'));



/*
*
*	Class
*
*/

me.Nation = function(jsonData) {
	_.assign(this, jsonData);

	this.placeName = 'Nation';

	return this;
}


me.Nation.prototype.getLink = function getLink(subPage) {
	var pageLink = '/';
	if (subPage && !_.isEmpty(subPage)) {
		pageLink += subPage + '.html';
	}

	return pageLink;
}



me.NationStats = function(jsonData) {
	_.assign(this, jsonData);

	return this;
}



/*
*
*	Public Methods
*
*/

me.getTotals = function data_getTotals(fnCallback) {
	var cacheKey = 'nation:getTotals';
	var nation = GLOBAL.cache.get(cacheKey);

	if (nation) {
		fnCallback(null, nation);
	}
	else {
		nationData.getTotals(function(err, data) {
			if (err) throw (err);

			var nation = new me.Nation(data[0]);
			GLOBAL.cache.set(cacheKey, nation);
			fnCallback(err, nation);
		});
	}

};


me.getStats = function data_getStats(fnCallback) {
	// var cacheKey = 'nation:getStats';
	// var nationStats = GLOBAL.cache.get(cacheKey);

	// if (nationStats) {
	// 	fnCallback(null, nationStats);
	// }
	// else {
		nationData.getStats(function(err, data) {
			if (err) throw (err);

			var nationStats = new me.Nation(data[0]);
			// GLOBAL.cache.set(cacheKey, nationStats);
			fnCallback(err, nationStats);
		});
	// }
};