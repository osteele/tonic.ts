fs = require 'fs'

module.exports = (grunt) ->
  _ = grunt.util._

  statSyncOrNull = (path) ->
    try
      fs.statSync(path)
    catch error
      throw error unless error.errno == 34 and error.code == 'ENOENT'
      return null

  filesAreOutdated = (srcFiles, dstFiles) ->
    srcModtimeMax = Math.max((fs.statSync(path).mtime for path in srcFiles)...)
    dstModtimeMin = Math.min((statSyncOrNull(path)?.mtime || -Infinity for path in dstFiles)...)
    return srcModtimeMax > dstModtimeMin

  taskFiles = (task, target) ->
    if task == 'browserify'
      files = grunt.config.get([task, target, 'files'])
      filesSrc = grunt.file.expand(_.chain(files).map(_.values).flatten().value())
      filesDst = _.chain(files).map(_.keys).flatten().map(grunt.config.process).uniq().value()
    else
      files = grunt.task.normalizeMultiTaskFiles(grunt.config.get([task, target]))
      filesSrc = _(files).chain().pluck('src').flatten().uniq().value()
      filesDst = _.pluck(files, 'dest')
    return {src: filesSrc, dst: filesDst}

  taskIsOutdated = (task) ->
    target = 'app'
    files = taskFiles(task, target)
    return filesAreOutdated(files.src, files.dst)

  grunt.registerTask 'update', ->
    tasks = ['browserify', 'jade', 'sass']
    outdatedTasks = tasks.filter(taskIsOutdated)
    grunt.task.run outdatedTasks
    return
