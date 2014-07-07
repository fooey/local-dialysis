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
	if (!jsonData) return null;

	_.assign(this, jsonData);

	this.placeName = this.name;

	return this;
};


me.State.prototype.getLink = function getLink(subPage) {
	var pageLink = [
		'', // leading slash
		this.slug
	];
	if (subPage && !_.isEmpty(subPage)) {
		pageLink.push(subPage + '.html');
	}

	return pageLink.join('/');
};



/*
*
*	Public Methods
*
*/

me.getTotals = function getTotals(fnCallback) {
	statesData.getTotals({}, function(err, data) {
		if (err) throw (err);

		var states = data.map(function(stateData) {
			return new me.State(stateData);
		});

		fnCallback(err, states);
	});
};


me.getBySlug = function getBySlug(slug, fnCallback) {
	// console.log('states:getBySlug()', slug);
	// console.log(arguments);
	statesData.getTotals({stateSlug: slug}, function(err, data) {
		if (err) throw (err);

		var state = (data.length) ? new me.State(data[0]) : null;
		fnCallback(err, state);
	});
};


me.getStatsBySlug = function getStatsBySlug(slug, fnCallback) {
	statesData.getStats({stateSlug: slug}, function(err, data) {
		if (err) throw (err);

		// console.log('getStatsBySlug()', slug, err, data);


		var state = (data.length) ? new me.State(data[0]) : null;
		fnCallback(err, state);
	});
};
