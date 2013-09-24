{PI, cos, sin, min, max} = Math
ChordDiagramStyle = require('./chord_diagram').defaultStyle

draw_pitch_diagram = (ctx, pitchClasses, options={draw: true}) ->
  {pitch_colors, pitch_names} = options
  pitch_colors ||= ChordDiagramStyle.interval_class_colors
  pitch_names ||= 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/)
  # pitch_names = '1 2b 2 3b 3 4 T 5 6b 6 7b 7'.split(/\s/)
  r = 10
  r_label = r + 7

  pitch_class_angle = (pitchClass) ->
    (pitchClass - 3) * 2 * PI / 12

  bounds = {left: 0, top: 0, right: 0, bottom: 0}
  extend_bounds = (left, top, bottom, right) ->
    # right ?= left
    # bottom ?= top
    bounds.left = min bounds.left, left
    bounds.top = min bounds.top, top
    bounds.right = max bounds.right, right ? left
    bounds.bottom = max bounds.bottom, bottom ? top

  for pitchClass in pitchClasses
    angle = pitch_class_angle pitchClass
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
      ctx.fillStyle = pitch_colors[pitchClass] or 'black'
      ctx.fill()

  ctx.font = '4pt Times'
  ctx.fillStyle = 'black'
  for class_name, pitchClass in pitch_names
    angle = pitch_class_angle pitchClass
    m = ctx.measureText class_name
    x = r_label * cos(angle) - m.width / 2
    y = r_label * sin(angle) + m.emHeightDescent
    ctx.fillText class_name, x, y if options.draw
    bounds.left = min bounds.left, x
    bounds.right = max bounds.right, x + m.width
    bounds.top = min bounds.top, y - m.emHeightAscent
    bounds.bottom = max bounds.bottom, y + m.emHeightAscent

  return bounds

module.exports =
  draw: draw_pitch_diagram
