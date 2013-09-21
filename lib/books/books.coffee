_ = require 'underscore'

{
  Chords
  NoteNames
  IntervalNames
  LongIntervalNames
  Modes
  Scales
  intervalClassDifference
} = require('./theory')

Instruments = require('./instruments')
{
  FretCount
  intervalPositionsFromRoot
} = Instruments

{
  bestFingeringFor
  fingerings_for
  finger_positions_on_chord
} = require('./fingerings')

ChordDiagram = require('./chord_diagram')
FretboardDiagram = require('./fretboard_diagram')

Layout = require('./layout')
{
  PaperSizes
  erase_background
  drawText
  labeled
  textBlock
  pad_block
  withGraphicsContext
  save_canvas_to_png
  withBook
  withGridBlocks
  hbox
} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw
pitch_diagram_block = require('./pitch_diagram').block
draw_harmonic_table = require('./harmonic_table').draw
harmonic_table_block = require('./harmonic_table').block
{chordShapeFragments} = require './chord-fragment-book'

CC_LICENSE_TEXT = "This work is licensed under a Creative Commons Attribution 3.0 United States License."

drawLicenseFooter = (page) ->
  text = "©2013 by Oliver Steele. " + CC_LICENSE_TEXT
  drawText text
  , font: '4pt Times'
  , fillStyle: 'black'
  , y: page.height - page.top_margin
  , gravity: 'botLeft'



#
# Interval Cards and Pages
#

interval_cards = ->
  instrument = Instruments.Default
  instrument.eachFingerPosition ({string, fret}) ->
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

intervals_from_position_page = (rootPosition) ->
  instrument = Instruments.Default
  canvas_gutter = 20
  header_height = 20
  withGrid cols: 3, rows: 4
  , cell_width: FretboardDiagram.height + canvas_gutter
  , cell_height: FretboardDiagram.width + header_height
  , (grid) ->
    for semitones in [0...12]
      interval_name = IntervalNames[semitones]
      grid.add_cell ->

        drawText interval_name
        , font: '10px Times', fillStyle: 'rgb(10,20,30)'
        , x: 0, y: -3

        positions = (pos for pos in intervalPositionsFromRoot(instrument, rootPosition, semitones) \
          when not (pos.string == rootPosition.string and pos.fret == rootPosition.fret))
        positions.push string: rootPosition.string, fret: rootPosition.fret, is_root: true
        FretboardDiagram.draw grid.context, positions

draw_intervals_from = (rootPosition, semitones, color) ->
  root_note_number = Instruments.Default.pitchAt(rootPosition)
  draw_finger_position rootPosition, is_root: true #, color: color
  for position in intervals_from(rootPosition, semitones)
    continue if position.string == rootPosition.string and position.fret == rootPosition.fret
    draw_finger_position position, color: color

intervals_from_note_sheets = ->
  Instruments.Default.eachFingerPosition ({string, fret}) ->
    intervals_from_note_sheet string, fret

intervals_page = (instrument, semitones) ->
  canvas_gutter = 5
  header_height = 40
  cols = FretCount + 1
  rows = instrument.strings

  withGrid cols: cols, rows: rows
  , cell_width: FretboardDiagram.height + canvas_gutter
  , cell_height: FretboardDiagram.width + canvas_gutter
  , header_height: header_height
  , (grid) ->
    drawText "#{LongIntervalNames[semitones]} Intervals"
    , font: '25px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: canvas_gutter / 2, y: 30

    Instruments.Default.eachFingerPosition (finger_position) ->
      grid.add_cell ->
        FretboardDiagram.draw grid.context, intervals_from(finger_position, semitones)

intervalsBook = (options={}) ->
  {by_root, pages} = options
  instrument = Instruments.Default
  if by_root
    withBook "Fretboard Intervals by Root", page_limit: pages, (book) ->
      Instruments.Default.eachFingerPosition (finger_position) ->
        intervals_from_position_page finger_position
  else
    withBook "Fretboard Intervals", page_limit: pages, (book) ->
      for semitones in [0..12]
        intervals_page instrument, semitones


