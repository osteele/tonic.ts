{
  FretCount
  FretNumbers
} = require './instruments'


#
# Style
#

DefaultStyle =
  h_gutter: 10
  v_gutter: 10
  string_spacing: 20
  fret_width: 45
  fret_overhang: .3 * 45

paddedFretboardWidth = (instrument, style=DefaultStyle) ->
  2 * style.v_gutter + style.fret_width * FretCount + style.fret_overhang

paddedFretboardHeight = (instrument, style=DefaultStyle) ->
  2 * style.h_gutter + (instrument.strings - 1) * style.string_spacing


#
# Drawing Methods
#

drawFretboardStrings = (instrument, ctx) ->
  style = DefaultStyle
  for string in instrument.stringNumbers
    y = string * style.string_spacing + style.h_gutter
    ctx.beginPath()
    ctx.moveTo style.h_gutter, y
    ctx.lineTo style.h_gutter + FretCount * style.fret_width + style.fret_overhang, y
    ctx.lineWidth = 1
    ctx.stroke()

drawFretboardFrets = (ctx, instrument) ->
  style = DefaultStyle
  for fret in FretNumbers
    x = style.h_gutter + fret * style.fret_width
    ctx.beginPath()
    ctx.moveTo x, style.h_gutter
    ctx.lineTo x, style.h_gutter + (instrument.strings - 1) * style.string_spacing
    ctx.lineWidth = 3 if fret == 0
    ctx.stroke()
    ctx.lineWidth = 1

drawFretboardFingerPosition = (ctx, instrument, position, options={}) ->
  {string, fret} = position
  {isRoot, color} = options
  style = DefaultStyle
  color ||= if isRoot then 'red' else 'white'
  x = style.h_gutter + (fret - 0.5) * style.fret_width
  x = style.h_gutter if fret == 0
  y = style.v_gutter + (5 - string) * style.string_spacing
  ctx.beginPath()
  ctx.arc x, y, 7, 0, 2 * Math.PI, false
  ctx.fillStyle = color
  ctx.lineWidth = 2 unless isRoot
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1

drawFretboard = (ctx, instrument, positions) ->
  drawFretboardStrings ctx, instrument
  drawFretboardFrets ctx, instrument
  drawFretboardFingerPosition ctx, instrument, position, position for position in (positions or [])

module.exports =
  draw: drawFretboard
  height: paddedFretboardHeight
  width: paddedFretboardWidth
