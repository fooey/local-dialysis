'use strict';

module.exports = function(app, express) {

	app.get('/', require(GLOBAL.paths.getRoute('home')));


	var dataRouter = require('./data')(app, express);
	app.use('/data', dataRouter);
	

	var providersRouter = require('./providers')(app, express);
	app.use('/providers', providersRouter);


	app.get('/:stateSlug', require(GLOBAL.paths.getRoute('browse')));
	app.get('/:stateSlug/:citySlug', require(GLOBAL.paths.getRoute('browse')));


	return;
};
