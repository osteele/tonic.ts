fs = require('fs')
_ = require 'underscore'
Canvas = require('canvas')

#
# Music Theory
#

Intervals = ['P8', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7']

LongIntervalNames = [
  'Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th']

NoteNames = "G# A A# B C C# D D# E F F# G".split(/\s/)

Chords = [
  {name: 'Major', abbrs: ['', 'M'], pitch_classes: '047'},
  {name: 'Minor', abbr: 'm', pitch_classes: '037'},
  {name: 'Augmented', abbrs: ['+', 'aug'], pitch_classes: '048'},
  {name: 'Diminished', abbrs: ['°', 'dim'], pitch_classes: '036'},
  {name: 'Sus2', abbr: 'sus2', pitch_classes: '027'},
  {name: 'Sus4', abbr: 'sus4', pitch_classes: '057'},
  {name: 'Dominant 7th', abbrs: ['7', 'dom7'], pitch_classes: '047t'},
  {name: 'Augmented 7th', abbrs: ['+7', '7aug'], pitch_classes: '048t'},
  {name: 'Diminished 7th', abbrs: ['°7', 'dim7'], pitch_classes: '0369'},
  {name: 'Major 7th', abbr: 'maj7', pitch_classes: '047e'},
  {name: 'Minor 7th', abbr: 'min7', pitch_classes: '037t'},
  {name: 'Dominant 7 b5', abbr: '7b5', pitch_classes: '046t'},
  # following is also half-diminished 7th
  {name: 'Min 7th b5', abbrs: ['ø', 'Ø', 'm7b5'], pitch_classes: '036t'},
  {name: 'Dim Maj 7th', abbr: '°Maj7', pitch_classes: '036e'},
  {name: 'Min Maj 7th', abbrs: ['min/maj7', 'min(maj7)'], pitch_classes: '037e'},
  {name: '6th', abbrs: ['6', 'M6', 'M6', 'maj6'], pitch_classes: '0479'},
  {name: 'Minor 6th', abbrs: ['m6', 'min6'], pitch_classes: '0379'},
]

do ->
  keys = {'t': 10, 'e': 11}
  for chord in Chords
    chord.abbrs = chord.abbrs.split(/s/) if typeof chord.abbrs == 'string'
    chord.abbr ||= chord.abbrs[0]
    chord.pitch_classes = (keys[c] or parseInt(c, 10) for c in chord.pitch_classes)

compute_chord_name = (root_pitch, chord) ->
  "#{NoteNames[root_pitch]}#{chord.abbr}"

interval_class_between = (pca, pcb) ->
  n = (pcb - pca) % 12
  n += 12 while n < 0
  return n


#
# Fretboard
#

StringNumbers = [0..5]
StringCount = StringNumbers.length

FretNumbers = [0..4]  # includes nut
FretCount = FretNumbers.length - 1  # doesn't include nut

StringIntervals = [5, 5, 5, 4, 5]

OpenStringPitches = do (numbers=[]) ->
  numbers.push 20
  for interval, i in StringIntervals
    numbers.push numbers[i] + interval
  numbers

pitch_number_for_position = ({string, fret}) ->
  OpenStringPitches[string] + fret

finger_positions_each = (fn) ->
  for string in StringNumbers
    for fret in FretNumbers
      fn string: string, fret: fret

intervals_from = (root_position, semitones) ->
  root_note_number = pitch_number_for_position(root_position)
  positions = []
  finger_positions_each (finger_position) ->
    return unless interval_class_between(root_note_number, pitch_number_for_position(finger_position)) == semitones
    positions.push finger_position
  return positions

find_barres = (positions) ->
  fret_rows = for fn in FretNumbers
    (for sn in StringNumbers
      if _.find(positions, (pos)-> pos.string == sn and pos.fret > fn)
        '.'
      else if _.find(positions, (pos)-> pos.string == sn and pos.fret < fn)
        '-'
      else if _.find(positions, (pos) -> pos.string == sn and pos.fret == fn)
        'x'
      else
        ' ').join('')
  barres = []
  for fp, fn in fret_rows
    continue if fn == 0
    m = fp.match(/^[^x]*(x[\.x]+x\.*)$/)
    continue unless m
    barres.push
      fret: fn
      string: m[0].length - m[1].length
      string_count: m[1].length
      subsumption_count: m[1].match(/x/g).length
  # console.info fret_rows.join("\n")
  # console.info barres
  barres

fingerings_for = (chord, root_note) ->
  #
  # Generate
  #
  positions = do (positions=[]) ->
    finger_positions_each (pos) ->
      interval_class = interval_class_between(root_note, pitch_number_for_position(pos))
      degree_index = chord.pitch_classes.indexOf(interval_class)
      positions.push {string: pos.string, fret: pos.fret, degree_index} if degree_index >= 0
    positions

  frets_per_string = do (strings=([] for __ in OpenStringPitches)) ->
    strings[position.string].push position for position in positions
    strings

  collect_fingerings = (string_frets) ->
    return [[]] unless string_frets.length
    frets = string_frets[0]
    following_finger_positions = collect_fingerings(string_frets[1..])
    return following_finger_positions.concat(([n].concat(right) \
      for n in frets for right in following_finger_positions)...)

  generate_fingerings = ->
    ({positions} for positions in collect_fingerings(frets_per_string))

  chord_note_count = chord.pitch_classes.length


  #
  # Filters
  #

  count_distinct_notes = (fingering) ->
    _.chain(fingering.positions).pluck('degree_index').uniq().value().length

  has_all_notes = (fingering) ->
    return count_distinct_notes(fingering) == chord_note_count

  muted_medial_strings = (fingering) ->
    string_frets = (-1 for s in StringNumbers)
    string_frets[pos.string] = pos.fret for pos in fingering.positions
    p = ((if x >= 0 then x else 'x') for x in string_frets).join('')
    return p.match(/\dx+\d/)

  muted_treble_strings = (fingering) ->
    string_frets = (-1 for s in StringNumbers)
    string_frets[pos.string] = pos.fret for pos in fingering.positions
    p = ((if x >= 0 then x else 'x') for x in string_frets).join('')
    return p.match(/x$/)

  finger_count = (fingering) ->
    fingering.barres ||= find_barres(fingering.positions)
    n = (pos for pos in fingering.positions when pos.fret).length
    n -= barre.subsumption_count for barre in fingering.barres
    n

  few_fingers = (fingering) ->
    return finger_count(fingering) <= 4

  cmp = (fn) -> (x...) -> !fn(x...)

  filters = [
    {name: 'has all chord notes', filter: has_all_notes},
    {name: 'no muted medial strings', filter: cmp(muted_medial_strings)},
    {name: 'no muted treble strings', filter: cmp(muted_treble_strings)},
    {name: 'no more than four fingers', filter: few_fingers}
  ]

  filter_fingerings = (fingerings) ->
    for {name, filter} in filters
      filtered = (fingering for fingering in fingerings when filter(fingering))
      unless filtered.length
        console.error "#{chord_name}: no fingerings pass filter \"#{name}\""
        filtered = fingerings
      fingerings = filtered
    return fingerings

  #
  # Sort
  #

  high_note_count = (fingering) -> -fingering.positions.length

  is_first_position = (fingering) ->
    _(fingering.positions).sortBy((pos) -> pos.string)[0].degree_index == 0

  sorts = [
    finger_count,
    high_note_count,
    cmp(is_first_position)
  ]

  sort_fingerings = (fingerings) ->
    for sort in sorts
      fingerings = _(fingerings).sortBy(sort)
    return fingerings

  #
  # Generate, filter, and sort
  #

  chord_name = compute_chord_name root_note, chord
  fingerings = generate_fingerings()
  fingerings = filter_fingerings(fingerings)
  fingerings = sort_fingerings(fingerings)

  # for fingering in fingerings
  #   console.info finger_count(fingering)
  return fingerings

best_fingering_for = (chord, root_note) ->
  return fingerings_for(chord, root_note)[0]


#
# Drawing and Layout
#

BuildDirectory = __dirname + '/build/'
DefaultFilename = null
canvas = null
ctx = null

erase_background = ->
  ctx.fillStyle = 'white'
  ctx.fillRect 0, 0, canvas.width, canvas.height

draw_title = (text, {font, fillStyle, x, y, gravity}={}) ->
  gravity ||= ''
  ctx.font = font if font
  ctx.fillStyle = fillStyle if fillStyle
  m = ctx.measureText(text)
  # x -= m.width / 2
  y -= m.emHeightDescent if gravity.match(/^bottom$/)
  y += m.emHeightAscent if gravity.match(/^top|topLeft|topRight$/)
  ctx.fillText text, x or 0, y or 0

with_context = (ctx, fn) ->
  ctx.save()
  fn()
  ctx.restore()

filename = (name) -> DefaultFilename = name

save_canvas_to_png = (canvas, fname) ->
  out = fs.createWriteStream(BuildDirectory + fname)
  stream = canvas.pngStream()
  stream.on 'data', (chunk) -> out.write(chunk)
  stream.on 'end', () -> console.log "Saved #{fname}"

mode = null
pdf = false
page = (width, height, options, draw_page) ->
  [draw_page, options] = [options, null] if _.isFunction(options)
  page_margin = 10
  return [width, height] if mode == 'measure'
  canvas ||= new Canvas(width + 2 * page_margin, height + 2 * page_margin, pdf and 'pdf')
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if pdf
  erase_background()

  ctx.save()
  ctx.translate page_margin, page_margin
  draw_page ctx
  ctx.restore()

  license = "©2013 by Oliver Steele. "
  license += "This work is licensed under a Creative Commons Attribution 3.0 United States License."
  draw_title license
  , font: "4pt Times", fillStyle: 'black'
  , x: page_margin, y: canvas.height, gravity: 'bottom'

  unless pdf
    filename = "#{DefaultFilename or 'test'}.png"
    fs.writeFile BuildDirectory + filename, canvas.toBuffer()
    console.info "Saved #{filename}"

grid = (options, draw_page) ->
  {cols, rows, cell_width, cell_height, header_height} = options
  {gutter_width, gutter_height} = options
  header_height ||= 0
  gutter_width ||= 10
  gutter_height ||= 10
  page cols * cell_width + (cols - 1) * gutter_width
  , header_height + rows * cell_height + (rows - 1) * gutter_height
  , options
  , (ctx) ->
    i = 0
    draw_page (draw_cell) ->
      return if i >= cols * rows
      [col, row] = [i % cols, Math.floor(i / cols)]
      ctx.save()
      ctx.translate col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height)
      draw_cell()
      ctx.restore()
      i += 1

