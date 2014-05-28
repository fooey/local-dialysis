'use strict';

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

const _ = require('lodash');
const async = require('async');


const facilitiesData = require(GLOBAL.paths.getService('data/facilities'));



/*
*
*	CLASS
*
*/

me.Facility = function Facility(facilityData) {
	_.assign(this, facilityData);
	return this;
}

me.Facility.prototype.getLink = function getLink(subPage) {
	var pageLink = [
		this.slug, 
		subPage, 
		this.id, 
		'html'
	];

	return '/providers/' + _.compact(pageLink).join('.');
}

me.Facility.prototype.getChain = function getChain() {
	var chainId = this.chainId;
	return _.find(GLOBAL.DATA.REFERENCE.chains, function(chain) {return chain.id === chainId});
}

me.Facility.prototype.getText = function getText(key) {
	var lookupId = this[key + 'Id'];
	return _.find(GLOBAL.DATA.REFERENCE.texts, function(text) {return text.id === lookupId});
}



/*
*
*	PUBLIC METHODS
*
*/


// me.getFacility = function getFacility(id, fnCallback) {
// 	fnCallback(null, new me.Facility(
// 		require(__getFacilityPath(id))
// 	));
// };



me.get = function getByState(filters, fnCallback) {
	console.log('facilites::core:get', filters);
	facilitiesData.get(filters, function(err, data) {
		if (err) throw(err);

		var facilities = data.map(function(facilityData) {
			return new me.Facility(facilityData);
		});

		fnCallback(err, facilities);
	});
};



/*
*
*	PRIVATE METHODS
*
*/


function sortByName(a, b) {
	var a = a.name.toLowerCase();
	var b = b.name.toLowerCase();

	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
}








// me.keyMap = {};

// (function() {
// 	init();
// })();




// me.keys = {
// 	data: [
// 		'_of_dialysis_stations',

// 		'total_performance_score',
// 		'ich_cahps_admin_score',
// 		'vascular_access_combined_measure_score',
// 		'nhsn_event_reporting_score',
// 		'mineral_metabolism_reporting_score',

// 		'lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility',
// 		'lists_the_facility_s_standardized_transfusion_ratio_facility',
// 		'lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr',
// 		'lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr',
		
// 		'lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility',
// 		'lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility',
// 		'lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility',
// 		'lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility',
// 		'lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility',

// 		'lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility',
// 		'lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility',
// 		'lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility',
// 		'lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility',
// 		'lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility',

// 		'number_of_dialysis_patients_with_hgb_data',
// 		'number_of_hd_patients_with_urr_data',
// 		'number_of_adult_hd_patients_with_kt_v_data',
// 		'number_of_adult_hd_patient_months_with_kt_v_data',
// 		'number_of_adult_pd_patients_with_kt_v_data',
// 		'number_of_adult_pd_patient_months_with_kt_v_data',
// 		'number_of_pediatric_hd_patients_with_kt_v_data',
// 		'number_of_pediatric_hd_patient_months_with_kt_v_data',

// 		'number_of_hemoglobin_eligible_patients_performance_period',
// 		'number_of_hemoglobin_eligible_patients_baseline_period',
// 		'number_of_urr_eligible_patients_performance_period',
// 		'number_of_urr_eligible_patients_baseline_period',
// 		'number_of_fistula_patient_months_performance_period',
// 		'number_of_fistula_patient_months_baseline_period',
// 		'number_of_catheter_patient_months_performance_period',
// 		'number_of_catheter_patient_months_baseline_period',

// 		'number_of_patients_included_in_survival_summary',
// 		'number_of_patients_included_in_hospitalization_summary',
// 		'number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries',
// 		'number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries',

// 		'percent_of_adult_hd_patients_with_kt_v_1_2',
// 		'percentage_of_medicare_patients_with_hgb_10_g_dl',
// 		'percentage_of_medicare_patients_with_hgb_12_g_dl',
// 		'percentage_of_hd_patients_with_urr_65',
// 		'percentage_of_adult_pd_pts_with_kt_v_1_7',
// 		'percentage_of_pediatric_hd_patients_with_kt_v_1_2',
// 		'percentage_of_pediatric_hd_patients_with_kt_v_1_2',
// 		'percentage_of_patients_with_arteriovenous_fistulae_in_place',
// 		'percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer',

