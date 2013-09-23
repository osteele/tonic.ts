module.exports = (grunt) ->
  grunt.registerTask 'context', (contextName) ->
    contextKey = ":#{contextName}"
    installContexts = (obj) ->
      recursiveMerge obj, obj[contextKey] if contextKey of obj
      for k, v of obj
        installContexts v if grunt.util.kindOf(v) == 'object' and not k.match(/^:/)
    recursiveMerge = (target, source) ->
      for k, v of source
        if k of target and grunt.util.kindOf(v) == 'object'
          recursiveMerge target[k], v
        else
          target[k] = v
    installContexts grunt.config.data
    return
