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

const url = require('url');
const util = require('util');
const zlib = require('zlib');

const _ = require('lodash');
const async = require('async');
const ent = require('ent');
const moment = require('moment');
const numeral = require('numeral');
const request = require('request');

const propertyCategories = {
	"1": "Hotel",
	"2": "Suite",
	"3": "Resort",
	"4": "Vacation Rental/Condo",
	"5": "Bed & Breakfast",
	"6": "All-Inclusive",
};

// const eanAmenities = require(GLOBAL.paths.getData('ean-amenities'));


/*
*
*	PUBLIC METHODS
*
*/

me.render = function(req, res, place, places) {
	var options = {
		perPage: 10,
	};
	options.pageNum = getPageNum(req.query.page);
	options.startRow = getStartRow(options.pageNum, options.perPage);
	options.endRow = getEndRow(options.pageNum, options.perPage);



	var title = util.format('%s Hotel Recommendations', place.name);
	var description = util.format('Hotels in the area surrounding %s, conveniently locationed near %s', place.city.placeName, place.name);

	var pageTitle = title;
	var pageDescription = description;



	var filters = {
		latitude: place.locationLat.toFixed(5).toString(),
		longitude: place.locationLon.toFixed(5).toString(),

		startRow: options.startRow,
		endRow: options.endRow,

		// city: 'Seattle',
		// stateProvinceCode: 'WA',

		customerSessionId: req.cookies.uid,
		customerIpAddress: req.ip,
		customerUserAgent: req.headers['user-agent'],
	};

	getHotels(filters, function(err, results) {

		options.numPages = Math.ceil(results.HotelListResponse.HotelList['@size'] / options.perPage);
		options.prevPageNum = getPrevPageNum(options.pageNum);
		options.nextPageNum = getNextPageNum(options.pageNum, options.numPages);

		options.prevPageUrl = getPageLink(options.prevPageNum, req.originalUrl);
		options.nextPageUrl = getPageLink(options.nextPageNum, req.originalUrl);
		options.firstPageUrl = getPageLink(1, req.originalUrl);
		options.lastPageUrl = getPageLink(options.numPages, req.originalUrl);

		// res.send({
		// 	options: options,
		// 	results: results,
		// });

		res.render('hotels', {
			metaTitle: title,
			metaDescription: description,

			pageTitle: pageTitle,
			pageDescription: description,

			place: place,
			places: places,

			hotels: results.HotelListResponse.HotelList.HotelSummary,
			eanError: results.HotelListResponse.EanWsError || null,
			options: options,
			// canonical: canonical,


			moment: moment,
			numeral: numeral,

			propertyCategories: propertyCategories,

			getStarIcons: getStarIcons,
			getAmenities: getAmenities,
			// amenities: amenities,

			// eanAmenities: eanAmenities,
			// arrayFromMask: arrayFromMask,
		});
	});
};




function getHotels(filters, fnCallback) {
	// console.log(requestParams);

	var requestParams = _.defaults(filters, {
		// cid: "337937",
		cid: process.env.EAN_CID,
		apiKey: process.env.EAN_API_KEY,

		locale: 'en_US',
		_type: 'json',
		includeDetails: 0,
		minorRev: 26,
	});

	requestParams.sig = getSignature(requestParams.apiKey, process.env.EAN_SECRET_KEY);


	var requestUrl = url.format({
		protocol: 'http',
		hostname: process.env.EAN_HOST_NAME,
		pathname: '/ean-services/rs/hotel/v3/list',
		query: requestParams
	});

	console.log('getHotels()', requestParams);
	// console.log(requestUrl);

	getFromEAN(
		requestUrl,
		prepareResults.bind(null, fnCallback, filters)
	);
};



function getSignature(apiKey, secretKey) {
	var toHash = apiKey + secretKey + Date.now().toString();
	var hash = require('crypto').createHash('md5').update(toHash).digest("hex");
	// console.log(Date.now().toString());
	// console.log(toHash);
	// console.log(hash);
	return hash;
}



function getFromEAN(requestUrl, fnCallback) {
	var requestOptions = {
		uri: requestUrl,
		headers: {"accept-encoding" : "gzip,deflate"}
	};
	console.log('getFromEAN()', requestOptions);
	
	var req = request.get(requestOptions);


	req.on('response', function(res) {
		var chunks = [];
		res.on('data', function(chunk) {
			chunks.push(chunk);
		});

		res.on('end', function() {
			var buffer = Buffer.concat(chunks);
			var encoding = res.headers['content-encoding'];
			if (encoding == 'gzip') {
				zlib.gunzip(buffer, function(err, decoded) {
					fnCallback(err, decoded && decoded.toString());
				});
			}
			else if (encoding == 'deflate') {
				zlib.inflate(buffer, function(err, decoded) {
					fnCallback(err, decoded && decoded.toString());
				});
			}
			else {
				fnCallback(null, buffer.toString());
			}
		});
	});

	req.on('error', function(err) {
		fnCallback(err);
	});
}


