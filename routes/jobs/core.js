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

const _ = require('lodash');
const async = require('async');
const moment = require('moment');
const numeral = require('numeral');
const request = require('request');


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



	var q = 'Dialysis OR Hemodialysis OR "Peritoneal Dialysis"';
	var l = '';


	var title = 'Dialysis Provider Job Openings';
	var description = util.format('Job openings at %s Medicare certified dialysis facilties', numeral(place.numFacilities).format('0,0'));

	var pageTitle = util.format('Dialysis Job Openings');
	// var pageDescription = description;
	var canonical = place.getLink('jobs');



	if (place.type === 'provider') {
		title = util.format('%s Job Openings', place.name);
		description = util.format('Job openings at %s and other dialysis related facilties in the area surrounding %s', place.name, place.city.placeName);

		pageTitle = title;
		q = util.format('"%s" OR %s', place.name, q);
		l = place.zip;
	}
	else if (place.type !== 'nation') {
		title = util.format('%s %s', place.placeName, title);
		description = util.format('%s in %s', description, place.placeName);

		pageTitle = util.format('%s <nobr>%s</nobr>', place.placeName, pageTitle);

		l = place.placeName;
	}



	var requestParams = {
		publisher: '8759038810009841',
		v: 2,
		format: 'json',
		chnl: 'local-dialysis',
		userip: req.ip,
		useragent: req.headers['user-agent'],
		highlight: 0,

		start: options.startRow,
		limit: options.perPage,
		q: q,
		l: l,
	};

	getJobs(requestParams, function(err, jobs) {

		options.numPages = Math.ceil(jobs.totalResults / options.perPage);
		options.prevPageNum = getPrevPageNum(options.pageNum);
		options.nextPageNum = getNextPageNum(options.pageNum, options.numPages);

		options.prevPageUrl = getPageLink(options.prevPageNum, req.originalUrl);
		options.nextPageUrl = getPageLink(options.nextPageNum, req.originalUrl);
		options.firstPageUrl = getPageLink(1, req.originalUrl);
		options.lastPageUrl = getPageLink(options.numPages, req.originalUrl);


		res.render('jobs', {
			metaTitle: title,
			metaDescription: description,

			pageTitle: pageTitle,
			pageDescription: description,

			place: place,
			places: places,

			jobs: jobs,
			options: options,
			// canonical: canonical,


			moment: moment,
			numeral: numeral,
		});
	});
};




function getJobs(requestParams, fnCallback) {

	var requestUrl = url.format({
		protocol: 'http',
		hostname: 'api.indeed.com',
		pathname: '/ads/apisearch',
		query: requestParams
	});

	console.log(requestParams);
	console.log(requestUrl);

	request(requestUrl, function(error, response, data) {
		if (!error && response.statusCode == 200) {
			fnCallback(null, JSON.parse(data));
		}
		else {
			fnCallback(error, {results: []});
		}
	});

};




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

}