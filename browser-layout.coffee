console.info 'provide browser/layout'

Context =
  canvas: null

withCanvas = (canvas, cb) ->
  savedCanvas = Context.canvas
  try
    Context.canvas = canvas
    return cb()
  finally
    Context.canvas = savedCanvas

module.exports = {
  withCanvas
}
