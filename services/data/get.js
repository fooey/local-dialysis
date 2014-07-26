'use strict';

const fs = require('fs');

const async = require('async');
const mkdirp = require('mkdirp');

const medicare = require(GLOBAL.paths.getService('data/medicare'));

const dataConfigSrc = GLOBAL.paths.getData('config.json');




/*
*
*	Export
*
*/
module.exports = function(callback) {
	if (require.cache.hasOwnProperty(dataConfigSrc)) {
		delete require.cache[dataConfigSrc];
	}
	var dataConfig = require(dataConfigSrc);



	async.auto({
		'mkdir': mkdirp.bind(null, GLOBAL.paths.getData('medicare')),
		'toUpdate': ['mkdir', checkForUpdates.bind(null, dataConfig)],
		'updateData': ['toUpdate', updateData],
		'updateConfig': ['updateData', updateConfig.bind(null, dataConfig)],
		// 'notify': ['updateData', sendNotification],
	}, callback);
};









function checkForUpdates(dataConfig, callback) {
	var toUpdate = [];

	async.each(
		Object.keys(dataConfig.views),
		function(viewId, nextView) {
			var view = dataConfig.views[viewId];

			var lastUpdateOnDisk = view.rowsUpdatedAt || 0;

			medicare.getView(viewId, function(err, data) {
				if (err) throw (err);
				var viewData = JSON.parse(data);

				console.log(viewId, viewData.rowsUpdatedAt, lastUpdateOnDisk, viewData.rowsUpdatedAt > lastUpdateOnDisk);

				if (viewData.rowsUpdatedAt > lastUpdateOnDisk) {
					toUpdate.push(viewData);
				}

				nextView();
			});

		},
		callback.bind(null, null, toUpdate)
	);
}


function updateData(callback, results) {
	console.log('updateData()', results.toUpdate.length);

	async.each(
		results.toUpdate,
		function(viewData, nextView) {
			var viewId = viewData.id;
			var localPath = GLOBAL.paths.getData('medicare/' + viewId + '.tmp.json');

			console.log('downloading', viewId, 'to', localPath);

			medicare.downloadJson(
				viewId,
				localPath,
				function() {
					console.log('download complete', viewId);
					nextView();
				}
			);
		},
		callback
	);
}


function updateConfig(dataConfig, callback, results) {
	console.log('updateConfig()', results.toUpdate.length);

	async.each(
		results.toUpdate,
		function(viewData, nextView) {
			var viewId = viewData.id;
			var view = dataConfig.views[viewId];

			view.rowsUpdatedAt = viewData.rowsUpdatedAt;

			nextView();
		},
		function(err, results) {
			delete require.cache[dataConfigSrc];

			fs.writeFile(
				dataConfigSrc,
				JSON.stringify(dataConfig, null, '\t'),
				callback
			);


		}
	);
}

// function sendNotification(callback, results) {
// 	console.log('sendNotification()', results.toUpdate.length);

// 	if (results.toUpdate.length) {

// 		const AmazonSES = require('amazon-ses');
//   		const ses = new AmazonSES(process.env.AMAZON_ACCESS_KEY, process.env.AMAZON_SECRET_KEY);

//   		console.log('Emailing Update Notification');

//   		ses.send({
// 			from: 'notifications@the-ln.com',
// 			to: ['heroku+local-dialysis@the-ln.com'],
// 			subject: 'Local-Dialysis.com: New Data Updated',
// 			body: {
// 				text: 'Local-Dialysis.com\nNew Data Updated'
// 			}
// 		});
// 	}

// 	callback();
// }
