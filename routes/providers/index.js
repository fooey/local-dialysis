"use strict";

/*
*	http://hostname/providers*
*/

module.exports = function(app, express) {
	var router = express.Router();


	router.get(
		'/:facilitySlug.:subSlug?.:facilityId.html',
		require(GLOBAL.paths.getRoute('facility'))
	);


	return router;
};

