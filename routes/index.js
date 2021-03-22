'use strict';

module.exports = function(app, express) {




	/*
	*	system
	*/

	app.get('/globals', function(req, res) {
		res.send(global.DATA.REFERENCE);
	});

	app.get('/robots.txt', require('./robots.js').bind(null, app));



	/*
	*	util
	*/

	app.get(':noTrailingSlash/', function(req, res) {
		res.redirect(301, req.params.noTrailingSlash);
	});



	/*
	*	sitemaps
	*/

	var sitemapsRouter = require('./sitemaps')(app, express);
	app.use('/sitemaps', sitemapsRouter);



	/*
	*	general
	*/

	app.get('/search', require(global.paths.getRoute('search')));




	/*
	*	Data Import
	*/

	var dataRouter = require('./data')(app, express);
	app.use('/data', dataRouter);






	/*
	*	Facilities
	*/

	var providersRouter = require('./providers')(app, express);
	app.use('/providers', providersRouter);




	/*
	*	Statistics
	*/

	app.get('/statistics.html', require(global.paths.getRoute('stats/nation')));
	app.get('/:stateSlug([a-z-]+)/statistics.html', require(global.paths.getRoute('stats/state')));
	app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)/statistics.html', require(global.paths.getRoute('stats/city')));



	/*
	*	Jobs
	*/

	app.get('/jobs.html', require(global.paths.getRoute('jobs/nation')));
	app.get('/:stateSlug([a-z-]+)/jobs.html', require(global.paths.getRoute('jobs/state')));
	app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)/jobs.html', require(global.paths.getRoute('jobs/city')));



	/*
	*	Browse Providers
	*/

	app.get('/', require(global.paths.getRoute('home')));
	app.get('/:stateSlug([a-z-]+)', require(global.paths.getRoute('browse/state.js')));
	app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)', require(global.paths.getRoute('browse/city.js')));



	/*
	*	Redirects
	*/

	// for css maps
	app.get('/:remap(public|bower_components)/:path(*)', function(req, res) {
		res.redirect(302, '/' + req.params.path);
	});






	function dumpRoute(req, res) {
		res.send(req.params);
	}
};
