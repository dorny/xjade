/*
 * xjade-example
 * https://github.com/dorny/xjade-example
 *
 * Copyright (c) 2014 Michal Dorner
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

    grunt.initConfig({

        clean: ['www/index.html','www/lib/tpl/*.js'],

        xjade: {
            index: {
                src: 'www/index.xjade',
                dest: 'www/index.html',
                options: {
                    compile: 'html',
                    pretty: true
                }
            },

            views: {
                files: [{
                    expand: true,
                    src: ['www/**/tpl/*.xjade'],
                    ext: '.js',
                }],
            }
        },

        watch: {
            index: {
                files: ['www/index.xjade'],
                tasks: ['xjade:index'],
            },
            views: {
                files: ['www/**/tpl/*.xjade'],
                tasks: ['xjade:views']
            },
            livereload: {
                files: ['www/**/*.js','www/**/*.css', 'www/**/*.html'],
                options: { livereload: true }
            },
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-xjade');

    grunt.registerTask('default', ['xjade']);
}
