_ = require 'underscore'

{FretCount, FretNumbers, StringCount, StringNumbers} = require('./fretboard')

#
# Draw Chord Diagrams
#

ChordDiagramStyle =
  h_gutter: 5
  v_gutter: 5
  string_spacing: 6
  fret_height: 8
  above_fretboard: 8
  note_radius: 1
  closed_string_fontsize: 4
  chord_degree_colors: ['red', 'blue', 'green', 'orange']


# padded_chord_diagram_height = 2 * ChordDiagramStyle.v_gutter + ChordDiagramStyle.fret_height * FretCount

_.extend ChordDiagramStyle,
  string_spacing: 12
  fret_height: 16
  note_radius: 3
  closed_string_fontsize: 8

padded_chord_diagram_width = 2 * ChordDiagramStyle.h_gutter + (StringCount - 1) * ChordDiagramStyle.string_spacing
padded_chord_diagram_height = 2 * ChordDiagramStyle.v_gutter + (ChordDiagramStyle.fret_height + 2) * FretCount

draw_chord_diagram_strings = (ctx) ->
  style = ChordDiagramStyle
  for i in StringNumbers
    x = i * style.string_spacing + style.h_gutter
    ctx.beginPath()
    ctx.moveTo x, style.v_gutter + style.above_fretboard
    ctx.lineTo x, style.v_gutter + style.above_fretboard + FretCount * style.fret_height
    ctx.stroke()

draw_chord_diagram_frets = (ctx) ->
  style = ChordDiagramStyle
  for fret in FretNumbers
    y = style.v_gutter + style.above_fretboard + fret * style.fret_height
    ctx.beginPath()
    ctx.moveTo style.v_gutter - 0.5, y
    ctx.lineTo style.v_gutter + 0.5 + (StringCount - 1) * style.string_spacing, y
    ctx.lineWidth = 3 if fret == 0
    ctx.stroke()
    ctx.lineWidth = 1

draw_chord_diagram = (ctx, positions, options={}) ->
  {barres, dy} = options
  dy ||= 0
  style = ChordDiagramStyle

  finger_coordinates = ({string, fret}) ->
    return {
      x: style.h_gutter + string * style.string_spacing,
      y: style.v_gutter + style.above_fretboard + (fret - 0.5) * style.fret_height + dy
    }

  draw_finger_position = (position, options={}) ->
    {is_root, color} = options
    {x, y} = finger_coordinates(position)
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
    ctx.strokeStyle = 'black'

  draw_barres = ->
    for {fret, string, fret, string_count} in barres
      {x: x1, y} = finger_coordinates(string: string, fret: fret)
      {x: x2} = finger_coordinates(string: string + string_count - 1, fret: fret)
      ctx.fillStyle = 'rgba(0,0,0, 0.5)'
      ctx.beginPath()
      ctx.arc x1, y, style.string_spacing / 2, Math.PI * 1/2, Math.PI * 3/2, false
      ctx.arc x2, y, style.string_spacing / 2, Math.PI * 3/2, Math.PI * 1/2, false
      ctx.fill()

  draw_finger_positions = ->
    for position in positions
      finger_options = position
      finger_options.color = style.chord_degree_colors[position.degree_index] unless 'color' of finger_options
      finger_options.is_root = (position.degree_index == 0) unless 'is_root' of finger_options
      draw_finger_position position, finger_options

  draw_closed_strings = ->
    fretted_strings = []
    fretted_strings[position.string] = true for position in positions
    closed_strings = (string for string in StringNumbers when not fretted_strings[string])
    ctx.font = "#{style.closed_string_fontsize}pt Helvetica"
    ctx.fillStyle = 'black'
    label = 'x'
    for string_number in closed_strings
      m = ctx.measureText(label)
      ctx.fillText label
      , style.h_gutter + string_number * style.string_spacing - m.width / 2
      , style.v_gutter + style.above_fretboard - style.fret_height * 0.5 + m.emHeightDescent

  draw_chord_diagram_strings(ctx)
  draw_chord_diagram_frets(ctx)
  draw_barres() if barres
  draw_finger_positions() if positions
  draw_closed_strings() if positions

module.exports =
  defaultStyle: ChordDiagramStyle
  width: padded_chord_diagram_width
  height: padded_chord_diagram_height
  draw: draw_chord_diagram
