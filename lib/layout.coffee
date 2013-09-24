Context =
  canvas: null

drawText = (text, options={}) ->
  ctx = Context.ctx
  options = text if _.isObject text
  {font, fillStyle, x, y, gravity, width} = options
  gravity ||= ''
  if options.choices
    for choice in options.choices
      text = choice if _.isString choice
      {font} = choice if _.isObject choice
      break if measure_text(text, font: font).width <= options.width
  ctx.font = font if font
  ctx.fillStyle = fillStyle if fillStyle
  m = ctx.measureText text
  x ||= 0
  y ||= 0
  x -= m.width / 2 if gravity.match(/^(top|center|middle|centerbottom)$/i)
  x -= m.width if gravity.match(/^(right|topRight|botRight)$/i)
  y -= m.emHeightDescent if gravity.match(/^(bottom|botLeft|botRight)$/i)
  y += m.emHeightAscent if gravity.match(/^(top|topLeft|topRight)$/i)
  ctx.fillText text, x, y

withCanvas = (canvas, cb) ->
  savedCanvas = Context.canvas
  try
    Context.canvas = canvas
    return cb()
  finally
    Context.canvas = savedCanvas

withGraphicsContext = (cb) ->
  ctx = Context.ctx
  ctx.save()
  try
    return cb(ctx)
  finally
    ctx.restore()

module.exports = {
  withCanvas
  withGraphicsContext
}
