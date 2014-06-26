'use strict';


module.exports = function(req, res, next) {
	var robots = [];
	robots.push('# ' + req.headers.host);

	if (req.headers.host !== 'local-dialysis.com') {
		robots.push('# Non-canonical domain');
		robots.push('# Use http://local-dialysis.com');
		robots.push('');
		robots.push('User-agent: *');
		robots.push('Disallow: /');
		robots.push('');
	}
	else {
		robots.push('');
		robots.push('User-agent: *');
		robots.push('Disallow: /api/');
		robots.push('');


		robots.push('');
		robots.push('Sitemap: /sitemap.xml');
		robots.push('');
	}
	
	res.end(robots.join('\n'));
};