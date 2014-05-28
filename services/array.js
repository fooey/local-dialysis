"use strict";


/*
*
*	Export
*
*/

var me = module.exports = {};



/*
*
*	Public Methods
*
*/


me.sort = function(data, dataType, fnCallback) {
	// var stringSorter = function(a, b) {
	// 	return ((a > b) ? 1 : ((a < b) ? -1 : 0));
	// }

	if (dataType === 'int' || dataType === 'float') {
		data.sort(function(a, b) {
			return a - b;
		});
	}
	else {
		data.sort();
	}

	fnCallback(null, data);
};
