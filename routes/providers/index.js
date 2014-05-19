"use strict";

/*
*	http://hostname/providers*
*/

module.exports = function(app, express) {
	var router = express.Router();


	router.get(
		'/:facilitySlug.:subSlug?.:facilityId([0-9]{6}).html',
		require(GLOBAL.paths.getRoute('facility'))
	);


	return router;
};

