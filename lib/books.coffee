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
  draw_text
  measure_text
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
        book.with_page -> intervals_from_position_page finger_position
  else
    with_book "Fretboard Intervals", pages: pages, (book) ->
      for __, semitones in Intervals
        book.with_page -> intervals_page semitones


#
# Chord Shape Fragments
#

collect_chord_shape_fragments = (chord) ->
  best_fingerings = {}
  for root in NoteNames
    fretstring = best_fingering_for(chord.at(root)).fretstring
    best_fingerings[fretstring] = root

  fragments_by_bass = {}
  for root in 'CDEFGAB'  # this isn't all the pitches, but it's probably enough to generate all the shapes
    for fingering in fingerings_for(chord.at(root), filter: false)
      fretstring = fingering.fretstring
      for bass_string in [0..(fretstring.length - chord.pitch_classes.length)]
        slice = fretstring[bass_string...(bass_string + chord.pitch_classes.length)]
        continue unless slice.match /^\d+$/
        # include open positions only if there's not an equivalent closed position
        # continue if slice.match /0/ and not slice.match /4/
        positions = (pos for pos in fingering.positions when bass_string <= pos.string < bass_string + chord.pitch_classes.length)
        # shift bass fingerings
        if bass_string == 1
          positions = ({fret, string: string - bass_string, degree_index} for {fret, string, degree_index} in positions)
        # lower fingerings to first position:
        unless false #slice.match /[01]/
          frets = (Number(c) for c in slice)
          d_fret = Math.min(frets...) - 1
          slice = (fret - d_fret for fret in frets).join('')
          positions = ({fret: fret - d_fret, string, degree_index} for {fret, string, degree_index} in positions)
        continue if slice.match /5/
        fragment_index = bass_string
        fragment_index = 0 if bass_string + chord.pitch_classes.length - 1 <= 3
        fragments_by_bass[fragment_index] ||= {}
        record = fragments_by_bass[fragment_index][slice] ||= {positions, roots: []}
        used_in = best_fingerings[fretstring]
        record.roots.push used_in if used_in and used_in not in record.roots

  return {
    each_fragment: (fn) ->
      for bass_string, shape_map of fragments_by_bass
        bass_string = Number(bass_string)
        fragments = ({slice, positions, roots} for slice, {positions, roots} of shape_map)
        for {slice, positions, roots} in fragments
          fn positions, roots
    }

chord_shape_fragments = (options={}) ->
  with_book "Chord Shape Fragments", pages: options.pages, (book) ->
    for chord in Chords
      break if book.done
      fragments = collect_chord_shape_fragments chord

      book.with_page ->
        with_grid cols: 5, rows: 5
        , cell_width: padded_chord_diagram_width
        , cell_height: padded_chord_diagram_height
        , header_height: 40
        , (grid) ->

          draw_text "#{chord.name} Chord Fragments"
          , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
          , x: 0, y: 0, gravity: 'topLeft'

          with_graphics_context (ctx) ->
            ctx.translate 285, 20
            ctx.scale 0.85, 0.85
            draw_pitch_diagram ctx, chord.pitch_classes, pitch_colors: ChordDiagramStyle.chord_degree_colors

          fragments.each_fragment (positions, roots) ->
            grid.add_cell ->
              if roots.length
                font = '7pt Times'
                title = "Used in #{roots.sort().join(', ')}:"
                title = "In #{roots.sort().join(', ')}:" if measure_text(title, font: font).width > padded_chord_diagram_width
                font = '8pt Times' if measure_text(title, font: font).width > padded_chord_diagram_width
                title = "In many chords:" if measure_text(title, font: font).width > padded_chord_diagram_width
                draw_text title
                , font: font, fillStyle: 'rgb(10,20,30)'
                , x: 5, y: 7

              draw_chord_diagram grid.context, positions
              , draw_closed_strings: false
              , nut: (fret for {fret} in positions).indexOf(0) >= 0
              , pitch_colors: ChordDiagramStyle.chord_degree_colors

      book.with_page ->
        with_grid cols: 5, rows: 12
        , cell_width: padded_chord_diagram_width
        , cell_height: padded_chord_diagram_height + 10
        , header_height: 10
        , (grid) ->
          for root in NoteNames
            rc = chord.at(root)
            fingering = best_fingering_for(rc)
            continue if fingering.barres?.length
            continue if fingering.positions.length <= rc.pitch_classes.length
            fretstring = fingering.fretstring
            continue if fretstring.match /0/ and fretstring.match /4/

            grid.start_row()
            grid.add_cell ->
              draw_text rc.name
              , font: '12pt Times', fillStyle: 'rgb(10,20,30)'
              , x: 5, y: -3

              draw_chord_diagram grid.context, fingering.positions
              , pitch_colors: ChordDiagramStyle.chord_degree_colors

              draw_text '=', font: '18pt Times', fillStyle: 'black'
              , x: padded_chord_diagram_width, y: padded_chord_diagram_height / 2 + 10, gravity: 'left'

            draw_plus = false
            for i in [0..(fretstring.length - rc.pitch_classes.length)]
              positions = (position for position in fingering.positions when i <= position.string < i + rc.pitch_classes.length)
              continue if positions.length < rc.pitch_classes.length
              d_fret = 1 - Math.min((fret for {fret} in positions)...)
              d_string = (if i == 0 then 1 else 0)
              positions = ({fret: fret + d_fret, string: string + d_string, degree_index} for {fret, string, degree_index} in positions)
              title = (rc.degree_name degree_index for {degree_index} in positions).join('-')
              grid.add_cell ->
                with_graphics_context (ctx) ->
                  ctx.scale 0.8, 0.8
                  ctx.translate 10, 10

                  draw_text title
                  , font: '7pt Times', fillStyle: 'rgb(10,20,30)'
                  , x: 5, y: 7

                  draw_chord_diagram grid.context, positions
                  , draw_closed_strings: false
                  , nut: false
                  , pitch_colors: ChordDiagramStyle.chord_degree_colors

                if draw_plus
                  draw_text '+', font: '18pt Times', fillStyle: 'black'
                  , x: 2, y: padded_chord_diagram_height / 2 + 10, gravity: 'right'
                draw_plus = true



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
      grid.add_cell -> draw_chord_diagram grid.context, fingering.positions, barres: fingering.barres

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
      draw_pitch_diagram ctx, chord.pitch_classes, pitch_colors: ChordDiagramStyle.chord_degree_colors

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
      book.with_page -> chord_page chord, options


#
# Exports
#

module.exports = {
  chord_book
  chord_fingerings_page
  chord_shape_fragments
  intervals_book
}
