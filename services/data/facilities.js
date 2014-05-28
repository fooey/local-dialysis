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

const statesJson = require(GLOBAL.paths.getData('states'));

const stringSvc = require(GLOBAL.paths.getService('string'));
const referenceData = require(GLOBAL.paths.getService('data/reference'));



var tableColumns = [
	{name: "id", define: 'id TEXT PRIMARY KEY', bind: '$id' },
	{name: "altId", define: 'altId TEXT', bind: '$altId' },
	{name: "altId2", define: 'altId2 TEXT', bind: '$altId2' },
	{name: "altId3", define: 'altId3 TEXT', bind: '$altId3' },

	{name: "name", define: 'name TEXT NOT NULL', bind: '$name' },
	{name: "phone", define: 'phone TEXT', bind: '$phone' },
	{name: "address", define: 'address TEXT', bind: '$address' },
	{name: "address2", define: 'address2 TEXT', bind: '$address2' },

	{name: "stateCode", define: 'stateCode TEXT', bind: '$stateCode' },
	{name: "state", define: 'state TEXT', bind: '$state' },
	{name: "county", define: 'county TEXT', bind: '$county' },
	{name: "city", define: 'city TEXT', bind: '$city' },
	{name: "zip", define: 'zip TEXT', bind: '$zip' },

	{name: "slug", define: 'slug TEXT NOT NULL', bind: '$slug' },
	{name: "stateSlug", define: 'stateSlug TEXT', bind: '$stateSlug' },
	{name: "citySlug", define: 'citySlug TEXT', bind: '$citySlug' },
	{name: "countySlug", define: 'countySlug TEXT', bind: '$countySlug' },

	{name: "locationLat", define: 'locationLat REAL', bind: '$locationLat' },
	{name: "locationLon", define: 'locationLon REAL', bind: '$locationLon' },

	{name: "numStations", define: 'numStations INTEGER', bind: '$numStations' },

	{name: "offersLate", define: 'offersLate INTEGER', bind: '$offersLate' }, //bool
	{name: "offersHemo", define: 'offersHemo INTEGER', bind: '$offersHemo' }, //bool
	{name: "offersPeri", define: 'offersPeri INTEGER', bind: '$offersPeri' }, //bool
	{name: "offersTraining", define: 'offersTraining INTEGER', bind: '$offersTraining' }, //bool
	{name: "forProfit", define: 'forProfit INTEGER', bind: '$forProfit' }, //bool
	{name: "isChain", define: 'isChain INTEGER', bind: '$isChain' }, //bool

	{name: "networkId", define: 'networkId INTEGER', bind: '$networkId' }, //fk
	{name: "chainId", define: 'chainId INTEGER', bind: '$chainId' }, //fk
	{name: "ownerId", define: 'ownerId INTEGER', bind: '$ownerId' }, //fk
	{name: "payReductId", define: 'payReductId INTEGER', bind: '$payReductId' },

	{name: "performanceScore", define: 'performanceScore INTEGER', bind: '$performanceScore' },
	{name: "vascularScore", define: 'vascularScore INTEGER', bind: '$vascularScore' },
	{name: "ichScore", define: 'ichScore INTEGER', bind: '$ichScore' },
	{name: "nhsnScore", define: 'nhsnScore INTEGER', bind: '$nhsnScore' },
	{name: "mineralScore", define: 'mineralScore INTEGER', bind: '$mineralScore' },

	{name: "hospitalizationRatio", define: 'hospitalizationRatio REAL', bind: '$hospitalizationRatio' },
	{name: "hospitalizationId", define: 'hospitalizationId INTEGER', bind: '$hospitalizationId' },

	{name: "mortalityRatio", define: 'mortalityRatio REAL', bind: '$mortalityRatio' },
	{name: "mortalityId", define: 'mortalityId INTEGER', bind: '$mortalityId' },

	{name: "certificationDate", define: 'certificationDate TEXT', bind: '$certificationDate' }, //date
];



/*
*
*	Public Methods
*
*/

