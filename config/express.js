'use strict';

module.exports = function(app, express) {

	/*
	*
	* Middleware
	*
	*/

	const morgan = require('morgan');
	const errorHandler = require('errorhandler');
	const favicon = require('serve-favicon');


	if (app.get('env') === 'development') {
		app.use(errorHandler({ dumpExceptions: true, showStack: true }));
		app.locals.pretty = true;
		app.use(morgan('dev'));
	}
	else {
		app.use(errorHandler());
		app.use(morgan());
	}

	// all environments
	app.set('port', process.env.PORT || 3003);
	app.set('views', GLOBAL.paths.getView());
	app.set('view engine', 'jade');



	app.use(
		favicon(GLOBAL.paths.getPublic('img/favicon.ico'))
	);





	var staticOptions = {
		maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
	};

	app.use(
		express.static(GLOBAL.paths.getPublic(), staticOptions)
	);
	app.use(
		express.static(GLOBAL.paths.getBower(), staticOptions)
	);
};

