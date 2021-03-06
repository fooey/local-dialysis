'use strict';

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

const util = require('util');

const _ = require('lodash');
const async = require('async');
const numeral = require('numeral');


/*
*
*	PUBLIC METHODS
*
*/

me.render = function(req, res, place, places) {
	var title = 'Dialysis Provider Statistics';
	var description = util.format('Statistical breakdown of %s Medicare certified dialysis facilties', numeral(place.numFacilities).format('0,0'));

	var pageTitle = util.format('Dialysis Provider Statistics');
	var pageDescription = description;


	if (place.type === 'provider') {
		title = util.format('%s Statistics', place.name);
		description = util.format('See how %s rates for Anemia Managment, Dialysis Adequacy, and Vascular Access as compared to the averages in %s, %s, and Nationwide.', place.name, place.city.name, place.state.name);

		pageTitle = title;
	}
	else if (place.type !== 'nation') {
		title = util.format('%s %s', place.placeName, title);
		description = util.format('%s in %s', description, place.placeName);

		pageTitle = util.format('%s <nobr>%s</nobr>', place.placeName, pageTitle)
	}


	var hasNation = _.has(places, "nation");
	var hasState = _.has(places, "state");
	var hasCity = _.has(places, "city");
	var hasFacility = _.has(places, "facility");



	res.render('statistics', {
		metaTitle: title,
		metaDescription: description,

		pageTitle: pageTitle,
		pageDescription: description,

		place: place,
		places: places,

		hasNation: hasNation,
		hasState: hasState,
		hasCity: hasCity,
		hasFacility: hasFacility,


		numeral: numeral,
	});
}
