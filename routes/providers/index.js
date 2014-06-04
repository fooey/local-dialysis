"use strict";

/*
*	http://hostname/providers*
*/

module.exports = function(app, express) {
	var router = express.Router();


	var facilityRoute = GLOBAL.paths.getRoute('facility');
	router.get('/:facilityId([0-9]{6})', require(facilityRoute));
	router.get('/:facilityId([0-9]{6}).html?', require(facilityRoute));
	router.get('/:facilitySlug.:subSlug?.:facilityId([0-9]{6}).html', require(facilityRoute));

	return router;
};

