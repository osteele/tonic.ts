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
            'lib/**/*.coffee', '!lib/books/**/*.coffee', '!lib/movies/**/*.coffee'
          ]
        ]
        options:
          transform: ['coffeeify']
          debug: true
          fast: true
          alias: [
            'lib/browser/canvas.coffee:canvas'
          ]

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
        src: ['css/**.scss']
        ext: '.css'
        filter: 'isFile'
      options:
        sourcemap: true
        ':release':
          sourcemap: false
          style: 'compressed'

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
        tasks: ['coffeelint:gruntfile', 'build']
      jade:
        files: 'app/**/*.jade'
        tasks: ['jade']
      lib:
        files: 'lib/**/*.coffee'
        tasks: ['browserify']
      sass:
        files: ['app/**/*.scss']
        tasks: ['sass']
      scripts:
        files: 'app/**/*.coffee'
        tasks: ['browserify']

  do ->
    path = require 'path'
    propertyName = 'browserify.app.options.alias'
    files = grunt.file.expand('lib/*.coffee', '!lib/books', '!lib/movies')
    aliases = ("#{name}:./#{path.basename name, '.coffee'}" for name in files)
    grunt.config.set propertyName, grunt.config.get(propertyName).concat(aliases)

  require('load-grunt-tasks')(grunt)

  grunt.registerTask 'context', (contextName) ->
    contextKey = ":#{contextName}"
    installContexts = (obj) ->
      recursiveMerge obj, obj[contextKey] if contextKey of obj
      for k, v of obj
        installContexts v if typeof v == 'object' and not k.match(/^:/)
    recursiveMerge = (target, source) ->
      for k, v of source
        if k of target and typeof v == 'object'
          recursiveMerge target[k], v
        else
          target[k] = v
    installContexts grunt.config.data
    return

  grunt.registerTask 'build', ['clean:target', 'browserify', 'copy', 'jade', 'sass']
  grunt.registerTask 'build:release', ['context:release', 'build']
  grunt.registerTask 'deploy', ['build:release', 'gh-pages']
  grunt.registerTask 'default', ['build', 'connect', 'watch']