book = (filename, options, draw_book) ->
  draw_book = options if typeof options == 'function'
  pdf = true
  mode = 'draw'
  page_limit = options.pages
  page_count = 0
  draw_book (draw_page) ->
    return if page_limit and page_limit <= page_count
    page_count += 1
    draw_page()
    ctx.addPage()
  fs.writeFile BuildDirectory + filename + ".pdf", canvas.toBuffer()


#
# Drawing Fretboard
#

FretboardStyle =
  h_gutter: 10
  v_gutter: 10
  string_spacing: 20
  fret_width: 45
  fret_overhang: .3 * 45

padded_fretboard_width = do (style=FretboardStyle) ->
  2 * style.v_gutter + style.fret_width * FretCount + style.fret_overhang
padded_fretboard_height = do (style=FretboardStyle) ->
  2 * style.h_gutter + (StringCount - 1) * style.string_spacing

draw_fretboard_strings = ->
  style = FretboardStyle
  for string in StringNumbers
    y = string * style.string_spacing + style.h_gutter
    ctx.beginPath()
    ctx.moveTo style.h_gutter, y
    ctx.lineTo style.h_gutter + FretCount * style.fret_width + style.fret_overhang, y
    ctx.lineWidth = 1
    ctx.stroke()

draw_fretboard_frets = ->
  style = FretboardStyle
  for fret in FretNumbers
    x = style.h_gutter + fret * style.fret_width
    ctx.beginPath()
    ctx.moveTo x, style.h_gutter
    ctx.lineTo x, style.h_gutter + (StringCount - 1) * style.string_spacing
    ctx.lineWidth = 3 if fret == 0
    ctx.stroke()
    ctx.lineWidth = 1

