"use strict";

const zlib = require('zlib');
const request = require('request');


var me = module.exports = {};


me.requestJson = function requestJson(requestUrl, fnCallback) {
	me.requestCompressed(requestUrl, function(err, data) {
		fnCallback(err, parseJson(data));
	});
};


me.requestCompressed = function requestCompressed(requestUrl, fnCallback) {
	var requestOptions = {
		uri: requestUrl,
		headers: {"accept-encoding" : "gzip,deflate"}
	};
	
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



function parseJson(data) {
	var results;

	try {
		results = JSON.parse(data);
	}
	catch (e) {}

	return results;
}