function prepareResults(fnCallback, filters, err, data) {
	// console.log('prepareResults()', filters);
	var results = JSON.parse(data);


	results.HotelListResponse.HotelList = results.HotelListResponse.HotelList || {};
	results.HotelListResponse.HotelList.HotelSummary = results.HotelListResponse.HotelList.HotelSummary || [];


	var hotels = results.HotelListResponse.HotelList.HotelSummary.slice(filters.startRow, filters.endRow);

	_.map(hotels, function(hotel) {
		hotel.name = ent.decode(hotel.name);
		hotel.shortDescription = ent.decode(hotel.shortDescription);
		hotel.deepLink = ent.decode(hotel.deepLink);
		hotel.thumbNailUrl = (hotel.thumbNailUrl) ? "http://images.travelnow.com" + hotel.thumbNailUrl.replace('_t.jpg', '_b.jpg') : null;

		// hotel.amenities = getAmenities(hotel.amenityMask);

		return hotel;
	});


	results.HotelListResponse.HotelList.HotelSummary = hotels;

	fnCallback(err, results);
}



function getPageNum(qryPage) {
	var pageNum = qryPage || 1;
	if (pageNum !== 'viewall' && isNaN(pageNum)) {
		pageNum = 1;
	}
	return _.parseInt(pageNum);
};



function getPrevPageNum(pageNum) {
	return Math.max(1, pageNum - 1);
}

function getNextPageNum(pageNum, numPages) {
	return Math.min(numPages, pageNum + 1);
}


function getStartRow(pageNum, perPage) {
	if (pageNum === 'viewall') return 0;

	return ((pageNum - 1) * perPage);
};


function getEndRow(pageNum, perPage) {
	if (pageNum === 'viewall') return Infinity;

	return getStartRow(pageNum, perPage) + perPage;
};



function getPageLink(pageNum, originalUrl) {

	var urlObj = url.parse(originalUrl, true);
	urlObj.query.page = pageNum;

	if (pageNum === 1) {
		delete urlObj.query.page;
	};

	return url.format({
		pathname: urlObj.pathname,
		query: urlObj.query,
	});

};

function getStarIcons(num) {
	var icons = [];

	if (parseInt(num) === 'NaN') {
		return '';
	}

	var whole = parseInt(num) || 0;
	var partial = (whole === num) ? 0 : 1;
	var empty = 5 - whole - partial;

	for (let i = 0; i < whole; i++) {
		icons.push('star');
	}

	if (partial) {
		icons.push('star-half-o');
	}

	for (let i = 0; i < empty; i++) {
		icons.push('star-o');
	}

	//var icon = '<i class="fa fa-star"></i>';
	var iconOpen = '<i class="fa fa-';
	var iconClose = '"></i>';

	return (
		iconOpen
		 + icons.join(iconClose + iconOpen)
		 + iconClose
	);
}


function getAmenities(mask) {
	const eanAmenities = {
		"1": 'Business Center',
		"2": 'Fitness Center',
		"4": 'Hot Tub On-site',
		"8": 'Internet Access Available',
		"16": 'Kids\' Activities',
		"32": 'Kitchen or Kitchenette',
		"64": 'Pets Allowed',
		"128": 'Pool',
		"256": 'Restaurant On-site',
		"512": 'Spa On-site',
		"1024": 'Whirlpool Bath Available',
		"2048": 'Breakfast',
		"4096": 'Babysitting',
		"8192": 'Jacuzzi',
		"16384": 'Parking',
		"32768": 'Room Service',
		"65536": 'Accessible Path of Travel',
		"131072": 'Accessible Bathroom',
		"262144": 'Roll-in Shower',
		"524288": 'Handicapped Parking',
		"1048576": 'In-room Accessibility',
		"2097152": 'Accessibility Equipment for the Deaf',
		"4194304": 'Braille or Raised Signage',
		"8388608": 'Free Airport Shuttle',
		"16777216": 'Indoor Pool',
		"33554432": 'Outdoor Pool',
		"67108864": 'Extended Parking',
		"134217728": 'Free Parking'
	};

	var amenities = [];

	// console.log(mask);
	_.each(eanAmenities, function(val, key) {
		if (mask & key) {
			amenities.push(val);
		}
	});

	return amenities.join(', ');
}



// function arrayFromMask(nMask) {
// 	// nMask must be between -2147483648 and 2147483647
// 	if (nMask > 0x7fffffff || nMask < -0x80000000) { 
// 		throw new TypeError("arrayFromMask - out of range"); 
// 	}
// 	for (var nShifted = nMask, aFromMask = []; nShifted; 
// 		aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1);
// 	return aFromMask;
// }