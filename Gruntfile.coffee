module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    shell:
      makeBuildDir:
        command: 'mkdir test'
      runIntervals:
        command: 'coffee intervals.coffee'
        options:
          stdout: true
    watch:
      scripts:
        files: ['**/*.coffee']
        tasks: ['shell:makeBuildDir', 'shell:runIntervals']
        options:
          nospawn: true,

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask 'default', ['watch']
