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

var db = global.DATABASE;

const util = require('util');

const _ = require('lodash');
const async = require('async');

const stringSvc = require(global.paths.getService('string'));
const arraySvc = require(global.paths.getService('array'));



/*
*
*	Public Variables
*
*/

me.referenceTableMeta = {
	"networks": {
		"type": "networks",
		"dataType": "int",
		"src": "network",
	},
	"chains": {
		"type": "chains",
		"dataType": "string",
		"src": "chain_organization",
		"useLabel": true,
	},
	"owners": {
		"type": "owners",
		"dataType": "string",
		"src": "ownership_as_of_december_31_2012",
		"useLabel": true,
	},
	"paymentReductions": {
		"type": "paymentReductions",
		"dataType": "string",
		"src": "py2014_payment_reduction_percentage",
	},
	"texts": {
		"type": "texts",
		"dataType": "string",
		"src": [
			"patient_transfusion_category_text",
			"patient_hospitalization_category_text",
			"patient_survival_category_text"
		],
	},
	"applies": {
		"type": "applies",
		"dataType": "string",
		"src": [
			"hemoglobin_12_g_dl_performance_score_applied",
			"urr_performance_score_applied",
			"fistula_performance_score_applied",
			"catheter_performance_score_applied",
		],
	},
	"codes": {
		"type": "codes",
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
		"useLabel": true,
	},
};




/*
*
*	Private Variables
*
*/

var codeFootnotes = {
	"001": null,
	"199": "The number of patients is too small to report. Call the facility to discuss this quality measure.",
	"201": "Data not reported – Call the facility to discuss this quality measure.",
	"255": "CMS determined that the percentage was not accurate.",
	"258": "The facility was not open for the entire reporting period.",
	"256": "The facility does not provide hemodialysis.",
	"254": "The facility does not provide hemodialysis to pediatric patients.",
	"257": "The facility does not provide peritoneal dialysis.",
};



/*
*
*	Public Methods
*
*/

me.init = function(fnCallback) {
	async.series([
		generateData, // sets global
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
	async.detect(
		global.DATA.REFERENCE[tableName],
		function(record, fn) {
			fn(record.val === lookupVal);
		},
		fnCallback
	);
}



me.setGlobals = function(fnCallback) {
	global.DATA.REFERENCE = {};

	console.log('data::reference::setGlobals');

	async.each(
		_.keys(me.referenceTableMeta),
		function(tableName, nextTable) {
			var rtMeta = me.referenceTableMeta[tableName];

			var select = util.format("SELECT * FROM %s", tableName);

			db.all(
				select,
				function(err, results) {
					global.DATA.REFERENCE[tableName] = results;
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
	var facilityData = require(global.paths.getData('medicare/merged.json'));
	var tables = {};

	async.each(
		_.keys(me.referenceTableMeta),
		function(rtKey, fnEach) {
			var rtMeta = me.referenceTableMeta[rtKey];
			buildReferenceTable(rtMeta, rtMeta.src, function(err, data) {
				// console.log(rtKey, data);
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
					*	SET global VARIABLE
					*/
					global.DATA.REFERENCE = tables;

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
			var tableData = global.DATA.REFERENCE[tableName];
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
		// _.keys(global.DATA.REFERENCE),
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


function buildReferenceTable(meta, column, fnCallback) {

	if (_.isArray(column)) {
		async.concat(
			column,
			buildReferenceTable.bind(null, meta),
			function(err, result) {
				arraySvc.sort(
					_.uniq(result),
					meta.dataType,
					fnCallback
				);
			}
		);
	}
	else {
		// console.log('reference:buildReferenceTable()', column);

		var facilities = require(global.paths.getData('medicare/merged.json'));
		var table = [];

		async.each(
			_.keys(facilities),
			function(facilityId, cbEach) {
				var thisVal = facilities[facilityId][column] || null;

				if (meta.dataType === 'int') {
					thisVal = _.parseInt(thisVal);
				}
				else if (meta.dataType === 'float') {
					thisVal = parseFloat(thisVal);
				}

				if ((meta.dataType === 'int' || meta.dataType === 'float') && _.isNaN(thisVal)) {
					thisVal = null;
				}

				if (typeof thisVal === 'string' && (_.isEmpty(thisVal) || thisVal.toUpperCase() === 'N/A' || thisVal.toUpperCase() === 'NOT AVAILABLE')) {
					thisVal = null;
				}

				if (!_.contains(table, thisVal)) {
					table.push(thisVal);
					// sortArray(table, meta.dataType, cbEach);
				}
				cbEach();
			},
			function(err) {
				arraySvc.sort(table, meta.dataType, fnCallback);
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
			if (meta.type === 'codes') {
				row.label = codeFootnotes[val];
			}
			else {
				row.label = stringSvc.toTitleCase(val);
			}
		}

		return row;
	});

	fnCallback(null, table);
}
