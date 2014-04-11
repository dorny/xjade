module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: ['lib/**/*.js'],

        shell: {
            options: {
                    failOnError: true,
                    stdout: true,
            },
            source: {
                command: 'node_modules/pegjs/bin/pegjs lib/parser/source.pegjs',
            },
            template: {
                command: 'node_modules/pegjs/bin/pegjs lib/parser/template.pegjs',
            },
            splitcode: {
                command: 'node_modules/pegjs/bin/pegjs lib/parser/splitcode.pegjs',
            }
        },

        ts: {
            options: {
                target: 'es5',
                module: 'commonjs',
                sourcemap: false,
                declaration: false,
            },

            lib: {
                src: ["lib/**/*.ts"],
                outDir: 'lib'
            },
        },

        watch: {
            shell: {
                files: ['lib/parser/source.pegjs','lib/parser/template.pegjs','lib/parser/splitcode.pegjs'],
                tasks: ['shell'],
            },
            ts: {
                files: ['lib/**/*.ts'],
                tasks: ['ts:lib'],
            },
        },

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['clean','shell','ts']);
}
