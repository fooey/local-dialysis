"use strict";

/*
*	http://hostname/data
*/

module.exports = function(app, express) {
	var router = express.Router();

	if (process.env.NODE_ENV !== 'development') {
		router.get('/*', function(req, res) {
			res.status(403).send('Resource Forbidden');
		});
	}
	else {
		router.get('/', function(req, res) {
			const configData = require(GLOBAL.paths.getData('config.json'));
			res.json(configData);
		});
		router.get('/get', require(GLOBAL.paths.getRoute('data/get.js')));
		router.get('/generate', require(GLOBAL.paths.getRoute('data/generate.js')));
	}


	return router;
};

