'use strict';

module.exports = function(app, express) {

	app.set('env', (process.env.NODE_ENV === 'development') ? 'development' : 'production');


	/*
	*
	* Middleware
	*
	*/

	const morgan = require('morgan');
	const errorHandler = require('errorhandler');
	const compression = require('compression');
	const slashes = require('connect-slashes');

	if (app.get('env') === 'development') {
		app.use(errorHandler({ dumpExceptions: true, showStack: true }));
		app.locals.pretty = true;
		app.use(morgan('dev'));
		app.set('view cache', false);
	}
	else {
		app.use(errorHandler());
		app.use(morgan());
		app.set('view cache', true);
	}

	// all environments
	app.use(compression());
	app.use(slashes(false)); // no trailing slashes

	app.set('port', process.env.PORT || 3003);
	app.set('views', GLOBAL.paths.getView());
	app.set('view engine', 'jade');



	const favicon = require('serve-favicon');
	app.use(
		favicon(GLOBAL.paths.getPublic('img/favicon.ico'))
	);


	const cookieParser = require('cookie-parser');
	app
		.use(cookieParser('optional secret string'))
		.use(function(req, res, next) {
			var uid = req.cookies.uid;

			if (!uid) {
				uid = require('uuid').v4();

	 			const cookieMaxAge = 1000 * 60 * 60 * 24 * 356 * 2; // 2 years
				res.cookie('uid', uid, { maxAge: cookieMaxAge, httpOnly: true});
			}

			next();
		});






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

