module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    browserify:
      debug:
        files: [
          'build/js/app.js': [
            'app/**/*.coffee', '!app/js/loader.*'

            'lib/chord_diagram.coffee'
            'lib/fretboard_diagram.coffee'
            'lib/fretboard_logic.coffee'
            'lib/fretboard_model.coffee'
            'lib/harmonic_table.coffee'
            'lib/client-layout.coffee'
            'lib/pitch_diagram.coffee'
            'lib/theory.coffee'
            'lib/utils.coffee'
          ]
        ]
        options:
          transform: ['coffeeify']
          debug: true
          fast: true
          alias: [
            'lib/chord_diagram.coffee:./chord_diagram'
            'lib/fretboard_diagram.coffee:./fretboard_diagram'
            'lib/fretboard_logic.coffee:./fretboard_logic'
            'lib/fretboard_model.coffee:./fretboard_model'
            'lib/harmonic_table.coffee:./harmonic_table'
            'lib/client-layout.coffee:./layout'
            'lib/pitch_diagram.coffee:./pitch_diagram'
            'lib/theory.coffee:./theory'
            'lib/utils.coffee:./utils'
          ]
    clean:
      debug: 'build'
      release: 'release/*'
    coffee:
      debug:
        files: ['build/js/loader.js': 'app/js/loader.coffee']
    coffeelint:
      app: ['lib/*.coffee']
      gruntfile: 'Gruntfile.coffee'
      options:
        max_line_length: { value: 120 }
    connect:
      server:
        options:
          base: 'build'
    copy:
      debug:
        expand: true
        cwd: 'app'
        dest: 'build'
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
        dest: 'build'
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
      scripts:
        files: 'app/**/*.coffee'
        tasks: ['browserify:debug', 'coffee']
      # scripts:
      #   files: ['**/*.coffee', 'bin/make-chord-book']
      #   tasks: ['coffeelint', 'shell:makeBuildDir', 'shell:runAll']
      #   options:
      #     nospawn: true,

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-github-pages'
  grunt.loadNpmTasks 'grunt-notify'
  grunt.loadNpmTasks 'grunt-shell'

  grunt.registerTask 'build', ['clean:debug', 'browserify:debug', 'copy:debug', 'jade:debug']
  grunt.registerTask 'build:release', ['clean:release', 'browserify:release', 'copy:release', 'jade:release']
  grunt.registerTask 'deploy', ['build:release', 'githubPages:target']
  grunt.registerTask 'default', ['build', 'connect', 'watch']
