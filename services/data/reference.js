"use strict";

/*
*
*	Export
*
*/

var me = module.exports = {};



/*
*
*	Dependencies
*
*/

var db = GLOBAL.DATABASE;

const util = require('util');

const _ = require('lodash');
const async = require('async');

const stringSvc = require(GLOBAL.paths.getService('string'));
const arraySvc = require(GLOBAL.paths.getService('array'));



/*
*
*	Public Variables
*
*/

me.referenceTableMeta = {
	"networks": {
		"dataType": "int",
		"src": "network",
	},
	"chains": {
		"dataType": "string",
		"src": "chain_organization",
		"useLabel": true,
	},
	"owners": {
		"dataType": "string",
		"src": "ownership_as_of_december_31_2012",
		"useLabel": true,
	},
	"paymentReductions": {
		"dataType": "string",
		"src": "py2014_payment_reduction_percentage",
	},
	"texts": {
		"dataType": "string",
		"src": [
			"patient_transfusion_category_text",
			"patient_hospitalization_category_text",
			"patient_survival_category_text"
		],
	},
	"applies": {
		"dataType": "string",
		"src": [
			"hemoglobin_12_g_dl_performance_score_applied",
			"urr_performance_score_applied",
			"fistula_performance_score_applied",
			"catheter_performance_score_applied",
		],
	},
	"codes": {
		"dataType": "string",
		"src": [
			"hgb_10_data_availability_code",
			"hgb_12_data_availability_code",
			"patient_transfusion_data_availability_code",
			"urr_data_availability_code",
			"adult_hd_kt_v_data_availability_code",
			"adult_pd_kt_v_data_availability_code",
			"pediatric_hd_kt_v_data_availability_code",
			"arteriovenous_fistulae_in_place_data_availability_code",
			"vascular_catheter_data_availability_code",
			"hypercalcemia_data_availability_code",
			"serum_phosphorus_data_availability_code",
			"patient_hospitalization_data_availability_code",
			"patient_survival_data_availability_code",
		],
	},
};



/*
*
*	Public Methods
*
*/

me.init = function(fnCallback) {
	async.series([
		generateData, // sets GLOBAL
		createTables,
		populateTables,
		// me.setGlobals,
		// checkTables,
	], function(err, results) {
		// console.log('init', results),
		fnCallback(err);
	});
}



me.get = function(tableName, lookupVal, fnCallback) {
	if (_.isNull(lookupVal)) {
		fnCallback(null);
	}
	else {
		async.detect(
			GLOBAL.DATA.REFERENCE[tableName],
			function(record, fn) {
				fn(record.val === lookupVal);
			},
			fnCallback
		);
	}
}



me.setGlobals = function(fnCallback) {
	GLOBAL.DATA.REFERENCE = {};

	console.log('data::reference::setGlobals');

	async.each(
		_.keys(me.referenceTableMeta),
		function(tableName, nextTable) {
			var rtMeta = me.referenceTableMeta[tableName];

			var select = util.format("SELECT * FROM %s", tableName);

			db.all(
				select,
				function(err, results) {
					GLOBAL.DATA.REFERENCE[tableName] = results;
					nextTable();
				}
			);
		},
		fnCallback
	);

};


/*
*
*	Private Methods
*
*/

function generateData(fnCallback) {
	var facilityData = require(GLOBAL.paths.getData('medicare/merged.json'));
	var tables = {};

	async.each(
		_.keys(me.referenceTableMeta),
		function(rtKey, fnEach) {
			var rtMeta = me.referenceTableMeta[rtKey];
			buildReferenceTable(rtMeta.dataType, rtMeta.src, function(err, data) {
				tables[rtKey] = data;
				fnEach();
			});
		},
		function(err) {

			async.each(
				_.keys(tables),
				function(tableName, fnEach) {
					arrayToTable(
						tables[tableName],
						me.referenceTableMeta[tableName],
						function(err, table) {
							tables[tableName] = table;
							fnEach();
						}
					);
				},
				function(err) {

					/*
					*	SET GLOBAL VARIABLE
					*/
					GLOBAL.DATA.REFERENCE = tables;

					fnCallback(null);
				}
			);

		}
	);
}



function createTables(fnCallback) {
	console.log('reference::createTables()');

	async.each(
		_.keys(me.referenceTableMeta),
		function(tableName, nextTable) {
			var rtMeta = me.referenceTableMeta[tableName];
			var tableDefinition = 'id INTEGER PRIMARY KEY, val TEXT';
			if (rtMeta.useLabel) {
				tableDefinition += ', label TEXT';
			}

			var create = util.format("DROP TABLE IF EXISTS %s; CREATE TABLE %s (%s)", tableName, tableName, tableDefinition);

			db.exec(
				create,
				nextTable
			);
		},
		fnCallback
	);
}



function populateTables(fnCallback) {
	console.log('reference::populateTables()');

	async.each(
		_.keys(me.referenceTableMeta),
		function(tableName, nextTable) {
			var tableData = GLOBAL.DATA.REFERENCE[tableName];
			var rtMeta = me.referenceTableMeta[tableName];

			var insert = (rtMeta.useLabel)
				? util.format("INSERT INTO %s VALUES (?, ?, ?)", tableName)
				: util.format("INSERT INTO %s VALUES (?, ?)", tableName);

			async.each(
				tableData,
				function(record, nextRecord) {
					var args = [];
					if (rtMeta.useLabel) {
						db.run(insert, record.id, record.val, record.label, nextRecord);
					}
					else {
						db.run(insert, record.id, record.val, nextRecord);
					}
				},
				nextTable
			);
		},
		fnCallback
	);
}



function checkTables(fnCallback) {
	console.log('reference::checkTables()');

	async.each(
		// _.keys(GLOBAL.DATA.REFERENCE),
		['owners'],
		function(tableName, cbEach) {
			var select = util.format("SELECT * FROM %s ORDER BY id", tableName);

			db.all(select, function(err, rows) {
				console.log(tableName, rows);
				cbEach();
			});
		},
		fnCallback
	);
}


function buildReferenceTable(dataType, column, fnCallback) {
	if (_.isArray(column)) {
		async.concat(
			column,
			buildReferenceTable.bind(null, dataType),
			function(err, result) {
				arraySvc.sort(
					_.uniq(result),
					dataType,
					fnCallback
				);
			}
		);
	}
	else {
		var facilities = require(GLOBAL.paths.getData('medicare/merged.json'));
		var table = [];

		async.each(
			_.keys(facilities),
			function(facilityId, cbEach) {
				var thisVal = facilities[facilityId][column] || null;

				if (dataType === 'int') {
					thisVal = _.parseInt(thisVal);
				}
				else if (dataType === 'float') {
					thisVal = parseFloat(thisVal);
				}

				if ((dataType === 'int' || dataType === 'float') && _.isNaN(thisVal)) {
					thisVal = null;
				}

				if (!_.isNull(thisVal) && !_.contains(table, thisVal)) {
					table.push(thisVal);
					// sortArray(table, dataType, cbEach);
				}
				cbEach();
			},
			function(err) {
				arraySvc.sort(table, dataType, fnCallback);
				// fnCallback(err, table);
			}
		);

	}
}



function arrayToTable(array, meta, fnCallback) {
	var table = _.map(array, function(val, index) {
		var row = {
			id: index + 1,
			val: val,
		};
		if (meta.useLabel) {
			row.label = stringSvc.toTitleCase(val);
		}

		return row;
	});

	fnCallback(null, table);
}