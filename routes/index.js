'use strict';


module.exports = function(app, express) {

	app.get('/', require('./home'));

	app.get('/providers/:facilitySlug.:subSlug?.:facilityId.html', require('./facility'));

	app.get('/:stateSlug', require('./browse'));
	app.get('/:stateSlug/:citySlug', require('./browse'));


	app.get('/data', require('./data.js'));
};
