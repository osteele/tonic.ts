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
  {name: 'Aug', abbrs: ['+', 'aug'], pitch_classes: '048'},
  {name: 'Dim', abbr: ['°', 'dim'], pitch_classes: '036'},
  {name: 'Sus2', abbr: 'sus2', pitch_classes: '027'},
  {name: 'Sus4', abbr: 'sus4', pitch_classes: '057'},
  {name: 'Dom 7th', abbrs: ['7', 'dom7'], pitch_classes: '047t'},
  {name: 'Aug 7th', abbrs: ['+7', '7aug'], pitch_classes: '048t'},
  {name: 'Dim 7th', abbrs: ['°7', 'dim7'], pitch_classes: '0369'},
  {name: 'Major 7th', abbr: 'maj7', pitch_classes: '047e'},
  {name: 'Minor 7th', abbr: 'min7', pitch_classes: '037t'},
  {name: 'Dom 7 b5', abbr: '7b5', pitch_classes: '046t'},
  {name: 'Min 7th b5', abbr: 'm7b5', pitch_classes: '036t'},
  {name: 'Half-diminished 7th', abbrs: ['ø', 'Ø'], pitch_classes: '036t'},
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


#
# Fretboard
#

StringNumbers = [1..6]
StringCount = StringNumbers.length

FretNumbers = [0..4]  # includes nut
FretCount = FretNumbers.length - 1  # doesn't include nut

# FIXME these are backwards from the string numbers
StringIntervals = [5, 5, 5, 4, 5]

OpenStringNoteNumbers = do (numbers=[]) ->
  numbers.push 44
  for interval, i in StringIntervals
    numbers.push numbers[i] + interval
  numbers.reverse()

fingering_note_number = ({string, fret}) ->
  OpenStringNoteNumbers[string - 1] + fret

finger_positions_each = (fn) ->
  for string in StringNumbers
    for fret in FretNumbers
      fn string: string, fret: fret

intervals_from = (fingering, semitones) ->
  root_note_number = fingering_note_number(fingering)
  fingerings = []
  finger_positions_each (fingering) ->
    return unless (fingering_note_number(fingering) - root_note_number + 240) % 12 == semitones
    fingerings.push fingering
  return fingerings

fingerings_for = (chord, root_note) ->
  fingerings = do (fingering=[]) ->
    finger_positions_each (pos) ->
      interval_class = (fingering_note_number(pos) - root_note + 240) % 12
      degree_index = chord.offsets.indexOf(interval_class)
      fingering.push {string: pos.string, fret: pos.fret, degree_index: i} if degree_index >= 0
    fingering

  frets_per_string = do (strings=([] for __ in OpenStringNoteNumbers)) ->
    for position in positions
      strings[position.string - 1].push position
    strings

  compute_choices = (by_string) ->
    return [[]] unless by_string.length
    frets = by_string[0]
    remaining = compute_choices(by_string[1..])
    return remaining.concat(([n].concat(right) \
      for n in frets for right in remaining)...)

  count_distinct_notes = (fs) ->
    _.chain(fs).pluck('degree_index').uniq().value().length

  chord_note_count = count_distinct_notes(fingerings)

  has_all_notes = (fs) ->
    return count_distinct_notes(fs) == chord_note_count

  closed_medial_strings = (fs) ->
    string_frets = (-1 for s in StringNumbers)
    string_frets[f.string - 1] = f.fret for f in fs
    p = ((if x >= 0 then x else 'x') for x in string_frets).join('')
    return p.match(/\dx+\d/)

  closed_treble_strings = (fs) ->
    string_frets = (-1 for s in StringNumbers)
    string_frets[f.string - 1] = f.fret for f in fs
    p = ((if x >= 0 then x else 'x') for x in string_frets).reverse().join('')
    return p.match(/x$/)

  finger_count = (fs) ->
    (f for f in fs when f.fret).length

  high_note_count = (fs) -> -fs.length

  is_first_position = (fs) ->
    _(fs).sortBy((f) -> -f.string)[0].degree_index == 0

  cmp = (fn) -> (x...) -> !fn(x...)

  filters = [
    {name: 'has all chord notes', filter: has_all_notes},
    {name: 'no muted medial strings', filter: cmp(closed_medial_strings)},
    {name: 'no muted treble strings', filter: cmp(closed_treble_strings)}
  ]

  sorts = [
    finger_count,
    high_note_count,
    cmp(is_first_position)
  ]

  chord_name = "#{NoteNames[root_note % 12]}#{chord.abbr}"
  choices = compute_choices(frets_per_string)
  for {name, filter} in filters
    filtered = (choice for choice in choices when filter(choice))
    unless filtered.length
      console.error "#{chord_name}: fatal filter #{name}"
      filtered = choices
    choices = filtered
  for sort in sorts
    choices = _(choices).sortBy(sort)
  # for choice in choices
  #   console.info finger_count(choice)
  return choices

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

