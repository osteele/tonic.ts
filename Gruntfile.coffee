module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffeelint:
      app: ['**/*.coffee']
      options:
        max_line_length: { value: 120 }
    shell:
      makeBuildDir:
        command: 'mkdir test'
      runIntervals:
        command: 'coffee intervals.coffee flipbook'
        options:
          stdout: true
          stderr: true
    watch:
      scripts:
        files: ['**/*.coffee']
        tasks: ['coffeelint', 'shell:makeBuildDir', 'shell:runIntervals']
        options:
          nospawn: true,

  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-shell'

  grunt.registerTask 'default', ['watch']
