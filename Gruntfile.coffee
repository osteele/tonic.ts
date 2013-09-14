module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    build_directory: 'build'
    browserify:
        files: [
          '<%= build_directory %>/js/app.js': [
            'app/**/*.coffee'
            'lib/**/*.coffee', '!lib/books/**/*.coffee', '!lib/movies/**/*.coffee'
          ]
        ]
        options:
          transform: ['coffeeify']
          debug: true
          fast: true
          alias: [
            'lib/browser/layout.coffee:./layout'
            'lib/browser/canvas.coffee:canvas'
          ]
    clean:
      debug: '<%= build_directory %>'
      release: 'release/*'
    coffeelint:
      app: ['lib/*.coffee']
      gruntfile: 'Gruntfile.coffee'
      options:
        max_line_length: { value: 120 }
    connect:
      server:
        options:
          base: '<%= build_directory %>'
    copy:
      debug:
        expand: true
        cwd: 'app'
        dest: '<%= build_directory %>'
        src: ['**/*', '!**/*.coffee', '!**/*.jade', '!**/*.scss']
        filter: 'isFile'
      release:
        expand: true
        cwd: 'app'
        dest: 'release'
        src: ['**/*', '!**/*.coffee', '!**/*.jade', '!**/*.scss']
        filter: 'isFile'
    githubPages:
      target:
        src: 'release'
    jade:
      debug:
        expand: true
        cwd: 'app'
        src: '**/*.jade'
        dest: '<%= build_directory %>'
        ext: '.html'
        options:
          pretty: true
      release:
        expand: true
        cwd: 'app'
        src: '**/*.jade'
        dest: 'release'
        ext: '.html'
    shell:
      makeBuildDir:
        command: 'mkdir build'
      runAll:
        command: './bin/make-chord-book all'
        options:
          stdout: true
          stderr: true
    watch:
      options:
        livereload: true
      gruntfile:
        files: 'Gruntfile.coffee'
        tasks: ['coffeelint:gruntfile', 'build:debug']
      jade:
        files: 'app/**/*.jade'
        tasks: ['jade:debug']
      lib:
        files: 'lib/**/*.coffee'
        tasks: ['browserify:debug']
      scripts:
        files: 'app/**/*.coffee'
        tasks: ['browserify:debug']

  do ->
    path = require 'path'
    propertyName = 'browserify.debug.options.alias'
    files = grunt.file.expand('lib/*.coffee', '!lib/books', '!lib/movies')
    aliases = ("#{name}:./#{path.basename name, '.coffee'}" for name in files)
    grunt.config.set propertyName, grunt.config.get(propertyName).concat(aliases)

  require('load-grunt-tasks')(grunt)

  grunt.registerTask 'build', ['clean:debug', 'browserify:debug', 'copy:debug', 'jade:debug']
  grunt.registerTask 'build:release', ['clean:release', 'browserify:release', 'copy:release', 'jade:release']
  grunt.registerTask 'deploy', ['build:release', 'githubPages:target']
  grunt.registerTask 'default', ['build', 'connect', 'watch']
