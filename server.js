
/*
*
* Express
*
*/

const express = require('express');
const app = express();


/*
*
* Configuration
*
*/

require('./config/express')(app, express);


/*
*
* Routes
*
*/

require('./routes')(app, express);



/*
*
* Start Server
*
*/

console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
app.listen(app.get('port'), function() {
	console.log(Date.now(), 'Express server listening on port ' + app.get('port'));
});
