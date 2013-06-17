_ = require 'underscore'

{
  Chords
  NoteNames
  IntervalNames
  LongIntervalNames
  Modes
  Scales
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

ChordDiagram = require('./chord_diagram')
FretboardDiagram = require('./fretboard_diagram')

Layout = require('./layout')
{
  PaperSizes
  erase_background
  draw_text
  labeled
  text_block
  pad_block
  with_graphics_context
  save_canvas_to_png
  with_book
  with_grid
  with_grid_blocks
  hbox
} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw
draw_harmonic_table = require('./harmonic_table').draw
harmonic_table_block = require('./harmonic_table').block
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
    canvas = new Canvas FretboardDiagram.height, FretboardDiagram.width
    ctx = canvas.getContext('2d')
    erase_background()
    FretboardDiagram.draw ctx
    draw_note string_number: string, fret_number: fret
    filename = "#{string}-#{fret}.png"
    save_canvas_to_png canvas, filename
    console.info "Saved #{filename}"

    for semitones in [0...12]
      canvas = new Canvas FretboardDiagram.height, FretboardDiagram.width
      ctx = canvas.getContext('2d')
      erase_background()
      FretboardDiagram.draw ctx
      draw_intervals_from semitones, string, fret
      interval_long_name = IntervalNames[semitones].replace(/^m/, 'min').replace(/^M/, 'Maj')
      filename = "#{string}-#{fret}-#{interval_long_name}.png"
      save_canvas_to_png canvas, filename

intervals_from_position_page = (root_position) ->
  canvas_gutter = 20
  header_height = 20
  with_grid cols: 3, rows: 4
  , cell_width: FretboardDiagram.height + canvas_gutter
  , cell_height: FretboardDiagram.width + header_height
  , (grid) ->
    for semitones in [0...12]
      interval_name = IntervalNames[semitones]
      grid.add_cell ->

        draw_text interval_name
        , font: '10px Times', fillStyle: 'rgb(10,20,30)'
        , x: 0, y: -3

        positions = (pos for pos in intervals_from(root_position, semitones) \
          when not (pos.string == root_position.string and pos.fret == root_position.fret))
        positions.push string: root_position.string, fret: root_position.fret, is_root: true
        FretboardDiagram.draw grid.context, positions

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
  , cell_width: FretboardDiagram.height + canvas_gutter
  , cell_height: FretboardDiagram.width + canvas_gutter
  , header_height: header_height
  , (grid) ->
    draw_text "#{LongIntervalNames[semitones]} Intervals"
    , font: '25px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: canvas_gutter / 2, y: 30

    fretboard_positions_each (finger_position) ->
      grid.add_cell ->
        FretboardDiagram.draw grid.context, intervals_from(finger_position, semitones)

intervals_book = (options={}) ->
  {by_root, pages} = options
  if by_root
    with_book "Fretboard Intervals by Root", page_limit: pages, (book) ->
      fretboard_positions_each (finger_position) ->
        intervals_from_position_page finger_position
  else
    with_book "Fretboard Intervals", page_limit: pages, (book) ->
      for semitones in [0..12]
        intervals_page semitones


#
# Chord Lattice Diagrams
#

harmonic_table_chords = (options={}) ->
  options = _.extend {}, options, chords: true
  harmonic_table options

harmonic_table_scales = (options={}) ->
  options = _.extend {}, options, scales: true, modes: true
  harmonic_table options

harmonic_table = (options={}) ->
  {title} = options
  radius = 20
  title ||= do ->
    return 'Harmonic Table Chords' if options.chords
    return 'Harmonic Table Scales' if options.scales
    return 'Harmonic Table Modes' if options.modes
    return 'Harmonic Table Intervals' if options.intervals
    return 'Harmonic Table'

  grid_options =
    # rows: 3
    gutter_height: 20

  extend_octave = (tones, octaves) ->
    first_octave = tones.slice 0
    [1...1+octaves].forEach (octave) ->
      tones = tones.concat (i + 12 * octave for i in first_octave)
    tones

  with_book title, size: PaperSizes.letter, (book) ->
    with_grid_blocks grid_options, (grid) ->

      grid.header pad_block(harmonic_table_block([0...12], radius: 30, label_cells: true), bottom: 20)

      if options.intervals
        intervals = [7, 4, 3, 2, 1]
        interval_sets = [intervals]
        interval_sets.push (12 - interval for interval in intervals)
        interval_sets[1].push 6
        for intervals in interval_sets
          grid.start_row()
          for semitones in _.without(intervals, 0)
            interval_name = IntervalNames[semitones]
            grid.add_cell(
              labeled interval_name
              , harmonic_table_block [semitones], radius: radius, label_cells: true
            )

      if options.scales
        grid.start_row()
        Scales.forEach ({name, tones}) ->
          tones = extend_octave tones, 2
          grid.add_cell(
            labeled name
            , harmonic_table_block tones, radius: radius, fill_cells: true
          )

      if options.modes
        grid.start_row()
        Modes.forEach ({name, tones}) ->
          # return if name == 'Ionian'
          tones = extend_octave tones, 2
          grid.add_cell(
            labeled name
            , harmonic_table_block tones, radius: radius, fill_cells: true
          )

      if options.chords
        grid.start_row()
        Chords.forEach (chord) ->
          grid.add_cell(
            labeled chord.name
            , harmonic_table_block chord.pitch_classes, radius: radius, fill_cells: true
            )


#
# Chord Fingerings
#

chord_fingerings_page = ({chord}) ->
  fingerings = fingerings_for chord
  Layout.filename "#{chord.name} Fingerings"

  with_grid cols: 10, rows: 10
  , cell_width: ChordDiagram.width + 10
  , cell_height: ChordDiagram.height + 5
  , header_height: 40
  , (grid) ->
    draw_text "#{chord.name} Fingerings"
    , x: 0, y: 20
    , font: '25px Impact', fillStyle: 'black'
    for fingering in fingerings
      grid.add_cell ->
        ChordDiagram.draw grid.context, fingering.positions, barres: fingering.barres

chord_page = (chord, options={}) ->
  {best_fingering} = options
  pitches = ((i * 5 + 3) % 12 for i in [0...12])
  pitches = [8...12].concat([0...8]) unless best_fingering

  with_grid_blocks cols: 4, rows: 3
  , cell_width: ChordDiagram.width
  , cell_height: ChordDiagram.height
  , gutter_height: 20
  , header_height: 40
  , (grid) ->

    grid.header(
      hbox(
        text_block("#{chord.name} Chords", font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'),
        {
          width: 50
          height: 30
          draw: ->
            with_graphics_context (ctx) ->
              # ctx.translate 285, 20
              ctx.scale 0.85, 0.85
              ctx.translate 17, -17
              draw_pitch_diagram ctx, chord.pitch_classes
        }
      )
    )

    pitches.forEach (pitch) ->
      rooted_chord = chord.at pitch
      return if options.only unless rooted_chord.name == options.only
      fingering = {positions: finger_positions_on_chord rooted_chord}
      fingering = best_fingering_for rooted_chord if best_fingering
      grid.add_cell(
        labeled rooted_chord.name, font: '10pt Times', fillStyle: 'rgb(10,20,30)', align: 'left',
          ChordDiagram.block fingering.positions, barres: fingering.barres
        )

chord_book = (options={}) ->
  title = if options.best_fingering then "Chord Diagrams" else "Combined Chord Diagrams"
  with_book title, size: PaperSizes.letter, page_limit: options.pages, (book) ->
    for chord in Chords
      chord_page chord, options


#
# Exports
#

module.exports = {
  chord_book
  chord_fingerings_page
  harmonic_table_chords
  harmonic_table_scales
  chord_shape_fragments
  draw_license_footer
  intervals_book
}
