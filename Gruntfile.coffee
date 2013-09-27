module.exports = (grunt) ->
  grunt.initConfig

    directories:
      dev: 'build'
      release: 'release'
      build: '<%= directories.dev %>'
      build$release: '<%= directories.release %>'

    browserify:
      app:
        files: {
          '<%= directories.build %>/js/app.js': [
            'app/**/*.coffee'
            'lib/**/*.coffee'
          ]
        }
        options:
          transform: ['coffeeify']
          debug: true
          debug$release: false
          fast: true
          alias: []

    clean:
      dev: '<%= directories.dev %>'
      release: '<%= directories.release %>/*'
      target: '<%= directories.build %>/*'

    coffeelint:
      app: ['lib/*.coffee']
      gruntfile: 'Gruntfile.coffee'
      options:
        max_line_length: { value: 120 }

    connect:
      server:
        options:
          base: '<%= directories.build %>'

    copy:
      app:
        expand: true
        cwd: 'app'
        dest: '<%= directories.build %>'
        src: ['**/*', '!**/*.coffee', '!**/*.{coffee,jade,scss}']
        filter: 'isFile'

    'gh-pages':
      options:
        base: '<%= directories.release %>'
      src: '**/*'

    jade:
      app:
        expand: true
        cwd: 'app'
        src: '**/*.jade'
        dest: '<%= directories.build %>'
        ext: '.html'
      options:
        pretty: true
        pretty$release: false

    sass:
      app:
        expand: true
        cwd: 'app'
        dest: '<%= directories.build %>'
        src: ['css/**/*.scss', '!**/_*']
        ext: '.css'
        filter: 'isFile'
      options:
        sourcemap: true
        _release:
          sourcemap: false
          style: 'compressed'

    update:
      tasks: ['browserify', 'copy', 'jade', 'sass']

    watch:
      options:
        livereload: true
      gruntfile:
        files: 'Gruntfile.coffee'
        tasks: ['coffeelint:gruntfile', 'build']
      jade: {}
      sass: {}
      scripts:
        files: '<%= directories.build %>/js/app.js'
        tasks: ['browserify']

  # TODO use grunt.file.expandMapping ?
  # TODO maybe aliasMap is now sufficient?
  do ->
    path = require 'path'
    propertyName = 'browserify.app.options.alias'
    files = grunt.file.expand('lib/*.coffee')
    aliases = ("#{name}:./#{path.basename name, '.coffee'}" for name in files)
    grunt.config.set propertyName, grunt.config.get(propertyName).concat(aliases)

  require('load-grunt-tasks')(grunt)
  grunt.loadTasks 'tasks'

  grunt.registerTask 'build', ['clean:target', 'browserify', 'copy', 'jade', 'sass']
  grunt.registerTask 'build:release', ['contextualize:release', 'build']
  grunt.registerTask 'deploy', ['build:release', 'gh-pages']
  grunt.registerTask 'default', ['update', 'connect', 'autowatch']
