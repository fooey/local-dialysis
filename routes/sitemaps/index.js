"use strict";

/*
*	http://hostname/sitemaps*
*/
const util = require('util');

module.exports = function(app, express) {
	var router = express.Router();

	console.log('sitemaps!');


	/*
	*	/sitemaps/geo.xml
	*	/sitemaps/providers.xml
	*/

	router.get('/:mapSection.xml', function(req, res) {
		var sectionRoot = '/sitemaps/' + req.params.mapSection;

		if (req.query.state) {
			res.redirect(301, sectionRoot + '/' + req.query.state);
		}
		else {
			res.redirect(301, sectionRoot);
		}
	});



	router.get('/geo', require(GLOBAL.paths.getRoute('sitemaps/geo')));
	router.get('/geo/list', require(GLOBAL.paths.getRoute('sitemaps/geo/list')));
	router.get('/geo/:stateSlug', require(GLOBAL.paths.getRoute('sitemaps/geo/state')));


	router.get('/providers', require(GLOBAL.paths.getRoute('sitemaps/providers')));
	router.get('/providers/:stateSlug', require(GLOBAL.paths.getRoute('sitemaps/providers/state')));


	return router;
};



function dumpRoute(req, res) {
	res.send({
		params: req.params,
		query: req.query,
		url: req.originalUrl,
	});
}