module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      lib:
        expand: true
        cwd: 'lib'
        src: '**/*.coffee'
        dest: 'dist'
        ext: '.js'
        options:
          bare: true
          sourceMap: true

    clean:
      dist: 'dist/*'

    coffeelint:
      lib: ['lib/**/*.coffee', 'test/**/*.coffee']
      gruntfile: 'Gruntfile.coffee'
      options:
        max_line_length: { value: 120 }

    update:
      tasks: ['coffee']

    mochaTest:
      test:
        # src: ['test/test_scales.{js,coffee}']
        src: ['test/**/*.{js,coffee}']
        options:
          bail: true
          reporter: 'min'

    watch:
      gruntfile:
        tasks: ['coffeelint:gruntfile']
      mochaTest:
        files: ['{lib,test}/**/*.{js,coffee}']
      scripts:
        tasks: ['coffeelint:lib', 'coffee']

  require('load-grunt-tasks')(grunt)

  grunt.registerTask 'build', ['clean', 'coffee']
  grunt.registerTask 'test', ['mochaTest']
  grunt.registerTask 'default', ['test', 'update', 'autowatch']
