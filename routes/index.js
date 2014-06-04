'use strict';

module.exports = function(app, express) {

	var dumpRoute = function(req, res) {
		res.send(req.params);
	}
	



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
	*	Browse
	*/

	app.get('/:stateSlug/:subSlug.html', dumpRoute);
	app.get('/:stateSlug', require(GLOBAL.paths.getRoute('browse/state.js')));

	app.get('/:stateSlug/:citySlug/:subSlug.html', dumpRoute);
	app.get('/:stateSlug/:citySlug', require(GLOBAL.paths.getRoute('browse/city.js')));
	



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
