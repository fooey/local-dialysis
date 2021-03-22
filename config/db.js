'use strict';

module.exports = function(environment) {
	var sqlite3 = require('sqlite3');
	var config = [
		'PRAGMA synchronous = off',
		'PRAGMA read_uncommitted = true',
		'PRAGMA journal_mode = off',
	];


	// var storage = ':memory:';
	var storage = global.paths.getData('sqlite.bin');
	// if (environment === 'development') {
	// 	storage = global.paths.getData('sqlite.bin');
	// }


	var db = new sqlite3.Database(storage);

	db.exec(config.join(';'));

	db.each('SELECT sqlite_version() AS version', function(err, row) {
		console.log(Date.now(), 'SQLite v' + row.version);
	});

	return db;
};
