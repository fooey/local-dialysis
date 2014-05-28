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

const Case = require('case');




/*
*
*	Public Methods
*
*/

me.getSlug = function(str) {
	str = str.toLowerCase();
	str = str.replace(/[^a-z0-9]{1,}/g, ' ');
	str = str.trim();
	str = str.replace(/[ ]{1,}/g, '-');

	return str;
};



me.toTitleCase = function(str) {
	if (typeof str === 'undefined' || str === null || !str.length) return null;
	else {
		str = str.trim();
		str = str.replace(/^[ -]{1,}/, '');

		str = str.replace(/\bCLI\b/g, 'CLINIC');
		str = str.replace(/\bCTR\b/g, 'CENTER');
		str = str.replace(/\bLL\b/g, 'LLC');
		str = str.replace(/\bRTC\b/g, 'RESIDENTIAL TREATMENT CENTER');
		// str = str.replace(/\bTRC TEXAS\b/g, 'Treatment Research Clinic Texas');

		str = Case.title(str);

		str = str.replace(/^the\b/, 'The');
		str = str.replace(/^a\b/, 'A');

		str = str.replace(/\bBimc\b/g, 'BIMC');
		str = str.replace(/\bBma\b/g, 'BMA');
		str = str.replace(/\bCdc\b/g, 'CDC');
		str = str.replace(/\bCntr\b/g, 'Center');
		str = str.replace(/\bDsi\b/g, 'DSI');
		str = str.replace(/\bDci\b/g, 'DCI');
		str = str.replace(/\bDva\b/g, 'DVA');
		str = str.replace(/\bEsrd\b/g, 'End-Stage Renal Disease');
		str = str.replace(/\bFmc\b/g, 'FMC');
		str = str.replace(/\bFms\b/g, 'FMS');
		str = str.replace(/\bHosp\b/g, 'Hospital');
		str = str.replace(/\bIdf\b/g, 'IDF');
		str = str.replace(/\bIi\b/g, 'II');
		str = str.replace(/\bIii\b/g, 'III');
		str = str.replace(/\bLp\b/g, 'LP');
		str = str.replace(/\bNe\b/g, 'NE');
		str = str.replace(/\bNna\b/g, 'NNA');
		str = str.replace(/\bNw\b/g, 'NW');
		str = str.replace(/\bRcc\b/g, 'RCC');
		str = str.replace(/\bRtc\b/g, 'Rtc');
		str = str.replace(/\bSe\b/g, 'SE');
		str = str.replace(/\bSw\b/g, 'SW');
		str = str.replace(/\bTrc\b/g, 'TRC');
		str = str.replace(/\bUs\b/g, 'US');
		str = str.replace(/\bUsrc\b/g, 'USRC');

		str = str.replace(/\bMc$/g, 'Medical Center');
		str = str.replace(/\bDc$/g, 'Dialysis Center');

		return str;
	}
};
