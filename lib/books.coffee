_ = require 'underscore'

{
  Chords
  NoteNames
  Intervals
  LongIntervalNames
  compute_chord_name
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
  defaultStyle: ChordDiagramStyle
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
  draw_title
  with_graphics_context
  save_canvas_to_pn
  with_page
  with_grid
  with_book
} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw

CC_LICENSE_TEXT = "This work is licensed under a Creative Commons Attribution 3.0 United States License."
Layout.set_page_footer text: "©2013 by Oliver Steele. " + CC_LICENSE_TEXT


#
# Specific Cards and Pages
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
        draw_title interval_name
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
    draw_title "#{LongIntervalNames[semitones]} Intervals"
    , font: '25px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: canvas_gutter / 2, y: 30

    fretboard_positions_each (finger_position) ->
      grid.add_cell ->
        draw_fretboard grid.context, intervals_from(finger_position, semitones)

intervals_book = ({by_root, pages}={}) ->
  if by_root
    with_book "Fretboard Intervals by Root", pages: pages, (book) ->
      fretboard_positions_each (finger_position) ->
        book.add_page -> intervals_from_position_page finger_position
  else
    with_book "Fretboard Intervals", pages: pages, (book) ->
      for __, semitones in Intervals
        book.add_page -> intervals_page semitones

chord_fingerings_page = (chord, chord_root) ->
  chord_root = NoteNames.indexOf(chord_root) if typeof chord_root == 'string'
  fingerings = fingerings_for(chord, chord_root)
  Layout.filename "#{compute_chord_name chord_root, chord} Fingerings"
  with_grid cols: 10, rows: 10
  , cell_width: padded_chord_diagram_width + 10
  , cell_height: padded_chord_diagram_height + 5
  , header_height: 40
  , (grid) ->
    draw_title "#{compute_chord_name chord_root, chord} Fingerings"
    , x: 0, y: 20
    , font: '25px Impact', fillStyle: 'black'
    for fingering in fingerings
      grid.add_cell -> draw_chord_diagram grid.context, fingering.positions, barres: fingering.barres

chord_page = (chord, options={}) ->
  {best_fingering} = options

  other_colors = ['rgba(255,0,0 ,.1)', 'rgba(0,0,255, 0.1)', 'rgba(0,255,0, 0.1)', 'rgba(255,0,255, 0.1)']

  with_grid cols: 4, rows: 3
  , cell_width: padded_chord_diagram_width
  , cell_height: padded_chord_diagram_height
  , gutter_height: 20
  , header_height: 40
  , (grid) ->

    draw_title "#{chord.name} Chords"
    , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: 0, y: 0, gravity: 'top'

    with_graphics_context (ctx) ->
      ctx.translate 285, 20
      ctx.scale 0.85,0.85
      draw_pitch_diagram ctx, chord.pitch_classes, pitch_colors: ChordDiagramStyle.chord_degree_colors

    pitches = ((i * 5 + 3) % 12 for i in [0...12])
    pitches = [8...12].concat([0...8]) unless best_fingering
    for pitch in pitches
      chord_name = compute_chord_name pitch, chord
      continue if options.only unless chord_name == options.only
      grid.add_cell ->
        draw_title chord_name
        , font: '10pt Times', fillStyle: 'rgb(10,20,30)'
        , x: 0, y: -3

        fingering = {positions: finger_positions_on_chord(chord, pitch)}
        fingering = best_fingering_for(chord, pitch) if best_fingering

        draw_chord_diagram grid.context, fingering.positions, barres: fingering.barres

chord_book = (options) ->
  title = if options.best_fingering then "Chord Diagrams" else "Combined Chord Diagrams"
  with_book title, pages: options.pages, (book) ->
    for chord in Chords
      book.add_page -> chord_page chord, options

module.exports =
  chord_book: chord_book
  chord_fingerings_page: chord_fingerings_page
  intervals_book: intervals_book
