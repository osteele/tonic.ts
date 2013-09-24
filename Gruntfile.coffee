module.exports = (grunt) ->
  grunt.initConfig

    directories:
      build: '<%= directories.dev %>'
      dev: 'build'
      release: 'release'
      ':release':
        build: '<%= directories.release %>'

    browserify:
      app:
        files: [
          '<%= directories.build %>/js/app.js': [
            'app/**/*.coffee'
            'lib/**/*.coffee'
          ]
        ]
        options:
          transform: ['coffeeify']
          debug: true
          fast: true
          alias: []
          # aliasMappings: [
          #   # {'lib/browser/canvas.coffee': 'canvas'}
          #   {
          #     cwd: 'lib'
          #     src: ['*.coffee', '!books', '!movies']
          #     dst: '.'
          #   }
          # ]

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
        ':release':
          pretty: false

    sass:
      app:
        expand: true
        cwd: 'app'
        dest: '<%= directories.build %>'
        src: ['css/**.scss', '!css/_*']
        ext: '.css'
        filter: 'isFile'
      options:
        sourcemap: true
        ':release':
          sourcemap: false
          style: 'compressed'

    watch:
      options:
        livereload: true
      gruntfile:
        files: 'Gruntfile.coffee'
        tasks: ['coffeelint:gruntfile', 'build']
      jade:
        files: '<%= jade.app.src %>'
        tasks: ['jade']
      sass:
        files: ['<%= sass.app.src %>']
        tasks: ['sass']
      scripts:
        files: '<%= browserify.app.src %> '
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
  grunt.registerTask 'build:release', ['context:release', 'build']
  grunt.registerTask 'deploy', ['build:release', 'gh-pages']
  grunt.registerTask 'default', ['build', 'connect', 'watch']