filename = (name) -> DefaultFilename = name

save_canvas_to_png = (canvas, fname) ->
  out = fs.createWriteStream(BuildDirectory + fname)
  stream = canvas.pngStream()
  stream.on 'data', (chunk) -> out.write(chunk)
  stream.on 'end', () -> console.log "Saved #{fname}"

mode = null
pdf = false
page = (width, height, draw_page) ->
  return [width, height] if mode == 'measure'
  canvas ||= new Canvas(width, height, pdf and 'pdf')
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if pdf
  erase_background()
  draw_page ctx
  unless pdf
    filename = "#{DefaultFilename or 'test'}.png"
    fs.writeFile BuildDirectory + filename, canvas.toBuffer()

grid = ({cols, rows, cell_width, cell_height, header_height}, draw_page) ->
  header_height ||= 0
  page cols * cell_width, header_height + rows * cell_height, (ctx) ->
    i = 0
    draw_page (draw_cell) ->
      return if i >= cols * rows
      ctx.save()
      ctx.translate (i % cols) * cell_width, header_height + Math.floor(i / cols) * cell_height
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
# Layout Options
#

h_gutter = 10
v_gutter = 10
string_spacing = 20
fret_width = 45
fret_overhang = .3 * fret_width
padded_fretboard_width = 2 * v_gutter + fret_width * FretCount + fret_overhang
padded_fretboard_height = 2 * h_gutter + (StringCount - 1) * string_spacing


#
# Drawing Fretboard and Diagrams
#

draw_diagrams = true
if draw_diagrams
  string_spacing = 6
  fret_height = 8
  fret_overhang = 0
  h_gutter = 5
  v_gutter = 5
  note_radius = 1
  closed_string_fontsize = 4
  padded_fretboard_width = 2 * h_gutter + (StringCount - 1) * string_spacing
  padded_fretboard_height = 2 * v_gutter + fret_height * FretCount + fret_overhang
  above_fretboard = fret_height

if true
  string_spacing = 12
  fret_height = 16
  note_radius = 3
  closed_string_fontsize = 8
  padded_fretboard_width = 2 * h_gutter + (StringCount - 1) * string_spacing
  padded_fretboard_height = 2 * v_gutter + (fret_height + 2) * FretCount + fret_overhang

draw_strings = ->
  for n, i in StringNumbers
    y = i * string_spacing + h_gutter
    ctx.beginPath()
    ctx.moveTo h_gutter, y
    ctx.lineTo h_gutter + FretCount * fret_width + fret_overhang, y
    ctx.lineWidth = 1
    ctx.stroke()

draw_frets = ->
  for fret_number in FretNumbers
    x = fret_number * fret_width + h_gutter
    ctx.beginPath()
    ctx.moveTo x, h_gutter
    ctx.lineTo x, h_gutter + (StringCount - 1) * string_spacing
    ctx.lineWidth = 3 if fret_number == 0
    ctx.stroke()
    ctx.lineWidth = 1

draw_finger_position = ({string, fret}, options) ->
  {is_root, color} = options || {}
  x = h_gutter + (fret - 1) * fret_width + fret_width / 2
  x = h_gutter if fret == 0
  ctx.beginPath()
  ctx.arc x, v_gutter + (string - 1) * string_spacing, 7, 0, 2 * Math.PI, false
  ctx.fillStyle = 'red'
  ctx.fillStyle = color or 'white' unless is_root
  ctx.lineWidth = 2 unless is_root
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1

if draw_diagrams
  draw_strings = ->
    for n, i in StringNumbers
      x = i * string_spacing + h_gutter
      ctx.beginPath()
      ctx.moveTo x, v_gutter + above_fretboard
      ctx.lineTo x, v_gutter + above_fretboard + FretCount * fret_height + fret_overhang
      ctx.stroke()

  draw_frets = ->
    for fret in FretNumbers
      y = v_gutter + above_fretboard + fret * fret_height
      ctx.beginPath()
      ctx.moveTo v_gutter - 0.5, y
      ctx.lineTo v_gutter + 0.5 + (StringCount - 1) * string_spacing, y
      ctx.lineWidth = 3 if fret == 0
      ctx.stroke()
      ctx.lineWidth = 1

  draw_finger_position = ({string, fret}, options) ->
    {is_root, color} = options || {}
    y = v_gutter + above_fretboard + (fret - 1) * fret_height + fret_height / 2
    ctx.fillStyle = color or (if is_root then 'red' else 'white')
    ctx.strokeStyle = color or (if is_root then 'red' else 'black')
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc h_gutter + (6 - string) * string_spacing, y, note_radius, 0, 2 * Math.PI, false
    ctx.fill() if fret or is_root
    ctx.stroke()
    ctx.strokeStyle = 'black'

