_ = require 'underscore'
{IntervalNames} = require './theory'
{draw_text, with_graphics_context, with_alignment} = require './layout'
ChordDiagram = require './chord_diagram'

DefaultStyle =
  interval_class_colors: ChordDiagram.defaultStyle.interval_class_colors
  radius: 50
  center: true
  fill_cells: false
  label_cells: false

# Enumerate these explicitly instead of computing them,
# so that we can fine-tune the position of cells that
# could be placed at one of several different locations.
IntervalVectors =
  2: {P5: -1, m3: -1}
  3: {m3: 1}
  4: {M3: 1}
  5: {P5: -1}
  6: {m3: 2}
  11: {P5: 1, M3: 1}

# Returns a record {m3 M3 P5} that represents the canonical vector (according to `IntervalVectors`)
# of the interval class.
interval_class_vectors = (interval_class) ->
  original_interval_class = interval_class
  adj = {}
  adjust = (d_ic, steps) ->
    interval_class += d_ic
    adj[k] ?= 0 for k of steps
    adj[k] += v for k, v of steps
  adjust -24, P5: 4, M3: -1 while interval_class >= 24
  adjust -12, M3: 3 while interval_class >= 12
  [record, sign] = [IntervalVectors[interval_class], 1]
  [record, sign] = [IntervalVectors[12 - interval_class], -1] unless record
  intervals = _.extend {m3: 0, M3: 0, P5: 0, sign: 1}, record
  intervals[k] *= sign for k of intervals
  intervals[k] += v for k, v of adj
  computed_semitones = (12 + intervals.P5 * 7 + intervals.M3 * 4 + intervals.m3 * 3) % 12
  unless computed_semitones == original_interval_class % 12
    console.error "Error computing grid position for #{original_interval_class}:\n"
      , "  #{original_interval_class} ->", intervals
      , '->', computed_semitones
      , '!=', original_interval_class % 12
  intervals

draw_harmonic_table = (interval_classes, options={}) ->
  options = _.extend {}, DefaultStyle, options
  options.center = false if options.align
  colors = options.interval_class_colors
  interval_classes = [0].concat interval_classes unless 0 in interval_classes
  r = options.radius
  hex_radius = r / 2

  cell_center = (interval_klass) ->
    vectors = interval_class_vectors interval_klass
    dy = vectors.P5 + (vectors.M3 + vectors.m3) / 2
    dx = vectors.M3 - vectors.m3
    x = dx * r * .8
    y = -dy * r * .95
    {x, y}

  bounds = {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity}
  for interval_klass in interval_classes
    {x, y} = cell_center interval_klass
    bounds.left = Math.min bounds.left, x - hex_radius
    bounds.top = Math.min bounds.top, y - hex_radius
    bounds.right = Math.max bounds.right, x + hex_radius
    bounds.bottom = Math.max bounds.bottom, y + hex_radius

  with_graphics_context (ctx) ->
    with_alignment align: options.align, measured: bounds, ->
      ctx.translate r * 2 - (bounds.right + bounds.left) / 2, r * 2 - (bounds.bottom + bounds.top) / 2 if options.center

      for interval_klass in interval_classes
        is_root = interval_klass == 0
        color = colors[interval_klass % 12]
        color ||= colors[12 - interval_klass]
        ctx.beginPath()
        {x, y} = cell_center interval_klass

        # frame
        for i in [0..6]
          a = i * Math.PI / 3
          pos = [x + hex_radius * Math.cos(a), y + hex_radius * Math.sin(a)]
          ctx.moveTo pos... if i == 0
          ctx.lineTo pos...
        ctx.strokeStyle = 'gray'
        ctx.stroke()

        # fill
        if is_root or (options.fill_cells and interval_klass < 12)
          ctx.fillStyle = color or 'rgba(255,0,0,0.15)'
          ctx.globalAlpha = 0.3 unless is_root
          ctx.fill()
          ctx.globalAlpha = 1

        continue if is_root or options.fill_cells

        # fill
        ctx.globalAlpha = 0.3 if options.label_cells
        do ->
          [dx, dy, dn] = [-y, x, 2 / Math.sqrt(x*x + y*y)]
          dx *= dn
          dy *= dn
          ctx.beginPath()
          ctx.moveTo 0, 0
          ctx.lineTo x + dx, y + dy
          ctx.lineTo x - dx, y - dy
          ctx.fillStyle = color
          ctx.fill()

        ctx.beginPath()
        ctx.arc x, y, 2, 0, 2 * Math.PI, false
        ctx.fillStyle = color
        ctx.fill()
        ctx.globalAlpha = 1

      ctx.beginPath()
      ctx.arc 0, 0, 2.5, 0, 2 * Math.PI, false
      ctx.fillStyle = 'red'
      ctx.fill()

      if options.label_cells
        for interval_klass in interval_classes
          label = IntervalNames[interval_klass]
          label = 'R' if interval_klass == 0
          {x, y} = cell_center interval_klass
          draw_text label, font: '10pt Times', fillStyle: 'black', x: x, y: y, gravity: 'center'

module.exports = {
  draw: draw_harmonic_table
}
