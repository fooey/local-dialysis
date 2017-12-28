"use strict";

/*
*	http://hostname/providers*
*/
const util = require('util');

const facilitySvc = require(GLOBAL.paths.getService('facilities/core'));

module.exports = function(app, express) {
	var router = express.Router();


	var providerRoute = GLOBAL.paths.getRoute('providers/provider');

	router.get('/:facilitySlug.area.:facilityId([0-9]{6}).html', function(req, res) {
		facilitySvc.getFacility(req.params.facilityId, function(err, place) {
			res.redirect(301, place.city.getLink());
		});
	});

	// router.get('/:facilitySlug.hotels.:facilityId([0-9]{6}).html', function(req, res) {
	// 	facilitySvc.getFacility(req.params.facilityId, function(err, place) {
	// 		console.log(place);

	// 		var address = util.format(
	// 			'%s, %s, %s',
	// 			place.address,
	// 			place.city.name,
	// 			place.state.code
	// 		);
	// 		// address = address.replace(/ /gi, '+');
	// 		address = encodeURIComponent(address);
	// 		address = address.replace(/%20/gi, '+');

	// 		var pageLink = (
	// 			'http://www.travelnow.com/templates/337937/hotels/list?destination='
	// 			+ address
	// 			+ util.format('&targetId=LATLONG-%s,%s', place.locationLat, place.locationLon)
	// 		);
	// 		res.send(pageLink);
	// 		// res.redirect(301, pageLink);
	// 	});
	// });

	router.get('/:facilitySlug.statistics.:facilityId([0-9]{6}).html', require(GLOBAL.paths.getRoute('stats/provider')));
	router.get('/:facilitySlug.jobs.:facilityId([0-9]{6}).html', require(GLOBAL.paths.getRoute('jobs/provider')));

	// router.get('/:facilitySlug.hotels.:facilityId([0-9]{6}).html', require(GLOBAL.paths.getRoute('hotels/provider')));
	router.get('/:facilitySlug.hotels.:facilityId([0-9]{6}).html', (req, res) => {
		return facilitySvc.getFacility(req.params.facilityId, function(err, place) {
			console.log('place', place);
			res.redirect(301, place.getLink());
		});
	});
	



	router.get('/:facilityId([0-9]{6})', require(providerRoute));
	router.get('/:facilityId([0-9]{6}).html?', require(providerRoute));
	router.get('/:facilitySlug.:facilityId([0-9]{6}).html', require(providerRoute));


	// router.get('/:facilitySlug.:subSlug?.:facilityId([0-9]{6}).html', require(providerRoute));


	return router;
};

//