#
# Chord Lattice Diagrams
#

harmonicTableChords = (options={}) ->
  options = _.extend {}, options, chords: true
  harmonic_table options

harmonicTableScales = (options={}) ->
  options = _.extend {}, options, scales: true, modes: true
  harmonic_table options

harmonic_table = (options={}) ->
  {cell_radius, title} = _.extend {cell_radius: 20}, options
  title ?= do ->
    return 'Harmonic Table Chords' if options.chords
    return 'Harmonic Table Scales' if options.scales
    return 'Harmonic Table Modes' if options.modes
    return 'Harmonic Table Intervals' if options.intervals
    return 'Harmonic Table'

  extend_octave = (tones, octaves) ->
    first_octave = tones.slice 0
    [1...1+octaves].forEach (octave) ->
      tones = tones.concat (i + 12 * octave for i in first_octave)
    tones

  withBook title, size: PaperSizes.letter, (book) ->
    withGridBlocks gutter_height: 20, (grid) ->

      grid.header pad_block(harmonic_table_block([0...12], cell_radius: 30, label_cells: true), bottom: 20)

      if options.intervals
        intervals = [7, 4, 3, 2, 1]
        interval_sets = [intervals]
        interval_sets.push (12 - interval for interval in intervals)
        interval_sets[1].push 6
        for intervals in interval_sets
          grid.startRow()
          grid.cells _.without(intervals, 0).map (semitones) ->
            interval_name = IntervalNames[semitones]
            labeled interval_name
            , harmonic_table_block [semitones], radius: cell_radius, label_cells: true

      if options.scales
        grid.startRow()
        grid.cells Scales.map ({name, tones}) ->
          tones = extend_octave tones, 2
          labeled name
          , harmonic_table_block tones, radius: cell_radius, fill_cells: true

      if options.modes
        grid.startRow()
        grid.cells Modes.map ({name, tones}) ->
          tones = extend_octave tones, 2
          labeled name
          , harmonic_table_block tones, radius: cell_radius, fill_cells: true

      if options.chords
        grid.startRow()
        grid.cells Chords.map (chord) ->
          labeled chord.name
          , harmonic_table_block chord.pitchClasses, radius: cell_radius, fill_cells: true


#
# Chord Fingerings
#

chordFingeringsPage = ({chord}) ->
  fingerings = fingerings_for chord
  withBook "#{chord.name} Fingerings", size: PaperSizes.letter, (book) ->
    withGridBlocks {}, (grid) ->
      grid.header textBlock("#{chord.name} Fingerings", font: '25px Impact', fillStyle: 'black')
      grid.cells fingerings.map (fingering) ->
        ChordDiagram.block fingering.positions, barres: fingering.barres

chord_page = (chord, options={}) ->
  {best_fingering} = options
  pitches = ((i * 5 + 3) % 12 for i in [0...12])
  pitches = [8...12].concat([0...8]) unless best_fingering

  withGridBlocks gutter_height: 20
  , (grid) ->

    grid.header(
      hbox(
        textBlock("#{chord.name} Chords", font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'),
        # hspring,
        pitch_diagram_block chord.pitchClasses, 0.85
      )
    )

    pitches.forEach (pitch) ->
      rooted_chord = chord.at pitch
      return if options.only unless rooted_chord.name == options.only
      fingering = {positions: finger_positions_on_chord rooted_chord}
      fingering = bestFingeringFor rooted_chord if best_fingering
      grid.cell(
        labeled rooted_chord.name, font: '10pt Times', fillStyle: 'rgb(10,20,30)', align: 'left',
          ChordDiagram.block fingering.positions, barres: fingering.barres
        )

chordBook = (options={}) ->
  title = if options.best_fingering then "Chord Diagrams" else "Combined Chord Diagrams"
  withBook title, size: PaperSizes.letter, page_limit: options.pages, (book) ->
    for chord in Chords
      chord_page chord, options


#
# Exports
#

module.exports = {
  chordBook
  chordFingeringsPage
  harmonicTableChords
  harmonicTableScales
  chordShapeFragments
  drawLicenseFooter
  intervalsBook
}
