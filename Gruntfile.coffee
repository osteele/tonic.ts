module.exports = (grunt) ->
  grunt.initConfig

    options:
      build_directory: 'build'

    browserify:
      app:
        files: [
          '<%= options.build_directory %>/js/app.js': [
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
      target: '<%= options.build_directory %>'
      release: 'release/*'

    coffeelint:
      app: ['lib/*.coffee']
      gruntfile: 'Gruntfile.coffee'
      options:
        max_line_length: { value: 120 }

    connect:
      server:
        options:
          base: '<%= options.build_directory %>'

    copy:
      app:
        expand: true
        cwd: 'app'
        dest: '<%= options.build_directory %>'
        src: ['**/*', '!**/*.coffee', '!**/*.{coffee,jade,scss}']
        filter: 'isFile'

    jade:
      app:
        expand: true
        cwd: 'app'
        src: '**/*.jade'
        dest: '<%= options.build_directory %>'
        ext: '.html'
        options:
          pretty: true

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
      scripts:
        files: 'app/**/*.coffee'
        tasks: ['browserify']

  do ->
    path = require 'path'
    propertyName = 'browserify.app.options.alias'
    files = grunt.file.expand('lib/*.coffee', '!lib/books', '!lib/movies')
    aliases = ("#{name}:./#{path.basename name, '.coffee'}" for name in files)
    grunt.config.set propertyName, grunt.config.get(propertyName).concat(aliases)

  # grunt.loadNpmTask 'grunt-contrib-connect'
  require('load-grunt-tasks')(grunt)

  grunt.registerTask 'build', ['clean', 'browserify', 'copy', 'jade']
  # grunt.registerTask 'build:release', ['clean:release', 'browserify:release', 'copy:release', 'jade:release']
  # grunt.registerTask 'deploy', ['build:release', 'githubPages:target']
  grunt.registerTask 'default', ['build', 'connect', 'watch']
