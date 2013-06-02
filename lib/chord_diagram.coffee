_ = require 'underscore'

{
  FretCount
  FretNumbers
  StringCount
  StringNumbers
} = require './fretboard_model'


#
# Style
#

DefaultStyle =
  h_gutter: 5
  v_gutter: 5
  string_spacing: 6
  fret_height: 8
  above_fretboard: 8
  note_radius: 1
  closed_string_fontsize: 4
  chord_degree_colors: ['red', 'blue', 'green', 'orange']
  interval_class_colors: [0...12].map (n) ->
    hsv_to_rgb = ([h, s, v]) ->
      h /= 360
      c = v * s
      x = c * (1 - Math.abs((h * 6) % 2 - 1))
      components = switch Math.floor(h * 6) % 6
        when 0 then [c, x, 0]
        when 1 then [x, c, 0]
        when 2 then [0, c, x]
        when 3 then [0, x, c]
        when 4 then [x, 0, c]
        when 5 then [c, 0, x]
      (component + v - c for component in components)
    # x = (7 * n) % 12  # color by circle of fifths
    [r, g, b] = hsv_to_rgb [n * 360 / 12, 1, 1]
    [r, g, b] = (Math.floor(255 * c) for c in [r, g, b])
    "rgb(#{r}, #{g}, #{b})"

_.extend DefaultStyle,
  string_spacing: 12
  fret_height: 16
  note_radius: 3
  closed_string_fontsize: 8

compute_dimensions = (style=DefaultStyle) ->
  {
    width: 2 * style.h_gutter + (StringCount - 1) * style.string_spacing
    height: 2 * style.v_gutter + (style.fret_height + 2) * FretCount
  }


#
# Drawing Methods
#

draw_chord_diagram_strings = (ctx, options={}) ->
  style = DefaultStyle
  for string in StringNumbers
    x = string * style.string_spacing + style.h_gutter
    ctx.beginPath()
    ctx.moveTo x, style.v_gutter + style.above_fretboard
    ctx.lineTo x, style.v_gutter + style.above_fretboard + FretCount * style.fret_height
    ctx.strokeStyle = (if options.dim_strings and string in options.dim_strings then 'rgba(0,0,0,0.2)' else 'black')
    ctx.stroke()

draw_chord_diagram_frets = (ctx, {nut}={nut: true}) ->
  style = DefaultStyle
  ctx.strokeStyle = 'black'
  for fret in FretNumbers
    y = style.v_gutter + style.above_fretboard + fret * style.fret_height
    ctx.beginPath()
    ctx.moveTo style.v_gutter - 0.5, y
    ctx.lineTo style.v_gutter + 0.5 + (StringCount - 1) * style.string_spacing, y
    ctx.lineWidth = 3 if fret == 0 and nut
    ctx.stroke()
    ctx.lineWidth = 1

draw_chord_diagram = (ctx, positions, options={}) ->
  defaults = {draw_closed_strings: true, nut: true, dy: 0, style: DefaultStyle}
  options = _.extend defaults, options
  {barres, dy, draw_closed_strings, style} = options
  if options.dim_unused_strings
    used_strings = (string for {string} in positions)
    options.dim_strings = (string for string in StringNumbers when string not in used_strings)

  finger_coordinates = ({string, fret}) ->
    return {
      x: style.h_gutter + string * style.string_spacing,
      y: style.v_gutter + style.above_fretboard + (fret - 0.5) * style.fret_height + dy
    }

  draw_finger_position = (position, options={}) ->
    {is_root, color} = options
    {x, y} = finger_coordinates position
    ctx.fillStyle = color or (if is_root then 'red' else 'white')
    ctx.strokeStyle = color or (if is_root then 'red' else 'black')
    ctx.lineWidth = 1
    ctx.beginPath()
    if is_root and position.fret
      do (r=style.note_radius) ->
        ctx.rect x - r, y - r, 2 * r, 2 * r
    else
      ctx.arc x, y, style.note_radius, 0, Math.PI * 2, false
    ctx.fill() if position.fret > 0 or is_root
    ctx.stroke()

  draw_barres = ->
    ctx.fillStyle = 'black'
    for {fret, string, fret, string_count} in barres
      {x: x1, y} = finger_coordinates {string, fret}
      {x: x2} = finger_coordinates {string: string + string_count - 1, fret}
      w = x2 - x1
      ctx.save()
      ctx.translate (x1 + x2) / 2, y - style.fret_height * .25
      ctx.beginPath()
      eccentricity = 10
      do ->
        ctx.save()
        ctx.scale w, eccentricity
        ctx.arc 0, 0, style.string_spacing / 2 / eccentricity, Math.PI, 0, false
        ctx.restore()
      do ->
        ctx.save()
        ctx.scale w, 14
        ctx.arc 0, 0, style.string_spacing / 2 / eccentricity, 0, Math.PI, true
        ctx.restore()
      ctx.fill()
      ctx.restore()
      # ctx.fillStyle = 'rgba(0,0,0, 0.5)'
      # ctx.beginPath()
      # ctx.arc x1, y, style.string_spacing / 2, Math.PI * 1/2, Math.PI * 3/2, false
      # ctx.arc x2, y, style.string_spacing / 2, Math.PI * 3/2, Math.PI * 1/2, false
      # ctx.fill()

  draw_finger_positions = ->
    for position in positions
      default_options =
        color: style.interval_class_colors[position.interval_class]
        is_root: (position.interval_class == 0)
      draw_finger_position position, _.extend(default_options, position)

  draw_closed_strings = ->
    fretted_strings = []
    fretted_strings[position.string] = true for position in positions
    closed_strings = (string for string in StringNumbers when not fretted_strings[string])
    r = style.note_radius
    ctx.fillStyle = 'black'
    for string in closed_strings
      {x, y} = finger_coordinates {string, fret: 0}
      ctx.strokeStyle = 'black'
      ctx.beginPath()
      ctx.moveTo x - r, y - r
      ctx.lineTo x + r, y + r
      ctx.moveTo x - r, y + r
      ctx.lineTo x + r, y - r
      ctx.stroke()

  draw_chord_diagram_strings ctx, options
  draw_chord_diagram_frets ctx, nut: options.nut
  draw_barres() if barres
  draw_finger_positions() if positions
  draw_closed_strings() if positions and options.draw_closed_strings

module.exports =
  defaultStyle: DefaultStyle
  width: compute_dimensions().width
  height: compute_dimensions().height
  draw: draw_chord_diagram
