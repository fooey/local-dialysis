'use strict';

const dataGetter = require(GLOBAL.paths.getService('data/get'));


module.exports = function(req, res, next) {

	dataGetter(function(err) {
		res.send('get complete ' + Date.now());
	});

};

