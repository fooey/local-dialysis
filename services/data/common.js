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

const util = require('util');



/*
*
*	Public Methods
*
*/

me.getTotalsColumns = function getTotalsColumns() {
	return [
		"COUNT(*) AS numFacilities",
		"SUM(facilities.numStations) AS numStationsSum",
		"AVG(facilities.numStations) AS numStationsAvg",
		"SUM(facilities.offersLate) AS offersLateSum",
		"SUM(facilities.offersHemo) AS offersHemoSum",
		"SUM(facilities.offersPeri) AS offersPeriSum",
		"SUM(facilities.offersTraining) AS offersTrainingSum",

		"SUM(facilities.forProfit) AS forProfitSum",
		"SUM(CASE WHEN facilities.forProfit = 0 THEN 1 ELSE NULL END) AS nonProfitSum",

		"SUM(facilities.isChain) AS isChainSum",
		"SUM(CASE WHEN facilities.isChain = 0 THEN 1 ELSE NULL END) AS notChainSum",

		me.agg('performanceScore', 'facilities'),
	];
}

me.getStatsColumns = function getStatsColumns() {
	return [
		// "COUNT(*) AS numFacilities",


		/*
		*	Hospitilization and Mortality
		*/

		// "SUM(CASE WHEN patient_hospitalization_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasHospData",
		me.textSums('patient_hospitalization_category_text'),
		me.codeSums('patient_hospitalization_data_availability_code'),
		me.agg('number_of_patients_included_in_hospitalization_summary'),
		me.agg('standardized_hospitalization_ratio'),

		// "SUM(CASE WHEN patient_survival_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasSurvData",
		me.textSums('patient_survival_category_text'),
		me.codeSums('patient_survival_data_availability_code'),
		me.agg('number_of_patients_included_in_survival_summary'),
		me.agg('standardized_mortality_ratio'),


		/*
		*	Anemia Management
		*/

		// "SUM(CASE WHEN hgb_10_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasHgb10Data",

		me.agg('hg_12_g_dlmeasurescore'),
		me.agg('hg_12_g_dlperformancerate_1'),
		me.agg('hg_12_g_dlperformancerate_2'),
		me.agg('number_of_hemoglobin_eligible_patients_performance_period'),
		me.agg('number_of_hemoglobin_eligible_patients_baseline_period'),
		me.appliedSums('hemoglobin_12_g_dl_performance_score_applied'),

		me.codeSums('hgb_10_data_availability_code'),
		me.agg('percentage_of_medicare_patients_with_hgb_10_g_dl'),

		// "SUM(CASE WHEN hgb_12_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasHgb12Data",
		me.codeSums('hgb_12_data_availability_code'),
		me.agg('percentage_of_medicare_patients_with_hgb_12_g_dl'),

		me.agg('number_of_dialysis_patients_with_hgb_data'),

		// "SUM(CASE WHEN patient_transfusion_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasTransfusionData",
		me.codeSums('patient_transfusion_data_availability_code'),
		me.textSums('patient_transfusion_category_text'),


		me.agg('lists_the_facility_s_standardized_transfusion_ratio_facility'),
		// me.agg('lists_the_upper_confident_limit_97_5_for_standardized_transfusion_ratio_strr'),
		// me.agg('lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr'),
		// me.agg('lists_the_lower_confident_limit_2_5_for_standardized_transfusion_ratio_strr'),
		me.agg('lists_the_number_of_patients_included_in_the_facility_s_transfusion_summary_facility'),

		

		/*
		*	Dialysis Adequacy
		*/

		me.agg('urr_65_measurescore'),
		me.appliedSums('urr_performance_score_applied'),

		me.agg('urr_65_performancerate_1'),
		me.agg('urr_65_performancerate_2'),

		// "SUM(CASE WHEN urr_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasUrrData",
		me.agg('percentage_of_hd_patients_with_urr_65'),
		me.codeSums('urr_data_availability_code'),
		me.agg('number_of_hd_patients_with_urr_data'),
		me.agg('number_of_urr_eligible_patients_performance_period'),
		me.agg('number_of_urr_eligible_patients_baseline_period'),


		// "SUM(CASE WHEN adult_hd_kt_v_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasAdultHdKtVData",
		me.agg('percent_of_adult_hd_patients_with_kt_v_1_2'),
		me.codeSums('adult_hd_kt_v_data_availability_code'),
		me.agg('number_of_adult_hd_patients_with_kt_v_data'),
		me.agg('number_of_adult_hd_patient_months_with_kt_v_data'),

		// "SUM(CASE WHEN adult_pd_kt_v_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasAdultPdKtVData",
		me.agg('percentage_of_adult_pd_pts_with_kt_v_1_7'),
		me.codeSums('adult_pd_kt_v_data_availability_code'),
		me.agg('number_of_adult_pd_patients_with_kt_v_data'),
		me.agg('number_of_adult_pd_patient_months_with_kt_v_data'),

		// "SUM(CASE WHEN pediatric_hd_kt_v_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasPedHdKtVData",
		me.agg('percentage_of_pediatric_hd_patients_with_kt_v_1_2'),
		me.codeSums('pediatric_hd_kt_v_data_availability_code'),
		me.agg('number_of_pediatric_hd_patients_with_kt_v_data'),
		me.agg('number_of_pediatric_hd_patient_months_with_kt_v_data'),



		/*
		*	Vascular
		*/

		// "SUM(CASE WHEN vascular_catheter_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasVascCathData",
		me.agg('catheter_measure_score'),
		me.appliedSums('catheter_performance_score_applied'),

		me.agg('percentage_of_patients_with_vascular_catheter_in_use_for_90_days_or_longer'),
		me.codeSums('vascular_catheter_data_availability_code'),
		
		me.agg('catheter_performance_period_rate'),
		me.agg('number_of_catheter_patient_months_performance_period'),

		me.agg('catheter_baseline_period_rate'),
		me.agg('number_of_catheter_patient_months_baseline_period'),



		// "SUM(CASE WHEN arteriovenous_fistulae_in_place_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasArtFistData",
		me.agg('fistula_measure_score'),
		me.appliedSums('fistula_performance_score_applied'),

		me.agg('percentage_of_patients_with_arteriovenous_fistulae_in_place'),
		me.codeSums('arteriovenous_fistulae_in_place_data_availability_code'),

		me.agg('fistula_performance_period_rate'),
		me.agg('number_of_fistula_patient_months_performance_period'),

		me.agg('fistula_baseline_period_rate'),
		me.agg('number_of_fistula_patient_months_baseline_period'),


		// me.agg('number_of_adult_patient_months_included_in_arterial_venous_fistula_and_catheter_summaries'),
		// me.agg('number_of_adult_patients_included_in_arterial_venous_fistula_and_catheter_summaries'),



		/*
		*	Mineral
		*/

		// "SUM(CASE WHEN hypercalcemia_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasHypercalData",
		me.agg('lists_the_percentage_of_adult_patients_with_hypercalcemia_serum_calcium_greater_than_10_2_mg_dl_facility'),
		me.codeSums('hypercalcemia_data_availability_code'),
		me.agg('lists_the_number_of_patients_included_in_the_facility_s_hypercalcemia_summary_facility'),
		me.agg('lists_the_number_of_patient_months_included_in_the_facility_s_hypercalcemia_summary_facility'),


		// "SUM(CASE WHEN serum_phosphorus_data_availability_code = '001' THEN 1 ELSE NULL END) AS hasSerumPhosphData",
		me.agg('lists_the_number_of_patients_included_in_the_facility_s_serum_phosphorus_summary_facility'),
		me.codeSums('serum_phosphorus_data_availability_code'),
		me.agg('lists_the_number_of_patient_months_included_in_the_facility_s_serum_phosphorus_summary_facility'),
		
		me.agg('lists_the_percentage_of_adult_patients_with_serum_phosphorus_less_than_3_5_mg_dl_facility'),
		me.agg('lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_3_5_4_5_mg_dl_facility'),
		me.agg('lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_4_6_5_5_mg_dl_facility'),
		me.agg('lists_the_percentage_of_adult_patients_with_serum_phosphorus_between_5_6_7_0_mg_dl_facility'),
		me.agg('lists_the_percentage_of_adult_patients_with_serum_phosphorus_greater_than_7_0_mg_dl_facility'),

		// me.agg('shr_upper_confidence_limit_95'),
		// me.agg('smr_upper_confidence_limit_95'),
		// me.agg('shr_lower_confidence_limit_5'),
		// me.agg('smr_lower_confidence_limit_5'),

		

		me.agg('total_performance_score'),
		me.agg('ich_cahps_admin_score'),
		me.agg('nhsn_event_reporting_score'),
		me.agg('vascular_access_combined_measure_score'),
		me.agg('mineral_metabolism_reporting_score'),

		me.payReduct('py2014_payment_reduction_percentage'),

	];
}



