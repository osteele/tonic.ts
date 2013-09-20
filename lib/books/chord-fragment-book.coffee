_ = require 'underscore'

{Chords, NoteNames} = require './theory'
{best_fingering_for, fingerings_for} = require './fretboard_logic'

Layout = require('./layout')
{
  above
  hbox
  labeled
  text_block
  with_graphics_context
  with_grid_blocks
  with_book
} = Layout

ChordDiagram = require('./chord_diagram')
draw_harmonic_table = require('./harmonic_table').draw
draw_pitch_diagram = require('./pitch_diagram').draw
harmonic_table_block = require('./harmonic_table').block
pitch_diagram_block = require('./pitch_diagram').block

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
        names[string] = rc.degreeName degreeIndex for {string, degreeIndex} in fingering.positions
        names
      for bass_string in [0..(fretstring.length - chord.pitchClasses.length)]
        slice = fretstring[bass_string...(bass_string + chord.pitchClasses.length)]
        intervals = interval_names[bass_string...(bass_string + chord.pitchClasses.length)]
        continue unless slice.match /^\d+$/
        # include open positions only if there's not an equivalent closed position
        # continue if slice.match /0/ and not slice.match /4/
        positions = (pos \
          for pos in fingering.positions \
            when bass_string <= pos.string < bass_string + chord.pitchClasses.length)
        # shift bass fingerings
        d_string = (if bass_string == 0 then 1 else 0)
        # lower fingerings to first position:
        frets = (Number(c) for c in slice)
        d_fret = 1 - Math.min(frets...)
        slice = (fret + d_fret for fret in frets).join('') if d_fret
        positions = ({fret: fret + d_fret, string: string + d_string, degreeIndex, intervalClass} \
          for {fret, string, degreeIndex, intervalClass} in positions)
        continue if slice.match /5/
        fragment_index = bass_string
        fragment_index = 0 if bass_string + chord.pitchClasses.length - 1 <= 3
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
  options = _.extend {chord_pages: true}, options

  label_interval_names = (intervals, chord, positions) ->
    ht = harmonic_table_block (chord.pitchClasses[degreeIndex] for {degreeIndex} in positions)
    , fill_cells: true
    , radius: 5
    , align: {x: -2, y: 10}
    hbox ht, text_block(intervals.join('-'), font: '7pt Times', fillStyle: 'rgb(10,20,30)')

  with_book "Chord Shape Fragments", pages: options.pages, size: 'quarto', (book) ->
    for chord in Chords
      break if book.done

      fragments = collect_chord_shape_fragments chord

      book.page_header (page) ->
        with_graphics_context (ctx) ->
          ctx.translate page.width - 50, 15
          ctx.scale 0.85, 0.85
          draw_pitch_diagram ctx, chord.pitchClasses

        with_graphics_context (ctx) ->
          ctx.translate page.width - 120, -15
          draw_harmonic_table chord.pitchClasses, radius: 12

      # FIXME required here to break cyclic reference, which should be removed instead
      book_utils = require './books'
      book.page_footer book_utils.draw_license_footer

      do ->
        with_grid_blocks cols: 7, rows: 7
        , (grid) ->

          grid.header text_block("#{chord.name} Chord Fragments", font: '20px Impact', fillStyle: 'rgb(128, 128, 128)')

          fragments_by_interval_string = {}
          fragments.each_fragment (positions, intervals, roots) ->
            interval_string = intervals.join('-')
            (fragments_by_interval_string[interval_string] ||= []).push {positions, intervals, roots}

          inversion_keys = _.keys(fragments_by_interval_string).sort (a, b) ->
            pitch_class_count = (s) ->
              _.uniq(s.split(/-/)).length
            inversion_index = (s) ->
              return 0 if s.match /^R/
              return 1 if s.match /^\D[234]/
              return 2 if s.match /^\D[56]/
              return 3
            a_count = pitch_class_count a
            b_count = pitch_class_count b
            return b_count - a_count unless a_count == b_count
            return inversion_index(a) - inversion_index(b)

          inversion_keys.forEach (interval_string) ->
            fragment_list = fragments_by_interval_string[interval_string]
            # grid.col += 0.6 unless grid.col == 0
            # grid.start_row() unless grid.col + fragment_list.length <= grid.cols
            fragment_list.forEach ({positions, intervals, roots}, i) ->
              draw_label = i == 0

              cell = ChordDiagram.block positions
              , draw_closed_strings: false
              , dim_unused_strings: true
              , nut: false

              if roots.length
                choices = [
                  "(Used in #{roots.sort().join(', ')})"
                  "(In #{roots.sort().join(', ')})"
                  font: '5pt Times'
                  "(In many chords)"
                ]
                used = text_block choices: choices
                , font: '6pt Times', fillStyle: 'rgb(10,20,30)'
                cell = above cell, used, baseline: cell

              cell = above label_interval_names(intervals, chord, positions), cell, baseline: cell if draw_label

              grid.cell cell

      continue unless options.chord_pages
      do ->
        with_grid_blocks cols: 7, rows: 7
        , (grid) ->

          grid.header text_block("#{chord.name} Chord Shapes", font: '20px Impact', fillStyle: 'rgb(128, 128, 128)')

          notes = (NoteNames[(i * 7 + 9) % 12] for i in [0...12])
          notes.forEach (root) ->
            rc = chord.at root
            fingering = best_fingering_for rc
            # return if fingering.barres?.length
            return if fingering.positions.length <= rc.pitchClasses.length
            fretstring = fingering.fretstring
            # return if fretstring.match /0/ and fretstring.match /4/

            cell = ChordDiagram.block grid.context, fingering.positions
              , barres: fingering.barres
            cell = labeled rc.name, cell, font: '12pt Times', fillStyle: 'rgb(10,20,30)'
            if false
              # TODO align vertical centers
              cell = hbox cell, text_block('=', font: '18pt Times', fillStyle: 'black')

            grid.start_row()
            grid.cell cell

            draw_plus = false
            [0...fretstring.length].forEach (bass_string) ->
              treble_string = bass_string + rc.pitchClasses.length - 1
              positions = (pos for pos in fingering.positions when bass_string <= pos.string <= treble_string)
              return if positions.length < rc.pitchClasses.length
              d_fret = 1 - Math.min((fret for {fret} in positions)...)
              d_string = (if bass_string == 0 then 1 else 0)
              positions = ({fret: fret + d_fret, string: string + d_string, degreeIndex, intervalClass} \
                for {fret, string, degreeIndex, intervalClass} in positions)

              cell = ChordDiagram.block positions
                , draw_closed_strings: false
                , nut: false
                , dim_unused_strings: true

              if draw_plus
                cell = vbox cell, text_block('+', font: '18pt Times', fillStyle: 'black')
              # draw_plus = true  # TODO

              if false
                ctx.scale 0.8, 0.8
                ctx.translate 10, 10

                label_interval_names (rc.degreeName degreeIndex for {degreeIndex} in positions), chord, positions

              grid.cell cell


module.exports = {
  chord_shape_fragments
}