me.init = function(fnCallback) {
	console.log('facilities::init()');

	async.series([
		createTables,
		populateTables,
		// checkTables,
	], function(err, results) {
		// console.log('init', results),
		fnCallback(err);
	});
}



me.get = function getTotals(filters, fnCallback) {
	console.log('data::facilites::get', filters);

	filters = _.defaults(filters, {});

	var params = {};
	var where = [];
	var having = [];
	var limit = '';

	if (filters.stateSlug) {
		where.push('stateSlug = $stateSlug');
		params.$stateSlug = filters.stateSlug;
	}


	if (_.has(filters, 'offersLate')) {
		where.push('offersLate = $offersLate');
		params.$offersLate = filters.offersLate;
	}
	if (_.has(filters, 'offersPeri')) {
		where.push('offersPeri = $offersPeri');
		params.$offersPeri = filters.offersPeri;
	}
	if (_.has(filters, 'offersTraining')) {
		where.push('offersTraining = $offersTraining');
		params.$offersTraining = filters.offersTraining;
	}
	if (_.has(filters, 'offersLate')) {
		where.push('offersLate = $offersLate');
		params.$offersLate = filters.offersLate;
	}
	if (_.has(filters, 'forProfit')) {
		where.push('forProfit = $forProfit');
		params.$forProfit = filters.forProfit;
	}
	if (_.has(filters, 'isChain')) {
		where.push('isChain = $isChain');
		params.$isChain = filters.isChain;
	}


	if (_.has(filters, 'perPage')) {
		limit = 'LIMIT $perPage';
		params.$perPage = filters.perPage;

		if (_.has(filters, 'startRow')) {
			limit += ' OFFSET $startRow';
			params.$startRow = filters.startRow;
		}
	}


	var statement = [
		'SELECT *',
		'FROM facilities AS f',
		(where.length) ? 'WHERE ' + where.join(' and ') : '',
		(having.length) ? 'HAVING ' + having.join(' and ') : '',
		'ORDER BY name',
		(limit.length) ? limit : '',
	].join(' ');

	console.log(statement);
	console.log(params);

	db.all(statement, params, fnCallback);
};



/*
*
*	Private Methods
*
*/

function createTables(fnCallback) {
	console.log('facilities::createTables()');

	var columns = _.map(tableColumns, function(val, index) {
		return val.define;
	}).join(', ');

	var createTable = [
		'DROP TABLE IF EXISTS facilities',
		util.format('CREATE TABLE facilities (%s)', columns),
		'CREATE INDEX IF NOT EXISTS IX_id ON facilities(id)',
		'CREATE INDEX IF NOT EXISTS IX_stateSlug_citySlug ON facilities(stateSlug, citySlug)',
		'CREATE INDEX IF NOT EXISTS IX_zip ON facilities(zip, name)',
		// 'CREATE INDEX IF NOT EXISTS IX_name ON facilities(name)',
		// 'CREATE INDEX IF NOT EXISTS IX_stateSlug ON facilities(stateSlug, name)',
		// 'CREATE INDEX IF NOT EXISTS IX_stateSlug_countySlug ON facilities(stateSlug, countySlug)',
	].join('; ');
	// console.log(createTable);
	db.exec(createTable, function(err) {
		if (err) throw (err);
		fnCallback(err);
	});
}



