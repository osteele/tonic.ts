_ = require 'underscore'

{
  Chords
  NoteNames
  Intervals
  LongIntervalNames
  interval_class_between
} = require('./theory')

{
  FretCount
  StringCount
  fretboard_positions_each
  intervals_from
  pitch_number_for_position
} = require('./fretboard_model')

{
  best_fingering_for
  fingerings_for
  finger_positions_on_chord
} = require('./fretboard_logic')

{

  draw: draw_chord_diagram
  width: padded_chord_diagram_width
  height: padded_chord_diagram_height
} = require('./chord_diagram')

{
  draw: draw_fretboard
  height: padded_fretboard_height
  width: padded_fretboard_width
} = require('./fretboard_diagram')

Layout = require('./layout')
{
  erase_background
  draw_text
  with_graphics_context
  save_canvas_to_png
  with_grid
  with_book
} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw

{chord_shape_fragments} = require './chord-fragment-book'

CC_LICENSE_TEXT = "This work is licensed under a Creative Commons Attribution 3.0 United States License."

draw_license_footer = (page) ->
  text = "©2013 by Oliver Steele. " + CC_LICENSE_TEXT
  draw_text text
  , font: '4pt Times'
  , fillStyle: 'black'
  , y: page.height - page.top_margin
  , gravity: 'botLeft'



#
# Interval Cards and Pages
#

interval_cards = ->
  fretboard_positions_each ({string, fret}) ->
    canvas = new Canvas(padded_fretboard_width, padded_fretboard_height)
    ctx = canvas.getContext('2d')
    erase_background()
    draw_fretboard ctx
    draw_note string_number: string, fret_number: fret
    filename = "#{string}-#{fret}.png"
    save_canvas_to_png canvas, filename
    console.info "Saved #{filename}"

    for interval_name, semitones in Intervals
      canvas = new Canvas(padded_fretboard_width, padded_fretboard_height)
      ctx = canvas.getContext('2d')
      erase_background()
      draw_fretboard ctx
      draw_intervals_from semitones, string, fret
      interval_long_name = interval_name.replace(/^m/, 'min').replace(/^M/, 'Maj')
      filename = "#{string}-#{fret}-#{interval_long_name}.png"
      save_canvas_to_png canvas, filename

intervals_from_position_page = (root_position) ->
  canvas_gutter = 20
  header_height = 20
  with_grid cols: 3, rows: 4
  , cell_width: padded_fretboard_width + canvas_gutter
  , cell_height: padded_fretboard_height + header_height
  , (grid) ->
    for interval_name, semitones in Intervals
      grid.add_cell ->

        draw_text interval_name
        , font: '10px Times', fillStyle: 'rgb(10,20,30)'
        , x: 0, y: -3

        positions = (pos for pos in intervals_from(root_position, semitones) \
          when not (pos.string == root_position.string and pos.fret == root_position.fret))
        positions.push string: root_position.string, fret: root_position.fret, is_root: true
        draw_fretboard grid.context, positions

draw_intervals_from = (root_position, semitones, color) ->
  root_note_number = pitch_number_for_position(root_position)
  draw_finger_position root_position, is_root: true #, color: color
  for position in intervals_from(root_position, semitones)
    continue if position.string == root_position.string and position.fret == root_position.fret
    draw_finger_position position, color: color

intervals_from_note_sheets = ->
  fretboard_positions_each ({string, fret}) ->
    intervals_from_note_sheet string, fret

intervals_page = (semitones) ->
  canvas_gutter = 5
  header_height = 40
  cols = FretCount + 1
  rows = StringCount

  with_grid cols: cols, rows: rows
  , cell_width: padded_fretboard_width + canvas_gutter
  , cell_height: padded_fretboard_height + canvas_gutter
  , header_height: header_height
  , (grid) ->
    draw_text "#{LongIntervalNames[semitones]} Intervals"
    , font: '25px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: canvas_gutter / 2, y: 30

    fretboard_positions_each (finger_position) ->
      grid.add_cell ->
        draw_fretboard grid.context, intervals_from(finger_position, semitones)

intervals_book = ({by_root, pages}={}) ->
  if by_root
    with_book "Fretboard Intervals by Root", pages: pages, (book) ->
      fretboard_positions_each (finger_position) ->
        intervals_from_position_page finger_position
  else
    with_book "Fretboard Intervals", pages: pages, (book) ->
      for __, semitones in Intervals
        intervals_page semitones


#
# Chord Lattice Diagrams
#

