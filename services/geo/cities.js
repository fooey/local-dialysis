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

const statesSvc = require(GLOBAL.paths.getService('geo/states'));
const citiesData = require(GLOBAL.paths.getService('data/cities'));


/*
*
*	Class
*
*/

me.City = function(jsonData, state) {
	if (!jsonData) return null;

	_.assign(this, jsonData);


	if (!_.has(this, 'state')) {
		if (state) {
			this.state = state;
		}
		else {
			this.state = new statesSvc.State({
				name: this.stateName,
				slug: this.stateSlug,
				code: this.stateCode,
			});
		}
	}

	delete this.stateName;
	delete this.stateSlug;
	delete this.stateCode;


	this.placeName = this.name + ', ' + this.state.name;

	// console.log(jsonData.name, this);

	return this;
}


me.City.prototype.getLink = function getLink(subPage) {
	var pageLink = [
		this.state.getLink(), 
		this.slug,
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


me.getTotals = function data_getTotals(filters, fnCallback) {
	if (typeof filters === 'function') {
		fnCallback = filters;
		filters = {};
	}

	var cacheKey = 'city:getByState:' + filterToString(filters);
	var cities = GLOBAL.cache.get(cacheKey);

	if (cities) {
		fnCallback(null, cities);
	}
	else {
		citiesData.getTotals(filters, function(err, data) {

			var cities = data.map(function(cityData) {
				return new me.City(cityData);
			});

			GLOBAL.cache.set(cacheKey, cities);

			fnCallback(err, cities);
		});
	}
};



me.getByState = function getByState(state, fnCallback) {
	var cacheKey = 'city:getByState:' + state.slug;
	var cities = GLOBAL.cache.get(cacheKey);

	if (cities) {
		fnCallback(null, cities);
	}
	else {
		citiesData.getTotals({stateSlug: state.slug}, function(err, data) {

			var cities = data.map(function(cityData) {
				return new me.City(cityData, state);
			});

			GLOBAL.cache.set(cacheKey, cities);

			fnCallback(err, cities);
		});
	}
};



me.getBySlug = function getBySlug(state, citySlug, fnCallback) {
	var cacheKey = 'city:getBySlug:' + state.slug + ':' + citySlug;
	var city = GLOBAL.cache.get(cacheKey);

	if (city) {
		fnCallback(null, city);
	}
	else {
		var filters = {stateSlug: state.slug, citySlug: citySlug};
		citiesData.getTotals(filters, function(err, data) {
			if (err) throw (err);
			
			var city = (data.length) ? new me.City(data[0], state) : null;
			GLOBAL.cache.set(cacheKey, city);
			fnCallback(err, city);
		});
	}
}


me.getStatsBySlug = function getStatsBySlug(state, citySlug, fnCallback) {
	// console.log('cities::getStatsBySlug');
	var filters = {stateSlug: state.slug, citySlug: citySlug};

	citiesData.getStats(filters, function(err, data) {
		if (err) throw (err);

		var city = (data.length) ? new me.City(data[0], state) : null;
		fnCallback(err, city);
	});
};


function filterToString(filters) {
	var keys = _.keys(filters).sort();
	var results = [];

	_.each(keys, function(key) {
		results.push(key + '=' + filters[key]);
	});

	return results.join(':');
}