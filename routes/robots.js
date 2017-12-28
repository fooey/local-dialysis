'use strict';


module.exports = function(app, req, res, next) {
	var robots = [];
	
	robots.push('');
	robots.push('User-agent: *');
	robots.push('Disallow: /api/');

	robots.push('Disallow: /*?*hemodialysis=');
	robots.push('Disallow: /*?*hemodialysistraining=');
	robots.push('Disallow: /*?*lateshift=');
	robots.push('Disallow: /*?*chain=');
	robots.push('Disallow: /*?*page=');
	robots.push('');


	robots.push('');
	robots.push('Sitemap: http://local-dialysis.com/sitemaps/geo');
	robots.push('Sitemap: http://local-dialysis.com/sitemaps/providers');
	robots.push('');
	
	
	res.end(robots.join('\n'));
};