function populateTables(fnCallback) {
	console.log('facilities::populateTables()');

	const facilitiesPath = GLOBAL.paths.getData('/medicare/facilities');
	var facilitiesData = require(GLOBAL.paths.getData('medicare/merged.json'));

	var facilityIds = _.keys(facilitiesData);

	// facilityIds = _.filter(facilityIds, function(val, index) {
	// 	return index < 10;
	// });

	// console.log(facilityIds);

	var columns = _.map(tableColumns, function(val, index) {
		return val.bind;
	}).join(', ');


	var sqlInsert = util.format("INSERT INTO facilities VALUES (%s)", columns);

	async.each(
		facilityIds,
		function(facilityId, nextFacility) {
			var facilityData = facilitiesData[facilityId];
			var params = {};

			async.parallel({
				'setSimples': function(onSetComplete) {
					params.$id = facilityId;
					params.$altId = facilityData.alternateccn;
					params.$altId2 = facilityData.alternate_ccn_2;
					params.$altId3 = facilityData.alternate_ccn_3;

					params.$name = (facilityData.facility_name) ? stringSvc.toTitleCase(facilityData.facility_name) : null;
					params.$phone = facilityData.phone_number.phone_number;
					params.$address = (facilityData.address_line_1) ? stringSvc.toTitleCase(facilityData.address_line_1) : null;
					params.$address2 = (facilityData.address_line_2) ? stringSvc.toTitleCase(facilityData.address_line_2) : null;

					params.$stateCode = statesJson[facilityData.state].abbr;
					params.$state = statesJson[facilityData.state].name;
					params.$county = (facilityData.county) ? stringSvc.toTitleCase(facilityData.county) : null;
					params.$city = (facilityData.city) ? stringSvc.toTitleCase(facilityData.city) : null;
					params.$zip = facilityData.zip;

					params.$slug = stringSvc.getSlug(params.$name);
					params.$stateSlug = statesJson[facilityData.state].slug;
					params.$countySlug = (params.$county) ? stringSvc.getSlug(params.$county) : null;
					params.$citySlug = (params.$city) ? stringSvc.getSlug(params.$city) : null;

					params.$locationLat = facilityData.location.latitude;
					params.$locationLon = facilityData.location.longitude;

					params.$numStations = parseInt(facilityData._of_dialysis_stations);

					params.$offersLate = (!!facilityData.late_shift_) ? 1 : 0;
					params.$offersHemo = (!!facilityData.offers_in_center_hemodialysis) ? 1 : 0;
					params.$offersPeri = (!!facilityData.offers_in_center_peritoneal_dialysis) ? 1 : 0;
					params.$offersTraining = (!!facilityData.offers_home_hemodialysis_training) ? 1 : 0;
					params.$forProfit = (facilityData.profit_or_non_profit_ === 'Profit') ? 1 : 0;
					params.$isChain = (!!facilityData.chain_owned) ? 1 : 0;

					params.$performanceScore = _.parseInt(facilityData.total_performance_score);
					params.$vascularScore = _.parseInt(facilityData.vascular_access_combined_measure_score);
					params.$ichScore = _.parseInt(facilityData.ich_cahps_admin_score);
					params.$nhsnScore = _.parseInt(facilityData.nhsn_event_reporting_score);
					params.$mineralScore = _.parseInt(facilityData.mineral_metabolism_reporting_score);

					params.$hospitalizationRatio = facilityData.standardized_hospitalization_ratio;
					params.$mortalityRatio = facilityData.standardized_mortality_ratio;

					params.$certificationDate = facilityData.certification_date;

					onSetComplete();
				},
				'setNetwork': setParamFromLookup.bind(null, params, '$networkId', 'networks', _.parseInt(facilityData.network)),
				'setChain': setParamFromLookup.bind(null, params, '$chainId', 'chains', facilityData.chain_organization),
				'setOwner': setParamFromLookup.bind(null, params, '$ownerId', 'owners', facilityData.ownership_as_of_december_31_2012),
				'setPayReduct': setParamFromLookup.bind(null, params, '$payReductId', 'paymentReductions', facilityData.py2014_payment_reduction_percentage),
				'setHospitalizationText': setParamFromLookup.bind(null, params, '$hospitalizationId', 'texts', facilityData.patient_hospitalization_category_text),
				'setMortalityText': setParamFromLookup.bind(null, params, '$mortalityId', 'texts', facilityData.patient_survival_category_text),
			}, function() {
				db.run(sqlInsert, params, nextFacility);
			});

		},
		fnCallback
	);
}



function setParamFromLookup(params, paramName, tableName, lookupVal, fnCallback) {
	referenceData.get(
		tableName,
		lookupVal,
		function(result) {
			params[paramName] = (result) ? result.id : null;
			fnCallback();
		}
	);
}



