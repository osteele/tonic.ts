{PI, cos, sin, min, max} = Math
ChordDiagramStyle = require('./chord_diagram').defaultStyle
{block, with_graphics_context} = require './layout'

draw_pitch_diagram = (ctx, pitch_classes, options={draw: true}) ->
  {pitch_colors, pitch_names} = options
  pitch_colors ||= ChordDiagramStyle.interval_class_colors
  pitch_names ||= 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/)
  # pitch_names = '1 2b 2 3b 3 4 T 5 6b 6 7b 7'.split(/\s/)
  r = 10
  r_label = r + 7

  pitch_class_angle = (pitch_class) ->
    (pitch_class - 3) * 2 * PI / 12

  bounds = {left: 0, top: 0, right: 0, bottom: 0}
  extend_bounds = (left, top, bottom, right) ->
    # right ?= left
    # bottom ?= top
    bounds.left = min bounds.left, left
    bounds.top = min bounds.top, top
    bounds.right = max bounds.right, right ? left
    bounds.bottom = max bounds.bottom, bottom ? top

  for pitch_class in pitch_classes
    angle = pitch_class_angle pitch_class
    x = r * cos(angle)
    y = r * sin(angle)

    if options.draw
      ctx.beginPath()
      ctx.moveTo 0, 0
      ctx.lineTo x, y
      ctx.stroke()
    extend_bounds x, y

    if options.draw
      ctx.beginPath()
      ctx.arc x, y, 2, 0, 2 * PI, false
      ctx.fillStyle = pitch_colors[pitch_class] or 'black'
      ctx.fill()

  ctx.font = '4pt Times'
  ctx.fillStyle = 'black'
  for class_name, pitch_class in pitch_names
    angle = pitch_class_angle pitch_class
    m = ctx.measureText class_name
    x = r_label * cos(angle) - m.width / 2
    y = r_label * sin(angle) + m.emHeightDescent
    ctx.fillText class_name, x, y if options.draw
    bounds.left = min bounds.left, x
    bounds.right = max bounds.right, x + m.width
    bounds.top = min bounds.top, y - m.emHeightAscent
    bounds.bottom = max bounds.bottom, y + m.emHeightAscent

  return bounds

pitch_diagram_block = (pitch_classes, scale=1) ->
  bounds = with_graphics_context (ctx) -> draw_pitch_diagram ctx, pitch_classes, draw: false, measure: true
  block
    width: (bounds.right - bounds.left) * scale
    height: (bounds.bottom - bounds.top) * scale
    draw: ->
      with_graphics_context (ctx) ->
        ctx.scale scale, scale
        ctx.translate -bounds.left, -bounds.bottom
        draw_pitch_diagram ctx, pitch_classes

module.exports =
  draw: draw_pitch_diagram
  block: pitch_diagram_block
