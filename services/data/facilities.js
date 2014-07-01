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

const common = require('./common.js');


const statesJson = require(GLOBAL.paths.getData('states'));

const stringSvc = require(GLOBAL.paths.getService('string'));
const referenceSvc = require(GLOBAL.paths.getService('data/reference'));



const facilityColumnsConfig = [
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

	{name: "performanceScore", define: 'performanceScore INTEGER', bind: '$performanceScore' },
];

const statColumnsConfig = [
	{name: "id", define: 'id TEXT PRIMARY KEY', bind: '$id' },

	{name: "certification_date", define: "certification_date TEXT", bind: "$certification_date"},
	{name: "claims_date", define: "claims_date TEXT", bind: "$claims_date"},
	{name: "mineral_and_bone_disorder_date", define: "mineral_and_bone_disorder_date TEXT", bind: "$mineral_and_bone_disorder_date"},
	{name: "date_of_ownership_record_update", define: "date_of_ownership_record_update TEXT", bind: "$date_of_ownership_record_update"},
	{name: "strr_date", define: "strr_date TEXT", bind: "$strr_date"},
	{name: "smr_date", define: "smr_date TEXT", bind: "$smr_date"},
	{name: "shr_date", define: "shr_date TEXT", bind: "$shr_date"},

	{name: "hgb_10_data_availability_code", define: "hgb_10_data_availability_code INTEGER", bind: "$hgb_10_data_availability_code"},
	{name: "percentage_of_medicare_patients_with_hgb_10_g_dl", define: "percentage_of_medicare_patients_with_hgb_10_g_dl INTEGER", bind: "$percentage_of_medicare_patients_with_hgb_10_g_dl"},

	{name: "hgb_12_data_availability_code", define: "hgb_12_data_availability_code INTEGER", bind: "$hgb_12_data_availability_code"},
	{name: "percentage_of_medicare_patients_with_hgb_12_g_dl", define: "percentage_of_medicare_patients_with_hgb_12_g_dl INTEGER", bind: "$percentage_of_medicare_patients_with_hgb_12_g_dl"},

	{name: "number_of_dialysis_patients_with_hgb_data", define: "number_of_dialysis_patients_with_hgb_data INTEGER", bind: "$number_of_dialysis_patients_with_hgb_data"},

	{name: "patient_transfusion_data_availability_code", define: "patient_transfusion_data_availability_code INTEGER", bind: "$patient_transfusion_data_availability_code"},
	{name: "lists_the_facility_s_standardized_transfusion_ratio_facility", define: "lists_the_facility_s_standardized_transfusion_ratio_facility REAL", bind: "$lists_the_facility_s_standardized_transfusion_ratio_facility"},
	{name: "lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr", define: "lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr REAL", bind: "$lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr"},
	{name: "lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr", define: "lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr REAL", bind: "$lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr"},
	{name: "patient_transfusion_category_text", define: "patient_transfusion_category_text INTEGER", bind: "$patient_transfusion_category_text"},
	{name: "lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility", define: "lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility INTEGER", bind: "$lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility"},

	{name: "urr_data_availability_code", define: "urr_data_availability_code INTEGER", bind: "$urr_data_availability_code"},
	{name: "percentage_of_hd_patients_with_urr_65", define: "percentage_of_hd_patients_with_urr_65 INTEGER", bind: "$percentage_of_hd_patients_with_urr_65"},
	{name: "number_of_hd_patients_with_urr_data", define: "number_of_hd_patients_with_urr_data INTEGER", bind: "$number_of_hd_patients_with_urr_data"},

	{name: "adult_hd_kt_v_data_availability_code", define: "adult_hd_kt_v_data_availability_code INTEGER", bind: "$adult_hd_kt_v_data_availability_code"},
	{name: "percent_of_adult_hd_patients_with_kt_v_1_2", define: "percent_of_adult_hd_patients_with_kt_v_1_2 INTEGER", bind: "$percent_of_adult_hd_patients_with_kt_v_1_2"},
	{name: "number_of_adult_hd_patients_with_kt_v_data", define: "number_of_adult_hd_patients_with_kt_v_data INTEGER", bind: "$number_of_adult_hd_patients_with_kt_v_data"},
	{name: "number_of_adult_hd_patient_months_with_kt_v_data", define: "number_of_adult_hd_patient_months_with_kt_v_data INTEGER", bind: "$number_of_adult_hd_patient_months_with_kt_v_data"},

	{name: "adult_pd_kt_v_data_availability_code", define: "adult_pd_kt_v_data_availability_code INTEGER", bind: "$adult_pd_kt_v_data_availability_code"},
	{name: "percentage_of_adult_pd_pts_with_kt_v_1_7", define: "percentage_of_adult_pd_pts_with_kt_v_1_7 INTEGER", bind: "$percentage_of_adult_pd_pts_with_kt_v_1_7"},
	{name: "number_of_adult_pd_patients_with_kt_v_data", define: "number_of_adult_pd_patients_with_kt_v_data INTEGER", bind: "$number_of_adult_pd_patients_with_kt_v_data"},
	{name: "number_of_adult_pd_patient_months_with_kt_v_data", define: "number_of_adult_pd_patient_months_with_kt_v_data INTEGER", bind: "$number_of_adult_pd_patient_months_with_kt_v_data"},
	
	{name: "pediatric_hd_kt_v_data_availability_code", define: "pediatric_hd_kt_v_data_availability_code INTEGER", bind: "$pediatric_hd_kt_v_data_availability_code"},
	{name: "percentage_of_pediatric_hd_patients_with_kt_v_1_2", define: "percentage_of_pediatric_hd_patients_with_kt_v_1_2 INTEGER", bind: "$percentage_of_pediatric_hd_patients_with_kt_v_1_2"},
	{name: "number_of_pediatric_hd_patients_with_kt_v_data", define: "number_of_pediatric_hd_patients_with_kt_v_data INTEGER", bind: "$number_of_pediatric_hd_patients_with_kt_v_data"},
	{name: "number_of_pediatric_hd_patient_months_with_kt_v_data", define: "number_of_pediatric_hd_patient_months_with_kt_v_data INTEGER", bind: "$number_of_pediatric_hd_patient_months_with_kt_v_data"},

	{name: "arteriovenous_fistulae_in_place_data_availability_code", define: "arteriovenous_fistulae_in_place_data_availability_code INTEGER", bind: "$arteriovenous_fistulae_in_place_data_availability_code"},
	{name: "percentage_of_patients_with_arteriovenous_fistulae_in_place", define: "percentage_of_patients_with_arteriovenous_fistulae_in_place INTEGER", bind: "$percentage_of_patients_with_arteriovenous_fistulae_in_place"},

	{name: "vascular_catheter_data_availability_code", define: "vascular_catheter_data_availability_code INTEGER", bind: "$vascular_catheter_data_availability_code"},
	{name: "percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer", define: "percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer INTEGER", bind: "$percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer"},

	{name: "number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries", define: "number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries INTEGER", bind: "$number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries"},
	{name: "number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries", define: "number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries INTEGER", bind: "$number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries"},

	{name: "hypercalcemia_data_availability_code", define: "hypercalcemia_data_availability_code INTEGER", bind: "$hypercalcemia_data_availability_code"},
	{name: "lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility", define: "lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility INTEGER", bind: "$lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility"},
	{name: "lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility", define: "lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility INTEGER", bind: "$lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility"},
	{name: "lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility", define: "lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility INTEGER", bind: "$lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility"},

	{name: "serum_phosphorus_data_availability_code", define: "serum_phosphorus_data_availability_code INTEGER", bind: "$serum_phosphorus_data_availability_code"},
	{name: "lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility", define: "lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility INTEGER", bind: "$lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility"},
	{name: "lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility", define: "lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility INTEGER", bind: "$lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility"},
	{name: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility", define: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility INTEGER", bind: "$lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility"},
	{name: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility", define: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility INTEGER", bind: "$lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility"},
	{name: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility", define: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility INTEGER", bind: "$lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility"},
	{name: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility", define: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility INTEGER", bind: "$lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility"},
	{name: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility", define: "lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility INTEGER", bind: "$lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility"},

	{name: "shr_upper_confidence_limit_95", define: "shr_upper_confidence_limit_95 REAL", bind: "$shr_upper_confidence_limit_95"},
	{name: "smr_upper_confidence_limit_95", define: "smr_upper_confidence_limit_95 REAL", bind: "$smr_upper_confidence_limit_95"},
	{name: "shr_lower_confidence_limit_5", define: "shr_lower_confidence_limit_5 REAL", bind: "$shr_lower_confidence_limit_5"},
	{name: "smr_lower_confidence_limit_5", define: "smr_lower_confidence_limit_5 REAL", bind: "$smr_lower_confidence_limit_5"},

	{name: "patient_hospitalization_data_availability_code", define: "patient_hospitalization_data_availability_code INTEGER", bind: "$patient_hospitalization_data_availability_code"},
	{name: "patient_hospitalization_category_text", define: "patient_hospitalization_category_text INTEGER", bind: "$patient_hospitalization_category_text"},
	{name: "number_of_patients_included_in_hospitalization_summary", define: "number_of_patients_included_in_hospitalization_summary INTEGER", bind: "$number_of_patients_included_in_hospitalization_summary"},
	{name: "standardized_hospitalization_ratio", define: "standardized_hospitalization_ratio REAL", bind: "$standardized_hospitalization_ratio"},

	{name: "patient_survival_data_availability_code", define: "patient_survival_data_availability_code INTEGER", bind: "$patient_survival_data_availability_code"},
	{name: "patient_survival_category_text", define: "patient_survival_category_text INTEGER", bind: "$patient_survival_category_text"},
	{name: "number_of_patients_included_in_survival_summary", define: "number_of_patients_included_in_survival_summary INTEGER", bind: "$number_of_patients_included_in_survival_summary"},
	{name: "standardized_mortality_ratio", define: "standardized_mortality_ratio REAL", bind: "$standardized_mortality_ratio"},

	{name: "hg_12_g_dlmeasurescore", define: "hg_12_g_dlmeasurescore INTEGER", bind: "$hg_12_g_dlmeasurescore"},
	{name: "hg_12_g_dlperformancerate_1", define: "hg_12_g_dlperformancerate_1 INTEGER", bind: "$hg_12_g_dlperformancerate_1"},
	{name: "number_of_hemoglobin_eligible_patients_performance_period", define: "number_of_hemoglobin_eligible_patients_performance_period INTEGER", bind: "$number_of_hemoglobin_eligible_patients_performance_period"},
	{name: "hg_12_g_dlperformancerate_2", define: "hg_12_g_dlperformancerate_2 INTEGER", bind: "$hg_12_g_dlperformancerate_2"},
	{name: "number_of_hemoglobin_eligible_patients_baseline_period", define: "number_of_hemoglobin_eligible_patients_baseline_period INTEGER", bind: "$number_of_hemoglobin_eligible_patients_baseline_period"},
	{name: "hemoglobin_12_g_dl_performance_score_applied", define: "hemoglobin_12_g_dl_performance_score_applied INTEGER", bind: "$hemoglobin_12_g_dl_performance_score_applied"},

	{name: "urr_65_measurescore", define: "urr_65_measurescore INTEGER", bind: "$urr_65_measurescore"},
	{name: "urr_65_performancerate_1", define: "urr_65_performancerate_1 INTEGER", bind: "$urr_65_performancerate_1"},
	{name: "number_of_urr_eligible_patients_performance_period", define: "number_of_urr_eligible_patients_performance_period INTEGER", bind: "$number_of_urr_eligible_patients_performance_period"},
	{name: "urr_65_performancerate_2", define: "urr_65_performancerate_2 INTEGER", bind: "$urr_65_performancerate_2"},
	{name: "number_of_urr_eligible_patients_baseline_period", define: "number_of_urr_eligible_patients_baseline_period INTEGER", bind: "$number_of_urr_eligible_patients_baseline_period"},
	{name: "urr_performance_score_applied", define: "urr_performance_score_applied INTEGER", bind: "$urr_performance_score_applied"},

	{name: "fistula_measure_score", define: "fistula_measure_score INTEGER", bind: "$fistula_measure_score"},
	{name: "fistula_performance_period_rate", define: "fistula_performance_period_rate INTEGER", bind: "$fistula_performance_period_rate"},
	{name: "number_of_fistula_patient_months_performance_period", define: "number_of_fistula_patient_months_performance_period INTEGER", bind: "$number_of_fistula_patient_months_performance_period"},
	{name: "fistula_baseline_period_rate", define: "fistula_baseline_period_rate INTEGER", bind: "$fistula_baseline_period_rate"},
	{name: "number_of_fistula_patient_months_baseline_period", define: "number_of_fistula_patient_months_baseline_period INTEGER", bind: "$number_of_fistula_patient_months_baseline_period"},
	{name: "fistula_performance_score_applied", define: "fistula_performance_score_applied INTEGER", bind: "$fistula_performance_score_applied"},

	{name: "catheter_measure_score", define: "catheter_measure_score INTEGER", bind: "$catheter_measure_score"},
	{name: "catheter_performance_period_rate", define: "catheter_performance_period_rate INTEGER", bind: "$catheter_performance_period_rate"},
	{name: "number_of_catheter_patient_months_performance_period", define: "number_of_catheter_patient_months_performance_period INTEGER", bind: "$number_of_catheter_patient_months_performance_period"},
	{name: "catheter_baseline_period_rate", define: "catheter_baseline_period_rate INTEGER", bind: "$catheter_baseline_period_rate"},
	{name: "number_of_catheter_patient_months_baseline_period", define: "number_of_catheter_patient_months_baseline_period INTEGER", bind: "$number_of_catheter_patient_months_baseline_period"},
	{name: "catheter_performance_score_applied", define: "catheter_performance_score_applied INTEGER", bind: "$catheter_performance_score_applied"},

	{name: "vascular_access_combined_measure_score", define: "vascular_access_combined_measure_score INTEGER", bind: "$vascular_access_combined_measure_score"},
	{name: "ich_cahps_admin_score", define: "ich_cahps_admin_score INTEGER", bind: "$ich_cahps_admin_score"},
	{name: "nhsn_event_reporting_score", define: "nhsn_event_reporting_score INTEGER", bind: "$nhsn_event_reporting_score"},
	{name: "mineral_metabolism_reporting_score", define: "mineral_metabolism_reporting_score INTEGER", bind: "$mineral_metabolism_reporting_score"},
	{name: "total_performance_score", define: "total_performance_score INTEGER", bind: "$total_performance_score"},

	{name: "py2014_payment_reduction_percentage", define: "py2014_payment_reduction_percentage INTEGER", bind: "$py2014_payment_reduction_percentage"},
]



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



me.get = function get(filters, fnCallback) {
	console.log('data::facilites::get', filters);

	filters = _.defaults(filters, {});

	var params = {};
	var where = [];
	var having = [];
	var limit = '';

	if (_.has(filters, 'id')) {
		where.push('f.id = $id');
		params.$id = filters.id;
	}


	if (_.has(filters, 'stateSlug')) {
		where.push('f.stateSlug = $stateSlug');
		params.$stateSlug = filters.stateSlug;
	}
	if (_.has(filters, 'citySlug')) {
		where.push('f.citySlug = $citySlug');
		params.$citySlug = filters.citySlug;
	}


	if (_.has(filters, 'offersLate')) {
		where.push('f.offersLate = $offersLate');
		params.$offersLate = filters.offersLate;
	}
	if (_.has(filters, 'offersPeri')) {
		where.push('f.offersPeri = $offersPeri');
		params.$offersPeri = filters.offersPeri;
	}
	if (_.has(filters, 'offersTraining')) {
		where.push('f.offersTraining = $offersTraining');
		params.$offersTraining = filters.offersTraining;
	}
	if (_.has(filters, 'offersLate')) {
		where.push('f.offersLate = $offersLate');
		params.$offersLate = filters.offersLate;
	}
	if (_.has(filters, 'forProfit')) {
		where.push('f.forProfit = $forProfit');
		params.$forProfit = filters.forProfit;
	}
	if (_.has(filters, 'isChain')) {
		where.push('f.isChain = $isChain');
		params.$isChain = filters.isChain;
	}

	if (_.has(filters, 'performanceScore')) {
		where.push('f.performanceScore >= $performanceScore');
		params.$performanceScore = filters.performanceScore;
	}


	if (_.has(filters, 'perPage')) {
		limit = 'LIMIT $perPage';
		params.$perPage = filters.perPage;

		if (_.has(filters, 'startRow')) {
			limit += ' OFFSET $startRow';
			params.$startRow = filters.startRow;
		}
	}

	var columns = [
		'f.id',
		'f.name',
		'f.slug',
		'f.phone',
		'f.address',
		'f.address2',
		'f.state as stateName',
		'f.stateCode',
		'f.stateSlug',
		'f.city as cityName',
		'f.citySlug',
		'f.county',
		'f.countySlug',
		'f.zip',
		'f.locationLat',
		'f.locationLon',

		'f.networkId',
		'f.chainId',
		'f.ownerId',

		'f.numStations',
		'f.offersLate',
		'f.offersHemo',
		'f.offersPeri',
		'f.offersTraining',
		'f.forProfit',
		'f.isChain',

		'f.performanceScore',
	];

	if (_.has(filters, 'withStats')) {
		columns.push('fs.*');
	}


	var statement = [
		'SELECT',
		columns.join(','),
		'FROM facilities f INNER JOIN facilityStats fs on f.id = fs.id',
		(where.length) ? 'WHERE ' + where.join(' and ') : '',
		(having.length) ? 'HAVING ' + having.join(' and ') : '',
		'ORDER BY f.name',
		(limit.length) ? limit : '',
	].join(' ');

	// console.log(statement);
	// console.log(params);

	db.all(statement, params, fnCallback);
};



/*
*
*	Private Methods
*
*/

function createTables(fnCallback) {
	console.log('facilities::createTables()');

	var facilityColumns = _.map(facilityColumnsConfig, function(val, index) {
		return val.define;
	}).join(', ');

	var statColumns = _.map(statColumnsConfig, function(val, index) {
		return val.define;
	}).join(', ');

	var createTable = [
		'DROP TABLE IF EXISTS facilities',
		util.format('CREATE TABLE facilities (%s)', facilityColumns),
		// 'CREATE INDEX IF NOT EXISTS IX_id ON facilities(id)',
		'CREATE INDEX IF NOT EXISTS IX_stateSlug_citySlug ON facilities(stateSlug, citySlug)',
		'CREATE INDEX IF NOT EXISTS IX_zip ON facilities(zip, name)',

		'DROP TABLE IF EXISTS facilityStats',
		util.format('CREATE TABLE facilityStats (%s)', statColumns),
		// 'CREATE INDEX IF NOT EXISTS IX_id ON facilityStats(id)',

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

	var facilityColumns = _.map(facilityColumnsConfig, function(val, index) {
		return val.bind;
	});


	var statColumns = _.map(statColumnsConfig, function(val, index) {
		return val.bind;
	});


	// const sqlFacilities = util.format("INSERT INTO facilities VALUES (%s)", facilityColumns);
	// const sqlStats = util.format("INSERT INTO facilityStats VALUES (%s)", statColumns);

	async.auto({
		'params': generateParams,
		'facilities': ['params', function(fnAuto, results) {
			batchInsert(results.params.facility, 'facilities', facilityColumns, fnAuto);
			// console.log('facilities::populateTables()', 'facilities: ' + results.params.facility.length, _.keys(results.params.facility[0]).length);
			// fnAuto();
		}],
		'stats': ['params', function(fnAuto, results) {
			batchInsert(results.params.stats, 'facilityStats', statColumns, fnAuto);
			// console.log('facilities::populateTables()', 'stats: ' + results.params.stats.length, _.keys(results.params.stats[0]).length);
			// fnAuto();
		}],
	}, function(err, results) {
		console.log('facilities::populateTables() complete');
		fnCallback(null);
	});
}



function generateParams(fnCallback) {
	console.log('facilities::generateParams()');

	const facilitiesPath = GLOBAL.paths.getData('/medicare/facilities');
	const facilitiesData = require(GLOBAL.paths.getData('medicare/merged.json'));

	var facilityIds = _.keys(facilitiesData);
	// facilityIds = facilityIds.slice(0, 10);

	console.log('facilities::generateParams()', 'records: ' + facilityIds.length);


	var params = {
		facility: [],
		stats: [],
	};

	async.each(
		facilityIds,
		function(facilityId, nextFacility) {
			var facilityData = facilitiesData[facilityId];
			async.parallel({
				'facilityParams': function(fnNext) {
					generateFacilityParams(facilityData, function(err, thisParams) {
						params.facility.push(thisParams);
						fnNext();
					});
				},
				'statParams': function(fnNext) {
					generateStatsParams(facilityData, function(err, thisParams) {
						params.stats.push(thisParams);
						fnNext();
					});
				},
			}, nextFacility);
		},
		function(err) {
			fnCallback(null, params);
		}
	);
}



function batchInsert(params, tableName, columns, fnCallback) {
	console.log('facilities::batchInsert()', tableName, params.length, _.keys(params[0]).length);

	const maxBindings = 999;
	var bindingsPerInsert = columns.length;
	var batches = [];
	var colList = columns;

	var bindingsInBatch = 0;
	var batchBindings = {};
	var batchCols = [];


	for (let i = 0, numRecords = params.length; i < numRecords; i++) {
		var thisParams = params[i];
		var thisCols = [];

		_.each(thisParams, function(val, key) {
			batchBindings[key + '___' + i] = val;
		});

		_.each(colList, function(key) {
			thisCols.push(key + '___' + i);
		});

		bindingsInBatch += bindingsPerInsert;
		batchCols.push(thisCols);


		if (i + 1 === numRecords || bindingsPerInsert + bindingsInBatch > maxBindings) {
			batches.push({
				statement: util.format("INSERT INTO %s VALUES (%s)", tableName, batchCols.join('),(')),
				bindings: batchBindings
			});

			bindingsInBatch = 0;
			batchBindings = {};
			batchCols = [];
		}

	}


	console.log('facilities::batchInsert()', tableName, 'inserting batches', batches.length);
	async.each(
		batches,
		function(batch, fnNext) {
			db.run(batch.statement, batch.bindings, fnNext);
		},
		function(err) {

			fnCallback();

		}
	)
}



function generateFacilityParams(facilityData, fnCallback) {
	// console.log('facilities::generateFacilityParams()');
	var params = {};

	async.parallel([
		function(fnNext) {
			params.$id = facilityData.provider_number;
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

			fnNext();
		},
		setParamFromLookup.bind(null, params, '$networkId', 'networks', _.parseInt(facilityData.network)),
		setParamFromLookup.bind(null, params, '$chainId', 'chains', facilityData.chain_organization),
		setParamFromLookup.bind(null, params, '$ownerId', 'owners', facilityData.ownership_as_of_december_31_2012),
	], function() {
		// db.run(sqlInsert, params, fnCallback);
		fnCallback(null, params);
	});
}



function generateStatsParams(facilityData, fnCallback) {
	// console.log('facilities::generateStatParams()');
	var params = {};

	var refTexts = [
		'patient_hospitalization_category_text',
		'patient_survival_category_text',
		'patient_transfusion_category_text',
	];

	var refCodes = [
		'hgb_10_data_availability_code',
		'hgb_12_data_availability_code',
		'patient_transfusion_data_availability_code',
		'urr_data_availability_code',
		'adult_hd_kt_v_data_availability_code',
		'adult_pd_kt_v_data_availability_code',
		'pediatric_hd_kt_v_data_availability_code',
		'arteriovenous_fistulae_in_place_data_availability_code',
		'vascular_catheter_data_availability_code',
		'hypercalcemia_data_availability_code',
		'serum_phosphorus_data_availability_code',
		'patient_hospitalization_data_availability_code',
		'patient_survival_data_availability_code',
	];

	var refApplies = [
		'hemoglobin_12_g_dl_performance_score_applied',
		'urr_performance_score_applied',
		'fistula_performance_score_applied',
		'catheter_performance_score_applied',
	];

	async.parallel([
		function(fnNext) {
			params.$id = facilityData.provider_number;

			params.$certification_date = facilityData.certification_date;
			params.$claims_date = facilityData.claims_date;
			params.$mineral_and_bone_disorder_date = facilityData.mineral_and_bone_disorder_date;
			params.$date_of_ownership_record_update = facilityData.date_of_ownership_record_update;
			params.$strr_date = facilityData.strr_date;
			params.$smr_date = facilityData.smr_date;
			params.$shr_date = facilityData.shr_date;

			params.$percentage_of_medicare_patients_with_hgb_10_g_dl = _.parseInt(facilityData.percentage_of_medicare_patients_with_hgb_10_g_dl);
			params.$percentage_of_medicare_patients_with_hgb_12_g_dl = _.parseInt(facilityData.percentage_of_medicare_patients_with_hgb_12_g_dl);
			params.$number_of_dialysis_patients_with_hgb_data = _.parseInt(facilityData.number_of_dialysis_patients_with_hgb_data);

			params.$lists_the_facility_s_standardized_transfusion_ratio_facility = parseFloat(facilityData.lists_the_facility_s_standardized_transfusion_ratio_facility);
			params.$lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr = parseFloat(facilityData.lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr);
			params.$lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr = parseFloat(facilityData.lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr);
			
			params.$lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility = _.parseInt(facilityData.lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility);

			params.$percentage_of_hd_patients_with_urr_65 = _.parseInt(facilityData.percentage_of_hd_patients_with_urr_65);
			params.$number_of_hd_patients_with_urr_data = _.parseInt(facilityData.number_of_hd_patients_with_urr_data);

			params.$percent_of_adult_hd_patients_with_kt_v_1_2 = _.parseInt(facilityData.percent_of_adult_hd_patients_with_kt_v_1_2);
			params.$percentage_of_adult_pd_pts_with_kt_v_1_7 = _.parseInt(facilityData.percentage_of_adult_pd_pts_with_kt_v_1_7);
			params.$percentage_of_pediatric_hd_patients_with_kt_v_1_2 = _.parseInt(facilityData.percentage_of_pediatric_hd_patients_with_kt_v_1_2);

			params.$number_of_adult_hd_patients_with_kt_v_data = _.parseInt(facilityData.number_of_adult_hd_patients_with_kt_v_data);
			params.$number_of_adult_hd_patient_months_with_kt_v_data = _.parseInt(facilityData.number_of_adult_hd_patient_months_with_kt_v_data);
			params.$number_of_adult_pd_patients_with_kt_v_data = _.parseInt(facilityData.number_of_adult_pd_patients_with_kt_v_data);
			params.$number_of_adult_pd_patient_months_with_kt_v_data = _.parseInt(facilityData.number_of_adult_pd_patient_months_with_kt_v_data);
			params.$number_of_pediatric_hd_patients_with_kt_v_data = _.parseInt(facilityData.number_of_pediatric_hd_patients_with_kt_v_data);
			params.$number_of_pediatric_hd_patient_months_with_kt_v_data = _.parseInt(facilityData.number_of_pediatric_hd_patient_months_with_kt_v_data);

			params.$percentage_of_patients_with_arteriovenous_fistulae_in_place = _.parseInt(facilityData.percentage_of_patients_with_arteriovenous_fistulae_in_place);
			params.$percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer = _.parseInt(facilityData.percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer);

			params.$number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries = _.parseInt(facilityData.number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries);
			params.$number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries = _.parseInt(facilityData.number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries);
			
			params.$lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility = _.parseInt(facilityData.lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility);
			params.$lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility = _.parseInt(facilityData.lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility);
			params.$lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility = _.parseInt(facilityData.lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility);

			params.$lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility = _.parseInt(facilityData.lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility);
			params.$lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility = _.parseInt(facilityData.lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility);
			
			params.$lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility = _.parseInt(facilityData.lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility);
			params.$lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility = _.parseInt(facilityData.lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility);
			params.$lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility = _.parseInt(facilityData.lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility);
			params.$lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility = _.parseInt(facilityData.lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility);
			params.$lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility = _.parseInt(facilityData.lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility);

			params.$shr_upper_confidence_limit_95 = parseFloat(facilityData.shr_upper_confidence_limit_95);
			params.$smr_upper_confidence_limit_95 = parseFloat(facilityData.smr_upper_confidence_limit_95);
			params.$shr_lower_confidence_limit_5 = parseFloat(facilityData.shr_lower_confidence_limit_5);
			params.$smr_lower_confidence_limit_5 = parseFloat(facilityData.smr_lower_confidence_limit_5);
			
			params.$number_of_patients_included_in_hospitalization_summary = _.parseInt(facilityData.number_of_patients_included_in_hospitalization_summary);
			params.$standardized_hospitalization_ratio = parseFloat(facilityData.standardized_hospitalization_ratio);
			
			params.$number_of_patients_included_in_survival_summary = _.parseInt(facilityData.number_of_patients_included_in_survival_summary);
			params.$standardized_mortality_ratio = parseFloat(facilityData.standardized_mortality_ratio);

			params.$hg_12_g_dlmeasurescore = _.parseInt(facilityData.hg_12_g_dlmeasurescore);
			params.$hg_12_g_dlperformancerate_1 = _.parseInt(facilityData.hg_12_g_dlperformancerate_1);
			params.$number_of_hemoglobin_eligible_patients_performance_period = _.parseInt(facilityData.number_of_hemoglobin_eligible_patients_performance_period);
			params.$hg_12_g_dlperformancerate_2 = _.parseInt(facilityData.hg_12_g_dlperformancerate_2);
			params.$number_of_hemoglobin_eligible_patients_baseline_period = _.parseInt(facilityData.number_of_hemoglobin_eligible_patients_baseline_period);

			params.$urr_65_measurescore = _.parseInt(facilityData.urr_65_measurescore);
			params.$urr_65_performancerate_1 = _.parseInt(facilityData.urr_65_performancerate_1);
			params.$number_of_urr_eligible_patients_performance_period = _.parseInt(facilityData.number_of_urr_eligible_patients_performance_period);
			params.$urr_65_performancerate_2 = _.parseInt(facilityData.urr_65_performancerate_2);
			params.$number_of_urr_eligible_patients_baseline_period = _.parseInt(facilityData.number_of_urr_eligible_patients_baseline_period);

			params.$fistula_measure_score = _.parseInt(facilityData.fistula_measure_score);
			params.$fistula_performance_period_rate = _.parseInt(facilityData.fistula_performance_period_rate);
			params.$number_of_fistula_patient_months_performance_period = _.parseInt(facilityData.number_of_fistula_patient_months_performance_period);
			params.$fistula_baseline_period_rate = _.parseInt(facilityData.fistula_baseline_period_rate);
			params.$number_of_fistula_patient_months_baseline_period = _.parseInt(facilityData.number_of_fistula_patient_months_baseline_period);

			params.$catheter_measure_score = _.parseInt(facilityData.catheter_measure_score);
			params.$catheter_performance_period_rate = _.parseInt(facilityData.catheter_performance_period_rate);
			params.$number_of_catheter_patient_months_performance_period = _.parseInt(facilityData.number_of_catheter_patient_months_performance_period);
			params.$catheter_baseline_period_rate = _.parseInt(facilityData.catheter_baseline_period_rate);
			params.$number_of_catheter_patient_months_baseline_period = _.parseInt(facilityData.number_of_catheter_patient_months_baseline_period);

			params.$vascular_access_combined_measure_score = _.parseInt(facilityData.vascular_access_combined_measure_score);

			params.$ich_cahps_admin_score = _.parseInt(facilityData.ich_cahps_admin_score);
			params.$nhsn_event_reporting_score = _.parseInt(facilityData.nhsn_event_reporting_score);
			params.$mineral_metabolism_reporting_score = _.parseInt(facilityData.mineral_metabolism_reporting_score);
			params.$total_performance_score = _.parseInt(facilityData.total_performance_score);

			fnNext();
		},

		setParamFromLookup.bind(null, params, '$py2014_payment_reduction_percentage', 'paymentReductions', facilityData.py2014_payment_reduction_percentage),
		function(fnNext) {
			async.each(refTexts, function(columnName, fnNextEach) {
				setParamFromLookup(params, '$' + columnName, 'texts', facilityData[columnName], fnNextEach);
			}, fnNext);
		},
		function(fnNext) {
			async.each(refCodes, function(columnName, fnNextEach) {
				setParamFromLookup(params, '$' + columnName, 'codes', facilityData[columnName], fnNextEach);
			}, fnNext);
		},
		function(fnNext) {
			async.each(refApplies, function(columnName, fnNextEach) {
				setParamFromLookup(params, '$' + columnName, 'applies', facilityData[columnName], fnNextEach);
			}, fnNext);
		},
	], function() {
		// db.run(sqlInsert, params, fnCallback);
		fnCallback(null, params);
	});
}



function setParamFromLookup(params, paramName, tableName, lookupVal, fnCallback) {
	if (typeof lookupVal === 'string' && (_.isEmpty(lookupVal) || lookupVal.toUpperCase() === 'N/A' || lookupVal.toUpperCase() === 'NOT AVAILABLE')) {
		lookupVal = null;
	}
	else if (lookupVal === undefined) {
		lookupVal = null;
	}

	referenceSvc.get(
		tableName,
		lookupVal,
		function(result) {
			if (!_.has(result, 'id')) {
				console.log(params, paramName, tableName, lookupVal, result);
			}
			params[paramName] = result.id;
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