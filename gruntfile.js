module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-closure-compiler');


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concurrent: {
			dev: {
				tasks: ['nodemon:dev', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			},
			debug: {
				tasks: ['nodemon:dev', 'node-inspector', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		nodemon: {
			dev: {
				script: './server.js',
				options: {
					nodeArgs: ['--harmony'],
					ext: 'js,jade,json',
					ignore: [
						'node_modules/**', 
						'public/**', 
						'gruntfile.js', 
						'appdata/**'
					],

					delay: 100,
					env: {
						PORT: '3000',
						NODE_ENV: 'development',
						CACHE_SIZE: '256',
						EAN_CID: '337937',
						EAN_API_KEY: '6cx6vh8je4dbkc8qfycdjpas',
						EAN_SECRET_KEY: 'A9SbgU4V',
						EAN_HOST_NAME: 'api.ean.com',
					},
					cwd: __dirname,

					callback: function(nodemon) {
						function writeReboot() {
							setTimeout(function() {
								require('fs').writeFileSync('.rebooted', Date.now());
							}, 100);
						}

						// watch "./.reboot" to refresh browser when server starts or reboots
						nodemon.on('start', writeReboot);
						nodemon.on('restart', writeReboot);
					}
				},
			},

			prod: {
				script: './server.js',
				options: {
					nodeArgs: ['--harmony'],
					ext: 'js,jade,json',
					ignore: ['node_modules/**', 'public/**', 'gruntfile.js', 'appdata/**'],

					// delay: 1,
					env: {
						CACHE_SIZE: '256',
						EAN_CID: '337937',
						EAN_API_KEY: '6cx6vh8je4dbkc8qfycdjpas',
						EAN_SECRET_KEY: 'A9SbgU4V',
						EAN_HOST_NAME: 'api.ean.com',
					},
					cwd: __dirname,
				}
			}
		},


		watch: {
			lessApp: {
				files: [
					'./public/src/css/*.less'
				],
				tasks: ['less:dev'],
				options: {
					livereload: false,
				},
			},

			cssApp: {
				files: [
					'./public/dist/css/*.css',
					'!./public/dist/css/*.min.css',
				],
				tasks: ['cssmin'],
				options: {
					livereload: true,
				},
			},


			jsDev: {
				files: [
					'./public/src/js/**/*.js',
					'!./public/dist/js/**',
				],
				// tasks: ['uglify:appJs'],
				tasks: ['uglify'],
				options: {
					livereload: true,
				},
			},

			jsProd: {
				files: [
					'./public/dist/js/*.min.js',
				],
				options: {
					livereload: true,
				},
			},


			server: {
				files: ['./.rebooted'],
				options: {
					livereload: true
				}
			},
		},


		less: {
			dev: {
				files: {
					"./public/dist/css/app.css":
						"./public/src/css/app.less"
				},
				options: {
					sourceMap: true,
					sourceMapURL: '/dist/css/app.css.map',
					sourceMapFilename: './public/dist/css/app.css.map',
					sourceMapBasepath: './public/src',
					sourceMapRootpath: '/',
				}
			},
		},


		cssmin: {
			app: {
				files: {
					'public/dist/css/app.min.css': [
						'public/dist/css/bootstrap.css',
						'public/dist/css/app.css',
					]
				}
			}
		},

		uglify: {
			options: {
				report: 'min',
				stripBanners: false,
				// banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
				mangle: true,
				preserveComments: 'some',
			},
			appJs: {
				options: {
					sourceMap: true,
				},
				files: {
					'public/dist/js/app.min.js': [
						'public/src/js/app.js',
					]
				}
			},
		},

	});



	// grunt.registerTask('minify', ['cssmin:css', 'closure-compiler2:appJs', 'uglify:appJs']);
	grunt.registerTask('dev', ['less', 'cssmin', 'uglify', 'concurrent:dev']);
	grunt.registerTask('debug', ['less', 'cssmin', 'uglify', 'concurrent:debug']);
	grunt.registerTask('build', ['less', 'cssmin', 'uglify']);
	grunt.registerTask('prod', ['build', 'nodemon:prod']);
	grunt.registerTask('default', ['dev']);
	// grunt.registerTask('closure', ['uglify']);
};
