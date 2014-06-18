'use strict';

module.exports = function(app, express) {

	var dumpRoute = function(req, res) {
		res.send(req.params);
	}
	



	/*
	*	Dev
	*/

	app.get('/globals', function(req, res) {
		res.send(GLOBAL.DATA.REFERENCE);
	});
	



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
	*	Browse
	*/


	app.get('/:stateSlug([a-z-]+)/:subSlug([a-z-]+).html', dumpRoute);
	app.get('/:stateSlug([a-z-]+)', require(GLOBAL.paths.getRoute('browse/state.js')));

	// app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)/:subSlug([a-z-]+).html', dumpRoute);
	app.get('/:stateSlug([a-z-]+)/:citySlug([a-z-]+)', require(GLOBAL.paths.getRoute('browse/city.js')));
	



	/*
	*	Home
	*/

	app.get('/', require(GLOBAL.paths.getRoute('home')));



	/*
	*	Redirects
	*/

	// for css maps
	app.get('/:remap(public|bower_components)/:path(*)', function(req, res) {
		res.redirect(302, '/' + req.params.path);
	});


	return;
};
