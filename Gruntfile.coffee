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
      lib: ['lib/*.coffee']
      gruntfile: 'Gruntfile.coffee'
      options:
        max_line_length: { value: 120 }

    update:
      tasks: ['coffee']

    watch:
      grunt:
        tasks: ['gruntfile']
      scripts:
        tasks: ['coffeelint:lib', 'coffee']

  require('load-grunt-tasks')(grunt)

  grunt.registerTask 'build', ['clean', 'coffee']
  grunt.registerTask 'default', ['update', 'autowatch']