draw_fretboard_finger_position = (position, options={}) ->
  {string, fret} = position
  {is_root, color} = options
  style = FretboardStyle
  color ||= if is_root then 'red' else 'white'
  x = style.h_gutter + (fret - 0.5) * style.fret_width
  x = style.h_gutter if fret == 0
  y = style.v_gutter + (5 - string) * style.string_spacing
  ctx.beginPath()
  ctx.arc x, y, 7, 0, 2 * Math.PI, false
  ctx.fillStyle = color
  ctx.lineWidth = 2 unless is_root
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1

draw_fretboard = (positions) ->
  draw_fretboard_strings()
  draw_fretboard_frets()
  draw_fretboard_finger_position(position, position) for position in (positions or [])


#
# Draw Chord Diagrams
#

ChordDiagramStyle =
  h_gutter: 5
  v_gutter: 5
  string_spacing: 6
  fret_height: 8
  above_fretboard: 8
  note_radius: 1
  closed_string_fontsize: 4

# padded_chord_diagram_height = 2 * ChordDiagramStyle.v_gutter + ChordDiagramStyle.fret_height * FretCount

ChordDiagramStyle =
  h_gutter: 5
  v_gutter: 5
  string_spacing: 12
  fret_height: 16
  above_fretboard: 8
  note_radius: 3
  closed_string_fontsize: 8

