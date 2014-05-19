'use strict';

module.exports = function(app, express) {



	var dataRouter = require('./data')(app, express);
	app.use('/data', dataRouter);


	app.get('/', require(GLOBAL.paths.getRoute('home')));


	app.get('/:stateSlug', require(GLOBAL.paths.getRoute('browse/state.js')));
	// app.get('/:stateSlug/:citySlug', require(GLOBAL.paths.getRoute('browse')));
	

	var providersRouter = require('./providers')(app, express);
	app.use('/providers', providersRouter);



	// for css maps
	app.get('/:remap(public|bower_components)/:path(*)', function(req, res) {
		res.redirect(302, '/' + req.params.path);
	});


	return;
};
