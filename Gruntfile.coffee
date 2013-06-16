module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffeelint:
      app: ['lib/*.coffee']
      options:
        max_line_length: { value: 120 }
    shell:
      makeBuildDir:
        command: 'mkdir build'
      runAll:
        command: './bin/make-chord-book all'
        options:
          stdout: true
          stderr: true
    watch:
      scripts:
        files: ['**/*.coffee', 'bin/make-chord-book']
        tasks: ['coffeelint', 'shell:makeBuildDir', 'shell:runAll']
        options:
          nospawn: true,

  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-shell'

  grunt.registerTask 'default', ['watch']
