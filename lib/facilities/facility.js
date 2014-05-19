'use strict';

const _ = require('lodash');
const async = require('async');

var toExport = {};
module.exports = toExport;



/*
*
*	CLASS
*
*/


function Facility(facilityData) {
	_.assign(this, facilityData);

	this.getLink = function(subPage) {
		var pageLink = [
			this.slug, 
			subPage, 
			this.provider_number, 
			'html'
		];

		return '/providers/' + _.compact(pageLink).join('.');
	}

	return this;
}



/*
*
*	PUBLIC METHODS
*
*/


toExport.getByState = function(stateKey, callback) {
	const geoAgg = require(GLOBAL.paths.getData('medicare/agg/geo.json'));
	const idArray = geoAgg.states[stateKey].providers;

	toExport.getFacilities(idArray, callback);
};


toExport.getFacility = function(id, callback) {
	callback(null, new Facility(
		require(__getFacilityPath(id))
	));
};


toExport.getFacilities = function(idArray, callback) {
	async.concat(
		idArray,
		toExport.getFacility,
		function(err, facilities) {
			facilities.sort(__sortByName);

			callback(err, facilities);
		}
	);
};



/*
*
*	PRIVATE METHODS
*
*/

function __getFacilityPath(id) {
	return GLOBAL.paths.getData('/medicare/facilities/' + id + '.json');	
}


function __sortByName(a, b) {
	if (a.facility_name > b.facility_name) return 1;
	if (a.facility_name < b.facility_name) return -1;
	return 0;
}

