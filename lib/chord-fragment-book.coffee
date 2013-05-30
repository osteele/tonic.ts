_ = require 'underscore'

{
  Chords
  NoteNames
} = require('./theory')

{
  best_fingering_for
  fingerings_for
} = require('./fretboard_logic')

{
  draw: draw_chord_diagram
  width: padded_chord_diagram_width
  height: padded_chord_diagram_height
} = require('./chord_diagram')

Layout = require('./layout')
{
  draw_text
  with_graphics_context
  with_grid
  with_book
} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw

collect_chord_shape_fragments = (chord) ->
  best_fingerings = {}
  for root in NoteNames
    fretstring = best_fingering_for(chord.at(root)).fretstring
    best_fingerings[fretstring] = root

  fragments_by_bass = {}
  for root in 'CDEFGAB'  # this isn't all the pitches, but it's probably enough to generate all the shapes
    rc = chord.at(root)
    for fingering in fingerings_for(rc, filter: false)
      fretstring = fingering.fretstring
      interval_names = do ->
        names = []
        names[string] = rc.degree_name degree_index for {string, degree_index} in fingering.positions
        names
      for bass_string in [0..(fretstring.length - chord.pitch_classes.length)]
        slice = fretstring[bass_string...(bass_string + chord.pitch_classes.length)]
        intervals = interval_names[bass_string...(bass_string + chord.pitch_classes.length)]
        continue unless slice.match /^\d+$/
        # include open positions only if there's not an equivalent closed position
        # continue if slice.match /0/ and not slice.match /4/
        positions = (pos for pos in fingering.positions when bass_string <= pos.string < bass_string + chord.pitch_classes.length)
        # shift bass fingerings
        d_string = (if bass_string == 0 then 1 else 0)
        # lower fingerings to first position:
        frets = (Number(c) for c in slice)
        d_fret = 1 - Math.min(frets...)
        slice = (fret + d_fret for fret in frets).join('') if d_fret
        positions = ({fret: fret + d_fret, string: string + d_string, degree_index} for {fret, string, degree_index} in positions)
        continue if slice.match /5/
        fragment_index = bass_string
        fragment_index = 0 if bass_string + chord.pitch_classes.length - 1 <= 3
        fragments_by_bass[fragment_index] ||= {}
        record = fragments_by_bass[fragment_index][slice] ||= {positions, intervals, roots: []}
        used_in = best_fingerings[fretstring]
        record.roots.push used_in if used_in and used_in not in record.roots

  return {
    each_fragment: (fn) ->
      for bass_string, shape_map of fragments_by_bass
        bass_string = Number(bass_string)
        fragments = ({slice, positions, intervals, roots} for slice, {positions, intervals, roots} of shape_map)
        for {positions, roots, intervals} in fragments
          fn positions, intervals, roots
    }