padded_chord_diagram_width = 2 * ChordDiagramStyle.h_gutter + (StringCount - 1) * ChordDiagramStyle.string_spacing
padded_chord_diagram_height = 2 * ChordDiagramStyle.v_gutter + (ChordDiagramStyle.fret_height + 2) * FretCount

draw_chord_diagram_strings = ->
  style = ChordDiagramStyle
  for i in StringNumbers
    x = i * style.string_spacing + style.h_gutter
    ctx.beginPath()
    ctx.moveTo x, style.v_gutter + style.above_fretboard
    ctx.lineTo x, style.v_gutter + style.above_fretboard + FretCount * style.fret_height
    ctx.stroke()

draw_chord_diagram_frets = ->
  style = ChordDiagramStyle
  for fret in FretNumbers
    y = style.v_gutter + style.above_fretboard + fret * style.fret_height
    ctx.beginPath()
    ctx.moveTo style.v_gutter - 0.5, y
    ctx.lineTo style.v_gutter + 0.5 + (StringCount - 1) * style.string_spacing, y
    ctx.lineWidth = 3 if fret == 0
    ctx.stroke()
    ctx.lineWidth = 1

draw_chord_diagram = (positions, options={}) ->
  {barres, dy} = options
  dy ||= 0
  style = ChordDiagramStyle

  finger_coordinates = ({string, fret}) ->
    return {
      x: style.h_gutter + string * style.string_spacing,
      y: style.v_gutter + style.above_fretboard + (fret - 0.5) * style.fret_height + dy
    }

  draw_finger_position = (position, options={}) ->
    {is_root, color} = options
    {x, y} = finger_coordinates(position)
    ctx.fillStyle = color or (if is_root then 'red' else 'white')
    ctx.strokeStyle = color or (if is_root then 'red' else 'black')
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc x, y, style.note_radius, 0, Math.PI * 2, false
    ctx.fill() if position.fret > 0 or is_root
    ctx.stroke()
    ctx.strokeStyle = 'black'

  draw_barres = ->
    for {fret, string, fret, string_count} in barres
      {x: x1, y} = finger_coordinates(string: string, fret: fret)
      {x: x2} = finger_coordinates(string: string + string_count - 1, fret: fret)
      ctx.fillStyle = 'rgba(0,0,0, 0.5)'
      ctx.beginPath()
      ctx.arc x1, y, style.string_spacing / 2, Math.PI * 1/2, Math.PI * 3/2, false
      ctx.arc x2, y, style.string_spacing / 2, Math.PI * 3/2, Math.PI * 1/2, false
      ctx.fill()

  draw_finger_positions = ->
    draw_finger_position position, position for position in positions

  draw_closed_strings = ->
    fretted_strings = []
    fretted_strings[position.string] = true for position in positions
    closed_strings = (string for string in StringNumbers when not fretted_strings[string])
    ctx.font = "#{style.closed_string_fontsize}pt Helvetica"
    ctx.fillStyle = 'black'
    label = 'x'
    for string_number in closed_strings
      m = ctx.measureText(label)
      ctx.fillText label
      , style.h_gutter + string_number * style.string_spacing - m.width / 2
      , style.v_gutter + style.above_fretboard - style.fret_height * 0.5 + m.emHeightDescent

  draw_chord_diagram_strings()
  draw_chord_diagram_frets()
  draw_barres() if barres
  draw_finger_positions() if positions
  draw_closed_strings() if positions


