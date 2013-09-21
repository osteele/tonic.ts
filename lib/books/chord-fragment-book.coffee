_ = require 'underscore'

{Chords, NoteNames} = require './theory'
{bestFingeringFor, fingerings_for} = require './fingerings'

Layout = require('./layout')
{
  above
  hbox
  labeled
  textBlock
  withGraphicsContext
  withGridBlocks
  withBook
} = Layout

ChordDiagram = require('./chord_diagram')
draw_harmonic_table = require('./harmonic_table').draw
draw_pitch_diagram = require('./pitch_diagram').draw
harmonic_table_block = require('./harmonic_table').block
pitch_diagram_block = require('./pitch_diagram').block

collect_chord_shape_fragments = (chord) ->
  best_fingerings = {}
  for root in NoteNames
    fretstring = bestFingeringFor(chord.at(root)).fretstring
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
      for bassString in [0..(fretstring.length - chord.pitchClasses.length)]
        slice = fretstring[bassString...(bassString + chord.pitchClasses.length)]
        intervals = interval_names[bassString...(bassString + chord.pitchClasses.length)]
        continue unless slice.match /^\d+$/
        # include open positions only if there's not an equivalent closed position
        # continue if slice.match /0/ and not slice.match /4/
        positions = (pos \
          for pos in fingering.positions \
            when bassString <= pos.string < bassString + chord.pitchClasses.length)
        # shift bass fingerings
        dString = (if bassString == 0 then 1 else 0)
        # lower fingerings to first position:
        frets = (Number(c) for c in slice)
        dFret = 1 - Math.min(frets...)
        slice = (fret + dFret for fret in frets).join('') if dFret
        positions = ({fret: fret + dFret, string: string + dString, degreeIndex, intervalClass} \
          for {fret, string, degreeIndex, intervalClass} in positions)
        continue if slice.match /5/
        fragment_index = bassString
        fragment_index = 0 if bassString + chord.pitchClasses.length - 1 <= 3
        fragments_by_bass[fragment_index] ||= {}
        record = fragments_by_bass[fragment_index][slice] ||= {positions, intervals, roots: []}
        used_in = best_fingerings[fretstring]
        record.roots.push used_in if used_in and used_in not in record.roots

  return {
    each_fragment: (fn) ->
      for bassString, shape_map of fragments_by_bass
        bassString = Number(bassString)
        fragments = ({slice, positions, intervals, roots} for slice, {positions, intervals, roots} of shape_map)
        for {positions, roots, intervals} in fragments
          fn positions, intervals, roots
    }

chordShapeFragments = (options={}) ->
  options = _.extend {chord_pages: true}, options

  label_interval_names = (intervals, chord, positions) ->
    ht = harmonic_table_block (chord.pitchClasses[degreeIndex] for {degreeIndex} in positions)
    , fill_cells: true
    , radius: 5
    , align: {x: -2, y: 10}
    hbox ht, textBlock(intervals.join('-'), font: '7pt Times', fillStyle: 'rgb(10,20,30)')

  withBook "Chord Shape Fragments", pages: options.pages, size: 'quarto', (book) ->
    for chord in Chords
      break if book.done

      fragments = collect_chord_shape_fragments chord

      book.page_header (page) ->
        withGraphicsContext (ctx) ->
          ctx.translate page.width - 50, 15
          ctx.scale 0.85, 0.85
          draw_pitch_diagram ctx, chord.pitchClasses

        withGraphicsContext (ctx) ->
          ctx.translate page.width - 120, -15
          draw_harmonic_table chord.pitchClasses, radius: 12

      # FIXME required here to break cyclic reference, which should be removed instead
      book_utils = require './books'
      book.page_footer book_utils.drawLicenseFooter

      do ->
        withGridBlocks cols: 7, rows: 7
        , (grid) ->

          grid.header textBlock("#{chord.name} Chord Fragments", font: '20px Impact', fillStyle: 'rgb(128, 128, 128)')

          fragmentsByIntervalString = {}
          fragments.each_fragment (positions, intervals, roots) ->
            intervalString = intervals.join('-')
            (fragmentsByIntervalString[intervalString] ||= []).push {positions, intervals, roots}

          inversionKeys = _.keys(fragmentsByIntervalString).sort (a, b) ->
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

          inversionKeys.forEach (intervalString) ->
            fragment_list = fragmentsByIntervalString[intervalString]
            # grid.col += 0.6 unless grid.col == 0
            # grid.startRow() unless grid.col + fragment_list.length <= grid.cols
            fragment_list.forEach ({positions, intervals, roots}, i) ->
              draw_label = i == 0

              cell = ChordDiagram.block positions
              , draw_closed_strings: false
              , dimUnusedStrings: true
              , drawNut: false

              if roots.length
                choices = [
                  "(Used in #{roots.sort().join(', ')})"
                  "(In #{roots.sort().join(', ')})"
                  font: '5pt Times'
                  "(In many chords)"
                ]
                used = textBlock choices: choices
                , font: '6pt Times', fillStyle: 'rgb(10,20,30)'
                cell = above cell, used, baseline: cell

              cell = above label_interval_names(intervals, chord, positions), cell, baseline: cell if draw_label

              grid.cell cell

      continue unless options.chord_pages
      do ->
        withGridBlocks cols: 7, rows: 7
        , (grid) ->

          grid.header textBlock("#{chord.name} Chord Shapes", font: '20px Impact', fillStyle: 'rgb(128, 128, 128)')

          notes = (NoteNames[(i * 7 + 9) % 12] for i in [0...12])
          notes.forEach (root) ->
            rc = chord.at root
            fingering = bestFingeringFor rc
            # return if fingering.barres?.length
            return if fingering.positions.length <= rc.pitchClasses.length
            fretstring = fingering.fretstring
            # return if fretstring.match /0/ and fretstring.match /4/

            cell = ChordDiagram.block grid.context, fingering.positions
              , barres: fingering.barres
            cell = labeled rc.name, cell, font: '12pt Times', fillStyle: 'rgb(10,20,30)'
            if false
              # TODO align vertical centers
              cell = hbox cell, textBlock('=', font: '18pt Times', fillStyle: 'black')

            grid.startRow()
            grid.cell cell

            drawPlus = false
            [0...fretstring.length].forEach (bassString) ->
              treble_string = bassString + rc.pitchClasses.length - 1
              positions = (pos for pos in fingering.positions when bassString <= pos.string <= treble_string)
              return if positions.length < rc.pitchClasses.length
              dFret = 1 - Math.min((fret for {fret} in positions)...)
              dString = (if bassString == 0 then 1 else 0)
              positions = ({fret: fret + dFret, string: string + dString, degreeIndex, intervalClass} \
                for {fret, string, degreeIndex, intervalClass} in positions)

              cell = ChordDiagram.block positions
                , draw_closed_strings: false
                , drawNut: false
                , dimUnusedStrings: true

              if drawPlus
                cell = vbox cell, textBlock('+', font: '18pt Times', fillStyle: 'black')
              # drawPlus = true  # TODO

              if false
                ctx.scale 0.8, 0.8
                ctx.translate 10, 10

                label_interval_names (rc.degreeName degreeIndex for {degreeIndex} in positions), chord, positions

              grid.cell cell


module.exports = {
  chordShapeFragments
}
