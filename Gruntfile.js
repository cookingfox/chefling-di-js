module.exports = function (grunt) {

    // load package.json values
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        //----------------------------------------------------------------------
        // CONFIG: VARIABLES
        //----------------------------------------------------------------------

        // general values
        keys: {
            name: 'chefling'
        },
        // file paths
        paths: {
            build: './build',
            dist: './dist'
        },
        // package
        pkg: pkg,
        //----------------------------------------------------------------------
        // CONFIG: TASKS
        //----------------------------------------------------------------------

        // clean directories
        clean: {
            before: ['<%=paths.build%>', '<%=paths.dist%>'],
            after: ['<%=paths.build%>']
        },
        // combine source files
        concat: {
            target: {
                src: ['./src/hashmap.js', './src/container.js'],
                dest: '<%=paths.build%>/<%=keys.name%>.js'
            }
        },
        // add UMD wrapper
        umd: {
            main: {
                src: '<%=concat.target.dest%>',
                dest: '<%=paths.build%>/<%=keys.name%>.umd.js',
                objectToExport: 'Container',
                globalAlias: 'Container',
                indent: 4
            }
        },
        // minify code
        uglify: {
            options: {
                mangle: {
                    except: ['Container', 'HashMap']
                }
            },
            build: {
                src: '<%=umd.main.dest%>',
                dest: '<%=paths.build%>/<%=keys.name%>.min.js'
            }
        },
        // copy files
        copy: {
            main: {
                files: [
                    {
                        src: '<%=umd.main.dest%>',
                        dest: '<%=paths.dist%>/<%=keys.name%>-' + pkg.version + '.js'
                    },
                    {
                        src: '<%=uglify.build.dest%>',
                        dest: '<%=paths.dist%>/<%=keys.name%>-' + pkg.version + '.min.js'
                    }
                ]
            }
        },
        // manage versioning
        version: {
            defaults: {
                src: ['package.json', 'bower.json']
            },
            readme: {
                options: {
                    prefix: '[a-z]+\\-v',
                    replace: '\\d+(\\.\\d+){2}'
                },
                src: ['README.md']
            }
        }
    });

    //--------------------------------------------------------------------------
    // REGISTER TASKS
    //--------------------------------------------------------------------------

    // load tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-version');

    // register tasks
    grunt.registerTask('default', [
        'clean:before',
        'concat',
        'umd',
        'uglify',
        'copy',
        'clean:after'
    ]);

};
