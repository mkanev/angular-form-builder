module.exports = function (grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cfg: {
      dir: 'src',
      tmp: '.tmp'
    },
    src: {
      js: '<%= cfg.dir %>/js/**/*.js',
      less: '<%= cfg.dir %>/less/**/*.less',
      templates: '<%= cfg.dir %>/partials/**/*.html'
    },
    demo: {
      dest: 'demo'
    },
    build: {
      dest: 'dist'
    },

    clean: {
      options: {
        force: true
      },
      prod: ['<%= build.dest %>']
    },

    less: {
      demo: {
        files: {
          "<%= demo.dest %>/css/demo.css": "<%= cfg.dir %>/less/demo.less"
        }
      },
      prod: {
        options: {
          cleancss: true
        },
        files: {
          "<%= build.dest %>/form-builder.css": "<%= cfg.dir %>/less/builder.less"
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['Gruntfile.js', '<%= src.js %>']
    },

    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          '<%= build.dest %>/form-builder.min.js' : ['<%= build.dest %>/form-builder.js'],
          '<%= build.dest %>/form-components.min.js' : '<%= build.dest %>/form-components.js'
        }
      }
    },

    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: ['<%= cfg.dir %>/js/controller.js', '<%= cfg.dir %>/js/directive.js', '<%= cfg.dir %>/js/drag.js', '<%= cfg.dir %>/js/provider.js', '<%= cfg.dir %>/js/builder.js'],
        dest: '<%= build.dest %>/form-builder.js'
      }
    },

    copy: {
      demo: {
        src: '<%= cfg.dir %>/js/demo.js',
        dest: '<%= demo.dest %>/js'
      },
      prod: {
        src: '<%= cfg.dir %>/js/components.js',
        dest: '<%= build.dest %>/form-components.js'
      }
    },

    /*coffee: {
     source: {
     files: {
     'dist/angular-form-builder.js': ['src*//*.coffee']
     }
     },
     components: {
     files: {
     'dist/angular-form-builder-components.js': ['components*//*.coffee']
     }
     },
     demo: {
     files: {
     'example/demo.js': 'example/demo.coffee'
     }
     }
     },*/
    watch: {
      js: {
        files: '<%= src.js %>',
        tasks: ['jshint']
      },
      less: {
        files: '<%= src.less %>',
        tasks: ['less:demo']
      }
    },
    connect: {
      demo: {
        options: {
          protocol: 'http',
          port: 9000,
          base: '.',
          keepalive: true
        }
      }
    },
    karma: {
      min: {
        configFile: 'test/karma-min.config.coffee'
      },
      source: {
        configFile: 'test/karma.config.coffee'
      }
    },

    concurrent: {
      demo: {
        tasks: ['watch', 'connect:demo'],
        options: {
          logConcurrentOutput: true
        }
      },
      prod: {
        tasks: ['buildJs', 'buildCss']
      }
    }
  });

  // External tasks (grunt plugins)
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-karma');

  // Custom tasks (alias tasks)
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('dev', ['jshint', 'less:demo', 'concurrent:demo']);
  grunt.registerTask('buildJs', ['concat', 'copy:prod', 'uglify']);
  grunt.registerTask('buildCss', ['less:prod']);
  grunt.registerTask('build', ['clean:prod', 'jshint', 'concurrent:prod']);
};
