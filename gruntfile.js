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
			}
		},


		nodemon: {
			dev: {
				script: './server.js',
				options: {
					nodeArgs: ['--harmony'],
					ext: 'js,jade,json',
					ignore: ['node_modules/**', 'public/**', 'gruntfile.js', 'data/**'],

					// delay: 1,
					env: {
						PORT: '3003',
						NODE_ENV: 'development'
					},
					cwd: __dirname,
				}
			},
			prod: {
				script: './server.js',
				options: {
					nodeArgs: ['--harmony'],
					ext: 'js,jade,json',
					ignore: ['node_modules/**', 'public/**', 'gruntfile.js', 'data/**'],

					// delay: 1,
					env: {
						PORT: '3003',
						NODE_ENV: 'production'
					},
					cwd: __dirname,
				}
			}
		},


		watch: {
			lessApp: {
				files: [
					'./public/css/*.less'
				],
				tasks: ['less:dev'],
				options: {
					livereload: false,
				},
			},

			cssApp: {
				files: [
					'./public/css/dist/*.css',
					'!./public/css/dist/*.min.css',
				],
				tasks: ['cssmin'],
				options: {
					livereload: true,
				},
			},


			jsDev: {
				files: [
					'./public/js/**/*.js',
					'!./public/js/dist/**',
				],
				// tasks: ['uglify:appJs'],
				tasks: ['uglify'],
				options: {
					livereload: true,
				},
			},

			jsProd: {
				files: [
					'./public/js/dist/*.min.js',
				],
				options: {
					livereload: true,
				},
			},



			jadeTemplates: {
				files: [
					'./views/**/*.jade',
				],
				options: {
					livereload: true,
				},
			},
		},


		less: {
			dev: {
				files: {
					"./public/css/dist/app.css":
						"./public/css/app.less"
				},
				options: {
					sourceMap: true,
					sourceMapURL: '/css/dist/app.css.map',
					sourceMapFilename: './public/css/dist/app.css.map',
					sourceMapBasepath: './public',
				}
			},
		},


		cssmin: {
			app: {
				files: {
					'public/css/dist/app.min.css': [
						'public/css/dist/bootstrap.css',
						'public/css/dist/app.css',
					]
				}
			}
		},

		uglify: {
			options: {
				report: 'min',
				stripBanners: false,
				banner: '/*! grunt-uglify <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
				mangle: true,
				preserveComments: 'some',
			},
			appJs: {
				options: {
					sourceMap: true,
				},
				files: {
					'public/js/dist/app.min.js': [
						'public/js/app.js',
					]
				}
			},
		},

	});



	// grunt.registerTask('minify', ['cssmin:css', 'closure-compiler2:appJs', 'uglify:appJs']);
	grunt.registerTask('dev', ['less', 'cssmin', 'uglify', 'concurrent:dev']);
	grunt.registerTask('prod', ['less', 'cssmin', 'uglify', 'nodemon:prod']);
	grunt.registerTask('default', ['dev']);
	// grunt.registerTask('closure', ['uglify']);
};
