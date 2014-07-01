'use strict';

module.exports = function(app, express) {
	



	/*
	*	system
	*/

	app.get('/globals', function(req, res) {
		res.send(GLOBAL.DATA.REFERENCE);
	});

	app.get('/robots.txt', require('./robots.js').bind(null, app));
	



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

	app.get('/statistics.html', require(GLOBAL.paths.getRoute('stats/nation')));
	app.get('/:stateSlug([a-z-]+)/statistics.html', require(GLOBAL.paths.getRoute('stats/state')));
	app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)/statistics.html', require(GLOBAL.paths.getRoute('stats/city')));



	/*
	*	Jobs
	*/

	app.get('/jobs.html', require(GLOBAL.paths.getRoute('jobs/nation')));
	app.get('/:stateSlug([a-z-]+)/jobs.html', require(GLOBAL.paths.getRoute('jobs/state')));
	app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)/jobs.html', require(GLOBAL.paths.getRoute('jobs/city')));



	/*
	*	Browse Providers
	*/

	app.get('/', require(GLOBAL.paths.getRoute('home')));
	app.get('/:stateSlug([a-z-]+)', require(GLOBAL.paths.getRoute('browse/state.js')));
	app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)', require(GLOBAL.paths.getRoute('browse/city.js')));




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