function checkTables(fnCallback) {
	console.log('facilities::checkTables()');
	var sqlSelect = util.format("SELECT * FROM facilities AS f WHERE f.state = 'UT' ORDER BY f.id LIMIT 3");

	console.log(sqlSelect);

	db.each(sqlSelect, function(err, row) {
		if (err) throw (err);
		console.log('facility:', row);
	}, fnCallback);
}





			// facility.id = facilityId;
			// delete(facility.provider_number);

			// facility.name = (facility.facility_name) ? titleCase(facility.facility_name) : null;
			// delete(facility.facility_name);

			// facility.address = (facility.address_line_1) ? titleCase(facility.address_line_1) : null;
			// delete(facility.address_line_1);

			// facility.address2 = (facility.address_line_2) ? titleCase(facility.address_line_2) : null;
			// delete(facility.address_line_2);

			// facility.phone = facility.phone_number.phone_number;
			// delete facility.phone_number;

			// facility.city = (facility.city) ? titleCase(facility.city) : null;
			// facility.county = (facility.county) ? titleCase(facility.county) : null;


			// facility.hemo = (!!facility.offers_in_center_hemodialysis) ? 1 : 0;
			// delete facility.offers_in_center_hemodialysis;

			// facility.peri = (!!facility.offers_in_center_peritoneal_dialysis) ? 1 : 0;
			// delete facility.offers_in_center_peritoneal_dialysis;

			// facility.training = (!!facility.offers_home_hemodialysis_training) ? 1 : 0;
			// delete facility.offers_home_hemodialysis_training;

			// facility.isChain = (!!facility.chain_owned) ? 1 : 0;
			// delete facility.chain_owned;

			// facility.isLate = (!!facility.late_shift_) ? 1 : 0;
			// delete facility.late_shift_;

			// facility.isProfit = (facility.profit_or_non_profit_ === 'Profit') ? 1 : 0;
			// delete facility.profit_or_non_profit_;


			// facility.chain = (facility.chain_organization) ? titleCase(facility.chain_organization) : null;
			// delete facility.chain_organization;

			// if (facility.ownership_as_of_december_31_2012 === 'OTHER CHAIN(number of facilities <20 )') {
			// 	facility.owner = 'Other Chain (number of facilities <20)';
			// }
			// else {
			// 	facility.owner = (facility.ownership_as_of_december_31_2012) ? titleCase(facility.ownership_as_of_december_31_2012) : null;
			// }
			// delete facility.ownership_as_of_december_31_2012;


			// facility.reduction = facility.py2014_payment_reduction_percentage;
			// delete facility.py2014_payment_reduction_percentage;

			// facility.altId = facility.alternateccn;
			// delete facility.alternateccn;

			// facility.altId2 = facility.alternate_ccn_2;
			// delete facility.alternate_ccn_2;

			// facility.altId3 = facility.alternate_ccn_3;
			// delete facility.alternate_ccn_3;


			// facility.slug = getSlug(facility.name);
			// facility.citySlug = getSlug(facility.city);
			// facility.countySlug = getSlug(facility.county);


			// facility.location = [
			// 	facility.location.latitude,
			// 	facility.location.longitude,
			// ];

			// _.forEach(facilitySvc.keyMap, function(keyGroup, kgKey) {
			// 	facility[kgKey] = [];

			// 	_.forEach(keyGroup, function(index, key) {
			// 		var val = facility[key];

			// 		if (kgKey === 'categories') {
			// 			if (facility[key]) {
			// 				var val = _.indexOf(categories, facility[key]);
			// 				if (val === -1) {
			// 					val = categories.push(facility[key]);
			// 				}
			// 			}
			// 			else {
			// 				val = null;
			// 			}
			// 		}
			// 		if (kgKey === 'data') {
			// 			val = parseFloat(val);
			// 		}

			// 		facility[kgKey][index] = val;
			// 		delete facility[key];

			// 	});

			// });


			// let facilityPath = path.join(facilitiesPath, facilityId + '.json');
			// facilities.push(facility);

			// fsLib.writeJson(facilityPath, facility, callback);