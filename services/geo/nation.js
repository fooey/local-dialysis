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

function Nation(jsonData) {
	_.assign(this, jsonData);

	this.link = '/';

	return this;
}



/*
*
*	Public Methods
*
*/

me.getTotals = function data_getTotals(fnCallback) {
	nationData.getTotals(function(err, data) {
		var nation = new Nation(data[0]);

		fnCallback(err, nation);
	});
};