_ = require 'underscore'
{Intervals} = require './theory'
{draw_text, with_graphics_context} = require('./layout')

DefaultStyle =
  interval_class_colors: require('./chord_diagram').defaultStyle.interval_class_colors
  radius: 50

with_alignment = (options, cb) ->
  align = options.align
  bounds = options.measured
  return cb() unless align
  with_graphics_context (ctx) ->
    dx = dy = 0
    measured_height = bounds.bottom - bounds.top
    dx = align.x - bounds.left if align.x?
    dy = align.y - bounds.bottom if align.y?
    ctx.translate dx, dy
    cb()
    if bounds
      bounds = _.extend {}, bounds
      bounds.left += dx
      bounds.right += dx
      bounds.top += dy
      bounds.bottom += dy
  return bounds

interval_class_vectors = (interval_class) ->
  records =
    2: {P5: -1, m3: -1}
    3: {m3: 1}
    4: {M3: 1}
    5: {P5: -1}
    6: {m3: 2}
    11: {P5: 1, M3: 1}
  [record, sign] = [records[interval_class], 1]
  [record, sign] = [records[12 - interval_class], -1] unless record
  intervals = _.extend {m3: 0, M3: 0, P5: 0, sign: 1}, record
  intervals[k] *= sign for k of intervals
  computed_semitones = (12 + 7 * intervals.P5 + intervals.M3 * 4 + intervals.m3 * 3) % 12
  console.error "#{computed_semitones} != #{interval_class}" unless computed_semitones == interval_class
  intervals

draw_harmonic_table = (interval_classes, options={}) ->
  options = _.extend {center: true}, DefaultStyle, options
  options.center = false if options.align
  colors = options.interval_class_colors
  interval_classes = [0].concat interval_classes unless 0 in interval_classes
  r = options.radius
  hex_radius = r / 2

  cell_center = (interval_klass) ->
    vectors = interval_class_vectors interval_klass
    dy = vectors.P5 + (vectors.M3 + vectors.m3) / 2
    dx = vectors.M3 - vectors.m3
    x = dx * r
    y = -dy * r
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
        color = colors[interval_klass]
        color ||= colors[12 - interval_klass]
        ctx.beginPath()
        {x, y} = cell_center interval_klass

        for i in [0..6]
          a = i * Math.PI / 3
          pos = [x + hex_radius * Math.cos(a), y + hex_radius * Math.sin(a)]
          ctx.moveTo pos... if i == 0
          ctx.lineTo pos...
        ctx.strokeStyle = 'gray'
        ctx.stroke()
        if interval_klass == 0 or options.fill_cells
          ctx.fillStyle = color or 'rgba(255,0,0,0.15)'
          ctx.fill()

        continue if interval_klass == 0 or options.fill_cells
        ctx.globalAlpha = 0.3 if options.label_cells
        ctx.beginPath()
        do ->
          [dx, dy, dn] = [-y, x, 2 / Math.sqrt(x*x + y*y)]
          [dx, dy] = [dx * dn, dy * dn]
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
          label = Intervals[interval_klass]
          label = 'R' if interval_klass == 0
          {x, y} = cell_center interval_klass
          draw_text label, font: '10pt Times', fillStyle: 'black', x: x, y: y, gravity: 'center'

module.exports = {
  draw: draw_harmonic_table
}