// 		'shr_upper_confidence_limit_95',
// 		'smr_upper_confidence_limit_95',
// 		'shr_lower_confidence_limit_5',
// 		'smr_lower_confidence_limit_5',

// 		'standardized_hospitalization_ratio',
// 		'standardized_mortality_ratio',

// 		'hg_12_g_dlmeasurescore',
// 		'hg_12_g_dlperformancerate_1',
// 		'hg_12_g_dlperformancerate_2',

// 		'urr_65_measurescore',
// 		'urr_65_performancerate_1',
// 		'urr_65_performancerate_2',

// 		'fistula_measure_score',
// 		'fistula_performance_period_rate',
// 		'fistula_baseline_period_rate',

// 		'catheter_measure_score',
// 		'catheter_performance_period_rate',
// 		'catheter_baseline_period_rate',
// 	],
// 	codes: [
// 		'adult_hd_kt_v_data_availability_code',
// 		'adult_pd_kt_v_data_availability_code',	
// 		'arteriovenous_fistulae_in_place_data_availability_code',
// 		'hgb_10_data_availability_code',
// 		'hgb_12_data_availability_code',
// 		'hypercalcemia_data_availability_code',
// 		'patient_hospitalization_data_availability_code',
// 		'patient_survival_data_availability_code',
// 		'patient_transfusion_data_availability_code',
// 		'pediatric_hd_kt_v_data_availability_code',
// 		'serum_phosphorus_data_availability_code',
// 		'urr_data_availability_code',	
// 		'vascular_catheter_data_availability_code',
// 	],
// 	categories: [
// 		'patient_survival_category_text',
// 		'patient_hospitalization_category_text',
// 		'patient_transfusion_category_text',

// 		'urr_performance_score_applied',
// 		'hemoglobin_12_g_dl_performance_score_applied',
// 		'fistula_performance_score_applied',
// 		'catheter_performance_score_applied',
// 	],
// 	dates: [
// 		'certification_date',
// 		'claims_date',
// 		'mineral_and_bone_disorder_date',
// 		'strr_date',
// 		'smr_date',
// 		'shr_date',
// 		'cms_certification_date',
// 		'date_of_ownership_record_update',
// 	]
// };