#
# Specific Cards and Pages
#

interval_cards = ->
  finger_positions_each ({string, fret}) ->
    canvas = new Canvas(padded_fretboard_width, padded_fretboard_height)
    ctx = canvas.getContext('2d')
    erase_background()
    draw_fingerboard()
    draw_note string_number: string, fret_number: fret
    filename = "#{string}-#{fret}.png"
    save_canvas_to_png canvas, filename
    console.info "Saved #{filename}"

    for interval_name, semitones in Intervals
      canvas = new Canvas(padded_fretboard_width, padded_fretboard_height)
      ctx = canvas.getContext('2d')
      erase_background()
      draw_fingerboard()
      draw_intervals_from semitones, string, fret
      interval_long_name = interval_name.replace(/^m/, 'min').replace(/^M/, 'Maj')
      filename = "#{string}-#{fret}-#{interval_long_name}.png"
      save_canvas_to_png canvas, filename

intervals_from_position_page = (root_position) ->
  canvas_gutter = 20
  header_height = 20
  grid cols: 3, rows: 4
  , cell_width: padded_fretboard_width + canvas_gutter
  , cell_height: padded_fretboard_height + header_height
  , (cell) ->
    for interval_name, semitones in Intervals
      cell ->
        ctx.translate 0, header_height
        draw_title interval_name
        , font: '10px Times', fillStyle: 'rgb(10,20,30)'
        , x: 0, y: -3
        positions = (pos for pos in intervals_from(root_position, semitones) \
          when not (pos.string == root_position.string and pos.fret == root_position.fret))
        positions.push string: root_position.string, fret: root_position.fret, is_root: true
        draw_fretboard positions

draw_intervals_from = (root_position, semitones, color) ->
  root_note_number = pitch_number_for_position(root_position)
  draw_finger_position root_position, is_root: true #, color: color
  for position in intervals_from(root_position, semitones)
    continue if position.string == root_position.string and position.fret == root_position.fret
    draw_finger_position position, color: color

intervals_from_note_sheets = ->
  finger_positions_each ({string, fret}) ->
    intervals_from_note_sheet string, fret

intervals_page = (semitones) ->
  canvas_gutter = 5
  header_height = 40
  cols = FretCount + 1
  rows = StringCount

  grid {cols, rows
  , cell_width: padded_fretboard_width + canvas_gutter
  , cell_height: padded_fretboard_height + canvas_gutter
  , header_height
  }, (cell) ->
    title = LongIntervalNames[semitones] + " Intervals"
    ctx.font = '25px Impact'
    ctx.fillStyle = 'rgb(128, 128, 128)'
    ctx.fillText title, canvas_gutter / 2, 30

    finger_positions_each (finger_position) ->
      cell ->
        draw_fingerboard()
        draw_intervals_from finger_position, semitones

intervals_book = ({by_root, pages}) ->
  if by_root
    book "Fretboard Intervals by Root", pages: pages, (page) ->
      finger_positions_each (finger_position) ->
        page -> intervals_from_position_page finger_position
  else
    book "Fretboard Intervals", pages: pages, (page) ->
      for _, semitones in Intervals
        page -> intervals_page semitones

chord_fingerings_page = (chord, chord_root) ->
  chord_root = NoteNames.indexOf(chord_root) if typeof chord_root == 'string'
  fingerings = fingerings_for(chord, chord_root)
  filename "#{compute_chord_name chord_root, chord} Fingerings"
  grid cols: 10, rows: 10
  , cell_width: padded_chord_diagram_width + 10
  , cell_height: padded_chord_diagram_height + 5
  , header_height: 40
  , (cell) ->
    draw_title "#{compute_chord_name chord_root, chord} Fingerings"
    , x: 0, y: 20
    , font: '25px Impact', fillStyle: 'black'
    for fingering in fingerings
      cell -> draw_chord_diagram fingering.positions, barres: fingering.barres