draw_fingerboard = (finger_positions) ->
  draw_strings()
  draw_frets()
  if finger_positions
    fretted_strings = []
    for position in finger_positions
      fretted_strings[position.string] = true
      draw_finger_position position, position
    for string_number in StringNumbers
      continue if fretted_strings[string_number]
      ctx.font = "#{closed_string_fontsize}pt Helvetica"
      ctx.fillStyle = 'black'
      ctx.fillText "x", h_gutter + (6 - string_number) * string_spacing - 1, v_gutter + above_fretboard - 2.5

draw_intervals_from = (root_position, semitones, color) ->
  root_note_number = fingering_note_number(root_position)
  draw_finger_position root_position, is_root: true #, color: color
  for position in intervals_from(root_position, semitones)
    continue if position.string == root_position.string and position.fret == root_position.fret
    draw_finger_position position, color: color


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

    for interval_name, semitones in Intervals
      canvas = new Canvas(padded_fretboard_width, padded_fretboard_height)
      ctx = canvas.getContext('2d')
      erase_background()
      draw_fingerboard()
      draw_intervals_from semitones, string, fret
      interval_long_name = interval_name.replace(/^m/, 'min').replace(/^M/, 'Maj')
      filename = "#{string}-#{fret}-#{interval_long_name}.png"
      save_canvas_to_png canvas, filename

intervals_from_position_page = (finger_position) ->
  canvas_gutter = 20
  header_height = 20
  grid {cols: 3, rows: 4
  , cell_width: padded_fretboard_width + canvas_gutter
  , cell_height: padded_fretboard_height + header_height}
  , (cell) ->
    for interval_name, semitones in Intervals
      cell ->
        ctx.translate 0, header_height
        draw_fingerboard()
        draw_intervals_from finger_position, semitones
        canvas_label = interval_name
        ctx.font = '10px Times'
        ctx.fillStyle = 'rgb(10,20,30)'
        ctx.fillText canvas_label, h_gutter, -3

  # filename = "#{string}-#{fret}-study-sheet.png"
  # save_canvas_to_png canvas, filename unless pdf

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

intervals_book = ({by_root}) ->
  if by_root
    book "Fretboard Intervals by Root", (page) ->
      finger_positions_each (finger_position) ->
        page -> intervals_from_position_page finger_position
  else
    book "Fretboard Intervals", (page) ->
      for _, semitones in Intervals
        page -> intervals_page semitones

chord_fingerings_page = (chord, root_note) ->
  fingerings = fingerings_for(chord, root_note)
  filename "Fingerings"
  grid cols: 10, rows: 10
  , cell_width: padded_fretboard_width + 10
  , cell_height: padded_fretboard_height + 5
  , (cell) ->
    for fingering, i in fingerings
      cell -> draw_fingerboard(fingering)

chord_page = (chord, options) ->
  {best_fingering} = options || {}

  diagram_gutter = 20
  header_height = 40
  diagram_title_height = 30
  if draw_diagrams
    diagram_title_height = 35
    diagram_gutter = 10

  pitch_fingers = []
  finger_positions_each (finger_position) ->
    pitch = fingering_note_number(finger_position) % 12
    pitch_fingers[pitch] = finger_position

  colors = ['red', 'blue', 'green', 'orange']
  other_colors = ['rgba(255,0,0 ,.1)', 'rgba(0,0,255, 0.1)', 'rgba(0,255,0, 0.1)', 'rgba(255,0,255, 0.1)']

  grid cols: 3, rows: 4
  , cell_width: padded_fretboard_width + diagram_gutter
  , cell_height: padded_fretboard_height + diagram_gutter
  , header_height: diagram_title_height
  , (cell) ->
    ctx.font = '20px Impact'
    ctx.fillStyle = 'rgb(128, 128, 128)'
    ctx.fillText "#{chord.name} Chords", diagram_gutter / 2, header_height / 2

    for ix in [0...12]
      pitch = (ix * 5 + 3) % 12
      root_fingering = pitch_fingers[pitch]
      chord_name = "#{NoteNames[pitch]}#{chord.abbr}"
      cell ->
        fingerings = []
        for semitones, degree_index in chord.pitch_classes
          for {string, fret} in intervals_from(root_fingering, semitones)
            fingerings.push {string, fret, degree_index}
        fingerings = best_fingering_for(chord, pitch) if best_fingering
        f.color = colors[f.degree_index] for f in fingerings
        ctx.font = '20px Impact'
        ctx.font = '5pt Times' if draw_diagrams
        ctx.fillStyle = 'rgb(10,20,30)'
        ctx.fillText chord_name, h_gutter, -3
        draw_fingerboard fingerings

chord_book = (options) ->
  page_count = options.pages
  book "Combined Fretboard Chords", pages: options.pages, (page) ->
    for chord in Chords
      page -> chord_page chord, options

# chord_page Chords[0], best_fingering: true
# intervals_book by_root: true
# intervals_book by_root: false
chord_book best_fingering: 0, pages: 2
# chord_fingerings_page Chords[0], 44 + 3
