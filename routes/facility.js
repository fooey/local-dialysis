'use strict';

module.exports = function(req, res, next) {
	res.json(req.params);
};