chord_shape_fragments = (options={}) ->
  options = _.extend {draw_chords: true}, options

  label_interval_names = (intervals) ->
    draw_text intervals.join('-')
    , font: '7pt Times', fillStyle: 'rgb(10,20,30)'
    , x: 5, y: 7

  with_book "Chord Shape Fragments", pages: options.pages, (book) ->
    for chord in Chords
      break if book.done

      fragments = collect_chord_shape_fragments chord
      pitch_diagram = ->
        with_graphics_context (ctx) ->
          ctx.translate 295 + padded_chord_diagram_width, 15
          ctx.scale 0.85, 0.85
          draw_pitch_diagram ctx, chord.pitch_classes

      book.with_page (page) ->
        with_grid cols: 5, rows: 5
        , cell_width: padded_chord_diagram_width
        , cell_height: padded_chord_diagram_height + 10
        , header_height: 40
        , (grid) ->

          pitch_diagram()

          draw_text "#{chord.name} Chord Fragments"
          , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
          , x: 0, y: 0, gravity: 'topLeft'

          fragments_by_interval_string = {}
          fragments.each_fragment (positions, intervals, roots) ->
            interval_string = intervals.join('-')
            (fragments_by_interval_string[interval_string] ||= []).push {positions, intervals, roots}

          inversion_keys = _.keys(fragments_by_interval_string).sort (a, b) ->
            inversion_index = (s) ->
              if s.match(/R/) and s.match(/[234]/) and s.match(/5/)
                return 1 if s.match /^R\D+[234]\D+5/
                return 2 if s.match /^[234]/
                return 3
              return 5
            return inversion_index(a) - inversion_index(b)

          for interval_string in inversion_keys
            fragment_list = fragments_by_interval_string[interval_string]
            grid.col += 0.5 unless grid.col == 0
            grid.start_row() unless grid.col + fragment_list.length <= grid.cols
            fragment_list.forEach ({positions, intervals, roots}, i) ->
              grid.add_cell ->
                if roots.length
                  choices = [
                    "(Used in #{roots.sort().join(', ')})"
                    "(In #{roots.sort().join(', ')})"
                    font: '5pt Times'
                    "(In many chords)"
                  ]
                  draw_text choices: choices
                  , width: padded_chord_diagram_width
                  , font: '6pt Times', fillStyle: 'rgb(10,20,30)'
                  , x: 5, y: padded_chord_diagram_height + 6

                label_interval_names intervals if i == 0

                draw_chord_diagram grid.context, positions
                , draw_closed_strings: false
                , dim_unused_strings: true
                , nut: false

      continue unless options.draw_chords
      book.with_page ->
        with_grid cols: 5, rows: 4
        , cell_width: padded_chord_diagram_width
        , cell_height: padded_chord_diagram_height + 15
        , header_height: 50
        , (grid) ->

          draw_text "#{chord.name} Chord Shapes"
          , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
          , x: 0, y: 0, gravity: 'topLeft'

          pitch_diagram()

          notes = (NoteNames[(i * 7 + 9) % 12] for i in [0...12])
          notes.map (root) ->
            rc = chord.at(root)
            fingering = best_fingering_for(rc)
            # return if fingering.barres?.length
            return if fingering.positions.length <= rc.pitch_classes.length
            fretstring = fingering.fretstring
            # return if fretstring.match /0/ and fretstring.match /4/

            grid.start_row()
            grid.add_cell ->
              draw_text rc.name
              , font: '12pt Times', fillStyle: 'rgb(10,20,30)'
              , x: 5, y: -3

              draw_chord_diagram grid.context, fingering.positions
              , barres: fingering.barres

              draw_text '=', font: '18pt Times', fillStyle: 'black'
              , x: padded_chord_diagram_width + 2, y: padded_chord_diagram_height / 2 + 10, gravity: 'left'

            draw_plus = false
            [0...fretstring.length].map (bass_string) ->
              treble_string = bass_string + rc.pitch_classes.length - 1
              positions = (pos for pos in fingering.positions when bass_string <= pos.string <= treble_string)
              return if positions.length < rc.pitch_classes.length
              d_fret = 1 - Math.min((fret for {fret} in positions)...)
              d_string = (if bass_string == 0 then 1 else 0)
              positions = ({fret: fret + d_fret, string: string + d_string, degree_index} for {fret, string, degree_index} in positions)

              grid.add_cell ->
                with_graphics_context (ctx) ->
                  ctx.scale 0.8, 0.8
                  ctx.translate 10, 10

                  label_interval_names (rc.degree_name degree_index for {degree_index} in positions)
                  draw_chord_diagram grid.context, positions
                  , draw_closed_strings: false
                  , nut: false
                  , dim_unused_strings: true

                if draw_plus
                  draw_text '+', font: '18pt Times', fillStyle: 'black'
                  , x: 2, y: padded_chord_diagram_height / 2 + 10, gravity: 'right'
                draw_plus = true

module.exports = {
  chord_shape_fragments
}
