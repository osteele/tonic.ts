{FretCount, FretNumbers, StringCount, StringNumbers} = require('./fretboard')

#
# Drawing Fretboard
#

FretboardStyle =
  h_gutter: 10
  v_gutter: 10
  string_spacing: 20
  fret_width: 45
  fret_overhang: .3 * 45

padded_fretboard_width = do (style=FretboardStyle) ->
  2 * style.v_gutter + style.fret_width * FretCount + style.fret_overhang
padded_fretboard_height = do (style=FretboardStyle) ->
  2 * style.h_gutter + (StringCount - 1) * style.string_spacing

draw_fretboard_strings = (ctx) ->
  style = FretboardStyle
  for string in StringNumbers
    y = string * style.string_spacing + style.h_gutter
    ctx.beginPath()
    ctx.moveTo style.h_gutter, y
    ctx.lineTo style.h_gutter + FretCount * style.fret_width + style.fret_overhang, y
    ctx.lineWidth = 1
    ctx.stroke()

draw_fretboard_frets = (ctx) ->
  style = FretboardStyle
  for fret in FretNumbers
    x = style.h_gutter + fret * style.fret_width
    ctx.beginPath()
    ctx.moveTo x, style.h_gutter
    ctx.lineTo x, style.h_gutter + (StringCount - 1) * style.string_spacing
    ctx.lineWidth = 3 if fret == 0
    ctx.stroke()
    ctx.lineWidth = 1

draw_fretboard_finger_position = (ctx, position, options={}) ->
  {string, fret} = position
  {is_root, color} = options
  style = FretboardStyle
  color ||= if is_root then 'red' else 'white'
  x = style.h_gutter + (fret - 0.5) * style.fret_width
  x = style.h_gutter if fret == 0
  y = style.v_gutter + (5 - string) * style.string_spacing
  ctx.beginPath()
  ctx.arc x, y, 7, 0, 2 * Math.PI, false
  ctx.fillStyle = color
  ctx.lineWidth = 2 unless is_root
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1

draw_fretboard = (ctx, positions) ->
  draw_fretboard_strings ctx
  draw_fretboard_frets ctx
  draw_fretboard_finger_position ctx, position, position for position in (positions or [])

module.exports =
  draw_fretboard: draw_fretboard
  padded_fretboard_height: padded_fretboard_height
  padded_fretboard_width: padded_fretboard_width
