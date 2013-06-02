ChordDiagramStyle = require('./chord_diagram').defaultStyle

draw_pitch_diagram = (ctx, pitch_classes, options={}) ->
  {pitch_colors, pitch_names} = options
  pitch_colors ||= ChordDiagramStyle.interval_class_colors
  pitch_names ||= 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/)
  # pitch_names = '1 2b 2 3b 3 4 T 5 6b 6 7b 7'.split(/\s/)
  r = 10
  r_label = r + 7

  pitch_class_angle = (pitch_class) ->
    (-3 + pitch_class) * 2 * Math.PI / 12

  for pitch_class in pitch_classes
    a = pitch_class_angle pitch_class
    pitch_dot_center =
      x: r * Math.cos(a)
      y: r * Math.sin(a)
    # console.info pitch_class, a, pitch_dot_center

    ctx.beginPath()
    ctx.moveTo 0, 0
    ctx.lineTo pitch_dot_center.x, pitch_dot_center.y
    ctx.stroke()

    ctx.beginPath()
    ctx.arc pitch_dot_center.x, pitch_dot_center.y, 2, 0, 2 * Math.PI, false
    ctx.fillStyle = pitch_colors[pitch_class] or 'black'
    ctx.fill()

  ctx.font = '4pt Times'
  ctx.fillStyle = 'black'
  for class_name, pitch_class in pitch_names
    a = pitch_class_angle pitch_class
    m = ctx.measureText class_name
    ctx.fillText class_name, r_label * Math.cos(a) - m.width / 2, r_label * Math.sin(a) + m.emHeightDescent

module.exports =
  draw: draw_pitch_diagram
