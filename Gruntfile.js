/*global module:false*/
require('babel-register');
var _ = require('lodash');
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        autoWatch: false
      }
    },

    clean: {
      build: ['website/build']
    },

    cssmin: {
      dist: {
        options: {
          report: 'gzip'
        },
        files:{
          "website/assets/sprites/dist/habitrpg-shared.css": [
            "website/assets/sprites/dist/spritesmith*.css",
            "website/assets/sprites/css/backer.css",
            "website/assets/sprites/css/Mounts.css",
            "website/assets/sprites/css/index.css"
          ]
        }
      }
    },

    stylus: {
      build: {
        options: {
          compress: false, // AFTER
          'include css': true,
          paths: ['website/client-old']
        },
        files: {
          'website/build/app.css': ['website/client-old/css/index.styl'],
          'website/build/static.css': ['website/client-old/css/static.styl']
        }
      }
    },

    copy: {
      build: {
        files: [
          {expand: true, cwd: 'website/client-old/', src: 'favicon.ico', dest: 'website/build/'},
          {expand: true, cwd: 'website/client-old/', src: 'favicon_192x192.png', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'website/assets/sprites/dist/spritesmith*.png', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'website/assets/sprites/backer-only/*.gif', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'website/assets/sprites/npc_ian.gif', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'website/assets/sprites/quest_*.gif', dest: 'website/build/'},
          {expand: true, cwd: 'website/client-old/', src: 'bower_components/bootstrap/dist/fonts/*', dest: 'website/build/'}
        ]
      }
    },

    // UPDATE IT WHEN YOU ADD SOME FILES NOT ALREADY MATCHED!
    hashres: {
      build: {
        options: {
          fileNameFormat: '${name}-${hash}.${ext}'
        },
        src: [
          'website/build/*.js',
          'website/build/*.css',
          'website/build/favicon.ico',
          'website/build/favicon_192x192.png',
          'website/build/website/assets/sprites/dist/*.png',
          'website/build/website/assets/sprites/backer-only/*.gif',
          'website/build/website/assets/sprites/npc_ian.gif',
          'website/build/website/assets/sprites/quest_*.gif',
          'website/build/bower_components/bootstrap/dist/fonts/*'
        ],
        dest: 'website/build/*.css'
      }
    }
  });

  //Load build files from client-old/manifest.json
  grunt.registerTask('loadManifestFiles', 'Load all build files from client-old/manifest.json', function(){
    var files = grunt.file.readJSON('./website/client-old/manifest.json');
    var uglify = {};
    var cssmin = {};

    _.each(files, function(val, key){

      var js = uglify['website/build/' + key + '.js'] = [];

      _.each(files[key].js, function(val){
        var path = "./";
        if( val.indexOf('common/') == -1)
          path = './website/client-old/';
        js.push(path + val);
      });

      var css = cssmin['website/build/' + key + '.css'] = [];

      _.each(files[key].css, function(val){
        var path = "./";
        if( val.indexOf('common/') == -1) {
          path = (val == 'app.css' || val == 'static.css') ?  './website/build/' : './website/client-old/';
        }
        css.push(path + val)
      });

    });

    grunt.config.set('uglify.build.files', uglify);
    grunt.config.set('uglify.build.options', {compress: false});

    grunt.config.set('cssmin.build.files', cssmin);
    // Rewrite urls to relative path
    grunt.config.set('cssmin.build.options', {'target': 'website/client-old/css/whatever-css.css'});
  });

  // Register tasks.
  grunt.registerTask('build:prod', ['loadManifestFiles', 'clean:build', 'uglify', 'stylus', 'cssmin', 'copy:build', 'hashres']);
  grunt.registerTask('build:dev', ['cssmin', 'stylus']);
  grunt.registerTask('build:test', ['test:prepare:translations', 'build:dev']);

  grunt.registerTask('test:prepare:translations', function() {
    var i18n  = require('./website/server/libs/i18n'),
        fs    = require('fs');
    fs.writeFileSync('test/spec/mocks/translations.js',
      "if(!window.env) window.env = {};\n" +
      "window.env.translations = " + JSON.stringify(i18n.translations['en']) + ';');
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hashres');
  grunt.loadNpmTasks('grunt-karma');

};