/*
	"provider_number": "100001",
	"network": "7",
	"facility_name": "SHANDS JACKSONVILLE - ESRD",
	"address_line_1": "655 W 8TH ST",
	"address_line_2": null,
	"city": "JACKSONVILLE",
	"state": "FL",
	"zip": "32209",
	"county": "DUVAL",
	"phone_number": {
		"phone_number": "(904) 244-5448",
		"phone_type": null
	},
	"profit_or_non_profit_": "Non-Profit",
	"chain_owned": false,
	"chain_organization": "INDEPENDENT",
	"late_shift_": false,
	"_of_dialysis_stations": "40",
	"offers_in_center_hemodialysis": true,
	"offers_in_center_peritoneal_dialysis": true,
	"offers_home_hemodialysis_training": false,
	"certification_date": "1976-09-01T00:00:00",
	"claims_date": "07/01/2012-06/30/2013",
	"mineral_and_bone_disorder_date": "07/01/2012-06/30/2013",
	"strr_date": "01/01/2012-12/31/2012",
	"percentage_of_medicare_patients_with_hgb_10_g_dl": "16",
	"hgb_10_data_availability_code": "001",
	"percentage_of_medicare_patients_with_hgb_12_g_dl": "0",
	"hgb_12_data_availability_code": "001",
	"number_of_dialysis_patients_with_hgb_data": "173",
	"lists_the_facility_s_standardized_transfusion_ratio_facility": "0.6",
	"lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr": "1.12",
	"lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr": "0.35",
	"patient_transfusion_data_availability_code": "001",
	"patient_transfusion_category_text": "As Expected",
	"lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility": "199",
	"percentage_of_hd_patients_with_urr_65": "100",
	"urr_data_availability_code": "001",
	"percent_of_adult_hd_patients_with_kt_v_1_2": "80",
	"adult_hd_kt_v_data_availability_code": "001",
	"percentage_of_adult_pd_pts_with_kt_v_1_7": "87",
	"adult_pd_kt_v_data_availability_code": "001",
	"percentage_of_pediatric_hd_patients_with_kt_v_1_2": null,
	"pediatric_hd_kt_v_data_availability_code": "254",
	"number_of_hd_patients_with_urr_data": "148",
	"number_of_adult_hd_patients_with_kt_v_data": "226",
	"number_of_adult_hd_patient_months_with_kt_v_data": "1650",
	"number_of_adult_pd_patients_with_kt_v_data": "35",
	"number_of_adult_pd_patient_months_with_kt_v_data": "350",
	"number_of_pediatric_hd_patients_with_kt_v_data": "0",
	"number_of_pediatric_hd_patient_months_with_kt_v_data": "0",
	"percentage_of_patients_with_arteriovenous_fistulae_in_place": "41",
	"arteriovenous_fistulae_in_place_data_availability_code": "001",
	"percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer": "27",
	"vascular_catheter_data_availability_code": "001",
	"number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries": "192",
	"number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries": "1751",
	"hypercalcemia_data_availability_code": "001",
	"lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility": "873",
	"lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility": "2437",
	"lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility": "2",
	"lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility": "920",
	"lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility": "2551",
	"serum_phosphorus_data_availability_code": "001",
	"lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility": "13",
	"lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility": "25",
	"lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility": "26",
	"lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility": "23",
	"lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility": "13",
	"smr_date": "01/01/2009-12/31/2012",
	"shr_date": "01/01/2012-12/31/2012",
	"shr_upper_confidence_limit_95": "1.58",
	"smr_upper_confidence_limit_95": "1.45",
	"shr_lower_confidence_limit_5": "0.88",
	"smr_lower_confidence_limit_5": "1.02",
	"patient_hospitalization_category_text": "As Expected",
	"patient_hospitalization_data_availability_code": "001",
	"patient_survival_category_text": "Worse than Expected",
	"patient_survival_data_availability_code": "001",
	"number_of_patients_included_in_hospitalization_summary": "227",
	"number_of_patients_included_in_survival_summary": "1098",
	"standardized_hospitalization_ratio": "1.16",
	"standardized_mortality_ratio": "1.22",
	"location": {
		"human_address": {
			"address": "",
			"city": "JACKSONVILLE",
			"state": "FL",
			"zip": "32209"
		},
		"latitude": 30.35648024000045,
		"longitude": -81.69001945699966,
		"machine_address": null,
		"needs_recoding": false
	},
	"alternateccn": "102300",
	"alternate_ccn_2": null,
	"alternate_ccn_3": null,
	"hg_12_g_dlmeasurescore": "9",
	"hg_12_g_dlperformancerate_1": "1",
	"number_of_hemoglobin_eligible_patients_performance_period": "173",
	"hg_12_g_dlperformancerate_2": "2",
	"number_of_hemoglobin_eligible_patients_baseline_period": "156",
	"hemoglobin_12_g_dl_performance_score_applied": "Achievement",
	"urr_65_measurescore": "8",
	"urr_65_performancerate_1": "99",
	"number_of_urr_eligible_patients_performance_period": "140",
	"urr_65_performancerate_2": "100",
	"number_of_urr_eligible_patients_baseline_period": "129",
	"urr_performance_score_applied": "Achievement",
	"fistula_measure_score": "2",
	"fistula_performance_period_rate": "42",
	"number_of_fistula_patient_months_performance_period": "1686",
	"fistula_baseline_period_rate": "32",
	"number_of_fistula_patient_months_baseline_period": "1530",
	"fistula_performance_score_applied": "Improvement",
	"catheter_measure_score": "2",
	"catheter_performance_period_rate": "28",
	"number_of_catheter_patient_months_performance_period": "1581",
	"catheter_baseline_period_rate": "35",
	"number_of_catheter_patient_months_baseline_period": "1072",
	"catheter_performance_score_applied": "Improvement",
	"vascular_access_combined_measure_score": "2",
	"ich_cahps_admin_score": "10",
	"nhsn_event_reporting_score": "10",
	"mineral_metabolism_reporting_score": "10",
	"total_performance_score": "67",
	"py2014_payment_reduction_percentage": "No reduction",
	"cms_certification_date": "1976-09-01T00:00:00",
	"ownership_as_of_december_31_2012": "INDEPENDENT",
	"date_of_ownership_record_update": "2004-09-22T00:00:00"
*/