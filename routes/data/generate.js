'use strict';

const dataGenerator = require(GLOBAL.paths.getService('data/generate'));



module.exports = function(req, res, next) {

	dataGenerator(function(err) {
		res.send('generation complete ' + Date.now());
	});


};
