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



/*
*
*	Class
*
*/

me.Nation = function(jsonData) {
	_.assign(this, jsonData);

	return this;
}


me.Nation.prototype.getLink = function getLink(subPage) {
	var pageLink = [
		'', // leading slash
	];
	if (subPage && !_.isEmpty(subPage)) {
		pageLink.push(subPage + '.html');
	}

	return pageLink.join('/');
}



/*
*
*	Public Methods
*
*/

me.getTotals = function data_getTotals(fnCallback) {
	nationData.getTotals(function(err, data) {
		var nation = new me.Nation(data[0]);

		fnCallback(err, nation);
	});
};