interval_class_vectors = (interval_class) ->
  records =
    1: {P5: -1, M3: 2, color: 'gray'}
    2: {P5: -1, m3: -1, color: 'yellow'}
    3: {m3: 1, color: 'blue'}
    4: {M3: 1, color: 'green'}
    5: {P5: -1, color: 'red', sign: -1}
    6: {m3: 2, color: 'purple'}
  [record, sign] = [records[interval_class], 1]
  [record, sign] = [records[12 - interval_class], -1] unless record
  intervals = _.extend {m3: 0, M3: 0, P5: 0, sign: 1}, record
  intervals[k] *= sign for k of intervals
  computed_semitones = (12 + 7 * intervals.P5 + intervals.M3 * 4 + intervals.m3 * 3) % 12
  console.error "#{computed_semitones} != #{interval_class}" unless computed_semitones == interval_class
  intervals

draw_interval_classes_on_harmonic_table = (r, interval_classes) ->
  interval_classes = [0].concat interval_classes unless 0 in interval_classes
  hex_radius = r / 2
  colors =
    1: 'gray'
    2: 'yellow'
    3: 'blue'
    4: 'green'
    5: 'red'
    6: 'purple'

  with_graphics_context (ctx) ->
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
      bounds.left = Math.min bounds.left, x
      bounds.top = Math.min bounds.top, y
      bounds.right = Math.max bounds.right, x
      bounds.bottom = Math.max bounds.bottom, y
    ctx.translate r * 2 - (bounds.right + bounds.left) / 2, r * 2 - (bounds.bottom + bounds.top) / 2
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
      if interval_klass == 0
        ctx.fillStyle = 'rgba(255,0,0,0.1)'
        ctx.fill()
      continue if interval_klass == 0
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
    ctx.beginPath()
    ctx.arc 0, 0, 2.5, 0, 2 * Math.PI, false
    ctx.fillStyle = 'red'
    ctx.fill()

chord_lattice = () ->
  r = 20
  with_book "Chord Lattices", (book) ->
    with_grid cols: 6, rows: 5
    , cell_width: 80
    , cell_height: 80 + 40
    , header_height: 40
    , (grid) ->
      intervals = [7, 4, 3, 2, 1]
      interval_sets = [intervals]
      interval_sets.push (12 - interval for interval in intervals)
      interval_sets[1].push 6
      for intervals in interval_sets
        grid.start_row()
        for semitones in intervals
          continue if semitones == 0
          interval_name = Intervals[semitones]
          grid.add_cell ->
            draw_text interval_name
            , font: '12px Times', fillStyle: 'black'
            , x: 80 / 2, gravity: 'center'
            draw_interval_classes_on_harmonic_table r, [semitones]

      grid.start_row()
      for chord in Chords
        grid.add_cell ->
          draw_text chord.name
          , font: '12px Times', fillStyle: 'black'
          , x: 80 / 2, gravity: 'center'
          draw_interval_classes_on_harmonic_table r, chord.pitch_classes


#
# Chord Fingerings
#

chord_fingerings_page = (chord) ->
  fingerings = fingerings_for(chord)
  Layout.filename "#{chord.name} Fingerings"

  with_grid cols: 10, rows: 10
  , cell_width: padded_chord_diagram_width + 10
  , cell_height: padded_chord_diagram_height + 5
  , header_height: 40
  , (grid) ->
    draw_text "#{chord.name} Fingerings"
    , x: 0, y: 20
    , font: '25px Impact', fillStyle: 'black'
    for fingering in fingerings
      grid.add_cell ->
        draw_chord_diagram grid.context, fingering.positions, barres: fingering.barres

chord_page = (chord, options={}) ->
  {best_fingering} = options

  with_grid cols: 4, rows: 3
  , cell_width: padded_chord_diagram_width
  , cell_height: padded_chord_diagram_height
  , gutter_height: 20
  , header_height: 40
  , (grid) ->

    draw_text "#{chord.name} Chords"
    , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: 0, y: 0, gravity: 'topLeft'

    with_graphics_context (ctx) ->
      ctx.translate 285, 20
      ctx.scale 0.85, 0.85
      draw_pitch_diagram ctx, chord.pitch_classes

    pitches = ((i * 5 + 3) % 12 for i in [0...12])
    pitches = [8...12].concat([0...8]) unless best_fingering
    for pitch in pitches
      rooted_chord = chord.at pitch
      continue if options.only unless rooted_chord.name == options.only
      grid.add_cell ->
        draw_text rooted_chord.name
        , font: '10pt Times', fillStyle: 'rgb(10,20,30)'
        , x: 0, y: -3

        fingering = {positions: finger_positions_on_chord(rooted_chord)}
        fingering = best_fingering_for(rooted_chord) if best_fingering

        draw_chord_diagram grid.context, fingering.positions, barres: fingering.barres

chord_book = (options={}) ->
  title = if options.best_fingering then "Chord Diagrams" else "Combined Chord Diagrams"
  with_book title, pages: options.pages, (book) ->
    for chord in Chords
      chord_page chord, options


#
# Exports
#

module.exports = {
  chord_book
  chord_fingerings_page
  chord_lattice
  chord_shape_fragments
  draw_license_footer
  intervals_book
}
