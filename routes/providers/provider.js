'use strict';

/*
*
*	Export
*
*/


// var me = module.exports = {};



/*
*
*	Dependencies
*
*/

const util = require('util');

const _ = require('lodash');
const numeral = require('numeral');

const facilitySvc = require(global.paths.getService('facilities/core'));


/*
*
*	PUBLIC METHODS
*
*/

module.exports = function(req, res) {
	facilitySvc.getFacility(req.params.facilityId, function(err, place) {

		if (!place || !place.id) {
			var httpErr = {code: 404, msg: 'Not Found'};

			res.status(httpErr.code);
			res.render('_error', {
				msg: httpErr.msg,
			});

		}
		else {
			if (req.originalUrl !== place.getLink()) {
				res.redirect(301, place.getLink());
			}

			var title = place.name;
			var description = util.format(
				'%s, located at %s in %s, offers Hemodialysis.',
				place.name,
				place.address,
				place.city.placeName
			);

			var pageTitle = place.name;


			var numServices = 0;
			if (place.offersHemo) numServices++;
			if (place.offersPeri) numServices++;
			if (place.offersTraining) numServices++;
			if (place.offersLate) numServices++;


			res.render('provider', {
				metaTitle: title,
				metaDescription: description,

				pageTitle: pageTitle,
				// pageDescription: pageDescription,

				place: place,
				servicesList: servicesList(place),
				numServices: numServices,


				textLabel: textLabel,
				scoreLabel: scoreLabel,
				scoreColor: scoreColor,
				numeral: numeral,
			});
		}
	});
};





function servicesList(place) {
	// var serviceSchema = (
	// 	'<span itemprop="availableService" itemscope itemtype="http://schema.org/TherapeuticProcedure">'
	// 		+ '<span itemprop="procedureType" itemscope itemtype="http://schema.org/PercutaneousProcedure">'
	// 			+ '<span itemprop="medicalSpecialty" itemscope itemtype="http://schema.org/Renal"></span>'
	// 			+ '<span itemprop="recognizingAuthority" itemscope itemtype="http://schema.org/recognizingAuthority">'
	// 				+ '<span itemprop="name" content="The Centers for Medicare & Medicaid Services"></span>'
	// 			+ '</span>'
	// 		+ '</span>'
	// 		+ '<span itemprop="name">%s</span>'
	// 	+ '</span>'
	// );
	var offeredServiceSchema = (
		'<span itemprop="makesOffer" itemscope itemtype="http://schema.org/TherapeuticProcedure">'
			+ '<span itemprop="procedureType" itemscope itemtype="http://schema.org/PercutaneousProcedure">'
				+ '<span itemprop="medicalSpecialty" itemscope itemtype="http://schema.org/Renal"></span>'
				+ '<span itemprop="recognizingAuthority" itemscope itemtype="http://schema.org/recognizingAuthority">'
					+ '<span itemprop="name" content="The Centers for Medicare & Medicaid Services"></span>'
				+ '</span>'
			+ '</span>'
			+ '<span itemprop="name">%s</span>'
		+ '</span>'
	);
	var offerSchema = (
		'<span itemprop="makesOffer" itemscope itemtype="http://schema.org/Offer">'
			+ '<span itemprop="name">%s</span>'
		+ '</span>'
	);

	var services = [];
	if (place.offersHemo) services.push(util.format(offeredServiceSchema, 'Hemodialysis'));
	if (place.offersPeri) services.push(util.format(offeredServiceSchema, 'Peritoneal Dialysis'));
	if (place.offersTraining) services.push(util.format(offerSchema, 'Home Training'));
	if (place.offersLate) services.push(util.format(offerSchema, 'Shifts after 5pm'));

	return toList(services);
}


function toList(ary) {
	if (ary.length < 2) {
		return ary.join('');
	}
	if (ary.length === 2) {
		return ary.join(' and ');
	}
	else {
		return (
			ary.slice(0, -1).join(', ') + ', and ' + ary[ary.length-1]
		);
	}
}




function textLabel(text) {
	if (text === 'Worse than Expected') return 'label-danger';
	if (text === 'Better than Expected') return 'label-success';
	if (text === 'As Expected') return 'label-info';
	return 'label-default';
}


function scoreLabel(score) {
	if (!_.isNumber(score)) return "label-default";

	if (score >= 90) return 'label-success';
	if (score >= 80) return 'label-info';
	if (score >= 60) return 'label-warning';
	if (score < 60) return 'label-danger';
	return 'label-default';
}

function scoreColor(score) {
	var label = scoreLabel(score);
	if (label === 'label-primary') return '008cba';
	if (label === 'label-success') return '43ac6a';
	if (label === 'label-info') return '5bc0de';
	if (label === 'label-warning') return 'e99002';
	if (label === 'label-danger') return 'f04124';
	return 'eee';
}