draw_pitch_diagram = (pitch_classes, degree_colors) ->
  r = 10
  pitch_names = '1 2b 2 3b 3 4 T 5 6b 6 7b 7'.split(/\s/)
  pitch_names = 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/)
  pitch_class_angle = (pitch_class) -> (-3 + pitch_class) * 2 * Math.PI / 12
  for pitch_class, degree_index in pitch_classes
    a = pitch_class_angle(pitch_class)
    ctx.beginPath()
    ctx.moveTo 0, 0
    ctx.lineTo r * Math.cos(a), r * Math.sin(a)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc r * Math.cos(a), r * Math.sin(a), 2, 0, 2 * Math.PI, false
    ctx.fillStyle = degree_colors[degree_index]
    ctx.fill()
  ctx.font = '4pt Times'
  ctx.fillStyle = 'black'
  for class_name, pitch_class in pitch_names
    a = pitch_class_angle(pitch_class)
    r2 = r + 7
    m = ctx.measureText(class_name)
    ctx.fillText class_name, r2 * Math.cos(a) - m.width / 2, r2 * Math.sin(a) + m.emHeightDescent

chord_page = (chord, options={}) ->
  {best_fingering, dy} = options

  pitch_fingers = []
  finger_positions_each (finger_position) ->
    pitch = pitch_number_for_position(finger_position) % 12
    pitch_fingers[pitch] = finger_position

  degree_colors = ['red', 'blue', 'green', 'orange']
  other_colors = ['rgba(255,0,0 ,.1)', 'rgba(0,0,255, 0.1)', 'rgba(0,255,0, 0.1)', 'rgba(255,0,255, 0.1)']

  grid cols: 4, rows: 3
  , cell_width: padded_chord_diagram_width
  , cell_height: padded_chord_diagram_height
  , gutter_height: 20
  , header_height: 40
  , (cell) ->

    draw_title "#{chord.name} Chords"
    , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: 0, y: 0, gravity: 'top'

    ctx.save()
    ctx.translate 285, 20
    ctx.scale 0.85,0.85
    draw_pitch_diagram chord.pitch_classes, degree_colors
    ctx.restore()

    pitches = ((i * 5 + 3) % 12 for i in [0...12])
    pitches = [8...12].concat([0...8]) unless best_fingering
    for pitch in pitches
      root_fingering = pitch_fingers[pitch]
      chord_name = compute_chord_name pitch, chord
      continue if options.only unless chord_name == options.only
      cell ->
        ctx.font = '10pt Times'
        ctx.fillStyle = 'rgb(10,20,30)'
        ctx.fillText chord_name, 0, -3

        fingering = do (positions=[]) ->
          for semitones, degree_index in chord.pitch_classes
            for {string, fret} in intervals_from(root_fingering, semitones)
              positions.push {string, fret, degree_index}
          {positions}
        fingering = best_fingering_for(chord, pitch) if best_fingering

        position.color = degree_colors[position.degree_index] for position in fingering.positions
        draw_chord_diagram fingering.positions, barres: fingering.barres, dy: dy

chord_book = (options) ->
  title = if options.best_fingering then "Chord Diagrams" else "Combined Chord Diagrams"
  book title, pages: options.pages, (page) ->
    for chord in Chords
      page -> chord_page chord, options

chord_flipbook = (options) ->
  chord = Chords[0]
  title = "Chord Flipbook"
  book title, (page) ->
    for dy in [0...ChordDiagramStyle.fret_height]
      page -> chord_page chord, dy: dy, only: 'E'


#
# CLI
#

program = require('commander')

program
  .version('0.0.1')

program
  .command('chordbook')
  .description('Create a chord bible')
  .option('-a, --combined', 'Combine all fingerings onto each chord chart')
  .option("-e, --exec_mode <mode>", "Which exec mode to use")
  .option('--pages <count>', 'Limit to this many pages', parseInt)
  .action (options) ->
    chord_book best_fingering: not options.combined, pages: options.pages

program
  .command('fingerings')
  .description('Fingerings for a specific chord')
  .action (options) ->
    chord_fingerings_page Chords[6], 'F'

program
  .command('intervals')
  .description('Intervals on the fretboard')
  .option('--pages <count>', 'Limit to this many pages', parseInt)
  .action (options) ->
    intervals_book by_root: true, pages: options.pages

program
  .command('flipbook')
  .description('Flipbook showing the animations of a chord')
  .action (options) ->
    chord_flipbook pages: 0

program
  .command('*')
  .action ->
    console.log 'Commands:'
    console.log '  chordbook'
    console.log '  fingerings'
    console.log '  intervals'
    console.log '  flipbook'

program.parse(process.argv)
