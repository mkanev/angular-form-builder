module.exports = function (grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cfg: {
      dir: 'src'
    },
    src: {
      js: '<%= cfg.dir %>/js/**/*.js',
      less: '<%= cfg.dir %>/less/**/*.less',
      templates: '<%= cfg.dir %>/partials/**/*.html'
    },
    build: {
      dest: 'dist',
      tmp: '.tmp'
    },

    clean: ['<%= build.dest %>', '<%= build.tmp %>'],

    less: {
      src: {
        files: {
          "<%= cfg.dir %>/css/app.css": "<%= cfg.dir %>/less/builder.less"
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['Gruntfile.js', '<%= src.js %>']
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
        files: '<%= jshint.files %>',
        tasks: ['prepareSripts']
      },
      less: {
        files: '<%= src.less %>',
        tasks: ['prepareStyles']
      }
    },
    connect: {
      server: {
        options: {
          protocol: 'http',
          hostname: '*',
          port: 9000,
          base: '.'
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
    }
  });

  // External tasks (grunt plugins)
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-karma');

  // Custom tasks (alias tasks)
  grunt.registerTask('dev', ['connect', 'watch']);
  grunt.registerTask('test', ['karma']);
};