me.agg = function agg(col, tableName) {
	tableName = tableName || 'facilityStats';

	return [
		util.format("SUM(%s.%s) AS sum_%s", tableName, col, col),
		util.format("AVG(%s.%s) AS avg_%s", tableName, col, col),
		util.format("MIN(%s.%s) AS min_%s", tableName, col, col),
		util.format("MAX(%s.%s) AS max_%s", tableName, col, col),
	].join(', ');
}



me.codeSums = function codeSums(col, tableName) {
	tableName = tableName || 'facilityStats';

	var selects = [util.format("SUM(CASE WHEN %s.%s IS NULL THEN 1 ELSE NULL END) AS code0_%s", tableName, col, col)];
	var numOptions = 8;

	for (let i = 1; i <= numOptions; i++) {
		selects.push(util.format("SUM(CASE WHEN %s.%s = %d THEN 1 ELSE NULL END) AS code%d_%s", tableName, col, i, i, col));
	}

	return selects.join(', ');
}



me.textSums = function textSums(col, tableName) {
	tableName = tableName || 'facilityStats';
	
	var selects = [util.format("SUM(CASE WHEN %s.%s IS NULL THEN 1 ELSE NULL END) AS text0_%s", tableName, col, col)];
	var numOptions = 4;

	for (let i = 1; i <= numOptions; i++) {
		selects.push(util.format("SUM(CASE WHEN %s.%s = %d THEN 1 ELSE NULL END) AS text%d_%s", tableName, col, i, i, col));
	}

	return selects.join(', ');
}



me.appliedSums = function textSums(col, tableName) {
	tableName = tableName || 'facilityStats';
	
	var selects = [util.format("SUM(CASE WHEN %s.%s IS NULL THEN 1 ELSE NULL END) AS applied0_%s", tableName, col, col)];
	var numOptions = 3;

	for (let i = 1; i <= numOptions; i++) {
		selects.push(util.format("SUM(CASE WHEN %s.%s = %d THEN 1 ELSE NULL END) AS applied%d_%s", tableName, col, i, i, col));
	}

	return selects.join(', ');
}



me.payReduct = function payReduct(col, tableName) {
	tableName = tableName || 'facilityStats';
	
	var selects = [util.format("SUM(CASE WHEN %s.%s IS NULL THEN 1 ELSE NULL END) AS payReduct0_%s", tableName, col, col)];
	var numOptions = 6;

	for (let i = 1; i <= numOptions; i++) {
		selects.push(util.format("SUM(CASE WHEN %s.%s = %d THEN 1 ELSE NULL END) AS payReduct%d_%s", tableName, col, i, i, col));
	}

	return selects.join(', ');
}