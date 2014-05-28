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

const statesData = require(GLOBAL.paths.getService('data/states'));


/*
*
*	Class
*
*/

me.State = function(jsonData) {
	_.assign(this, jsonData);

	this.placeName = this.name;

	return this;
}


me.State.prototype.getLink = function getLink(subPage) {
	var pageLink = [
		'', // leading slash
		this.slug
	];
	if (subPage && !_.isEmpty(subPage)) {
		pageLink.push(subPage + '.html');
	}

	return _.compact(pageLink).join('/');
}



/*
*
*	Public Methods
*
*/

me.getTotals = function getTotals(fnCallback) {
	statesData.getTotals({}, function(err, data) {

		var states = data.map(function(stateData) {
			return new me.State(stateData);
		});

		fnCallback(err, states);
	});
};


me.getBySlug = function getBySlug(slug, fnCallback) {

	statesData.getTotals({stateSlug: slug}, function(err, data) {
		fnCallback(err, new me.State(data[0]));
	});
}