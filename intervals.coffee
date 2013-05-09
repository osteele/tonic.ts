fs = require('fs')
Canvas = require('canvas')

#
# Music Theory
#

Intervals = ['P8', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7']

LongIntervalNames = [
  'Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th']

NoteNames = "E F F# G G# A A# B C C# D D#".split(/\s/)

Chords = [
  {name: 'Major', abbr: '', offsets: [0, 4, 7]},
  {name: 'Minor', abbr: 'm', offsets: [0, 3, 7]},
  {name: 'Aug', abbr: '+', offsets: [0, 4, 8]},
  {name: 'Dim', abbr: '°', offsets: [0, 3, 6]},
  {name: 'Sus2', abbr: 'sus2', offsets: [0, 2, 7]},
  {name: 'Sus4', abbr: 'sus4', offsets: [0, 5, 7]},
  {name: 'Dom 7th', abbr: '7', offsets: [0, 4, 7, 10]},
  {name: 'Major 7th', abbr: 'maj7', offsets: [0, 4, 7, 11]},
  {name: 'Minor 7th', abbr: 'min7', offsets: [0, 3, 7, 10]},
  {name: 'Dim 7th', abbr: '°7', offsets: [0, 3, 6, 9]},
  {name: 'Dom 7 b5', abbr: '7b5', offsets: [0, 4, 6, 10]},
  {name: 'Min 7th b5', abbr: 'm7b5', offsets: [0, 3, 6, 10]},
  # {name: 'Aug 7th', abbr: '7aug', offsets: [0, 4, 8, 10]},
  {name: 'Dim Maj 7th', abbr: '°maj7', offsets: [0, 3, 6, 11]},
  {name: 'Min Maj 7th', abbr: 'min-maj7', offsets: [0, 3, 7, 11]},
  # {name: '6th', abbr: '6', offsets: [0, 4, 7, 9]},
]


#
# Fretboard
#
strings = [1..6]
string_count = strings.length

frets = [0..4]  # includes nut
fret_count = frets.length - 1  # doesn't include nut

StringIntervals = [5, 5, 5, 4, 5]
StringNoteNumbers = (->
  numbers = [0]
  for interval, i in StringIntervals
    numbers.push numbers[i] + interval
  numbers.reverse())()

fingering_note_number = ({string, fret}) ->
  StringNoteNumbers[string - 1] + fret

finger_positions_each = (fn) ->
  for string in strings
    for fret in frets
      fn string: string, fret: fret

intervals_from = (fingering, semitones) ->
  root_note_number = fingering_note_number(fingering)
  fingerings = []
  finger_positions_each (fingering) ->
    return unless (fingering_note_number(fingering) - root_note_number + 120) % 12 == semitones
    fingerings.push fingering
  return fingerings

#
# Drawing
#

build_directory = __dirname + '/build/'
canvas = null
ctx = null

erase_background = ->
  ctx.fillStyle = 'white'
  ctx.fillRect 0, 0, canvas.width, canvas.height

save_canvas_to_png = (canvas, fname) ->
  out = fs.createWriteStream(build_directory + fname)
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
    filename = "test.pdf"
    fs.writeFile build_directory + filename, canvas.toBuffer()

grid = (cols, rows, cell_width, cell_height, header_height, draw_page) ->
  page cols * cell_width, header_height + rows * cell_height, (ctx) ->
    i = 0
    draw_page (draw_cell) ->
      ctx.save()
      ctx.translate (i % cols) * cell_width, header_height + Math.floor(i / cols) * cell_height
      draw_cell()
      ctx.restore()
      i += 1

book = (filename, draw_book) ->
  pdf = true
  mode = 'draw'
  draw_book (draw_page) ->
    draw_page()
    ctx.addPage()
  fs.writeFile build_directory + filename, canvas.toBuffer()


#
# Layout Options
#
h_gutter = 10
v_gutter = 10
string_spacing = 20
fret_width = 45
fret_overhang = .3 * fret_width
padded_fretboard_width = 2 * v_gutter + fret_width * fret_count + fret_overhang
padded_fretboard_height = 2 * h_gutter + (string_count - 1) * string_spacing

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
  padded_fretboard_width = 2 * h_gutter + (string_count - 1) * string_spacing
  padded_fretboard_height = 2 * v_gutter + fret_height * fret_count + fret_overhang

draw_strings = ->
  for n, i in strings
    y = i * string_spacing + h_gutter
    ctx.beginPath()
    ctx.moveTo h_gutter, y
    ctx.lineTo h_gutter + fret_count * fret_width + fret_overhang, y
    ctx.lineWidth = 1
    ctx.stroke()

draw_frets = ->
  for fret_number in frets
    x = fret_number * fret_width + h_gutter
    ctx.beginPath()
    ctx.moveTo x, h_gutter
    ctx.lineTo x, h_gutter + (string_count - 1) * string_spacing
    ctx.lineWidth = 3 if fret_number == 0
    ctx.stroke()
    ctx.lineWidth = 1

draw_fingering = ({string, fret}, options) ->
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
    for n, i in strings
      x = i * string_spacing + h_gutter
      ctx.beginPath()
      ctx.moveTo x, v_gutter
      ctx.lineTo x, v_gutter + fret_count * fret_height + fret_overhang
      ctx.stroke()

  draw_frets = ->
    for fret_number in frets
      y = fret_number * fret_height + v_gutter
      ctx.beginPath()
      ctx.moveTo v_gutter-.5, y
      ctx.lineTo v_gutter+.5 + (string_count - 1) * string_spacing, y
      ctx.lineWidth = 3 if fret_number == 0
      ctx.stroke()
      ctx.lineWidth = 1

  draw_fingering = ({string, fret}, options) ->
    {is_root, color} = options || {}
    y = v_gutter + (fret - 1) * fret_height + fret_height / 2
    ctx.fillStyle = color or (if is_root then 'red' else 'white')
    ctx.strokeStyle = color or (if is_root then 'red' else 'black')
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc h_gutter + (6 - string) * string_spacing, y, note_radius, 0, 2 * Math.PI, false
    ctx.fill() if fret or is_root
    ctx.stroke()
    ctx.strokeStyle = 'black'

draw_fingerboard = (fingerings) ->
  draw_strings()
  draw_frets()
  if fingerings
    fretted_strings = []
    for fingering in fingerings
      fretted_strings[fingering.string] = true
      draw_fingering fingering, fingering
    for string_number in strings
      continue if fretted_strings[string_number]
      ctx.font = '4pt Helvetica'
      ctx.fillStyle = 'black'
      ctx.fillText "x", h_gutter + (6 - string_number) * string_spacing - 1, v_gutter - 2.5

draw_intervals_from = (root_fingering, semitones, color) ->
  root_note_number = fingering_note_number(root_fingering)
  draw_fingering root_fingering, is_root: true #, color: color
  for fingering in intervals_from(root_fingering, semitones)
    continue if fingering.string == root_fingering.string and fingering.fret == root_fingering.fret
    draw_fingering fingering, color: color

#
# Specific Cards and Pages
#

interval_cards = ->
  finger_positions_each (string, fret) ->
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

intervals_from_position_page = (fingering) ->
  canvas_gutter = 20
  header_height = 20
  grid 3, 4, padded_fretboard_width + canvas_gutter, padded_fretboard_height + header_height, 0, (cell) ->
    for interval_name, semitones in Intervals
      cell ->
        ctx.translate 0, header_height
        draw_fingerboard()
        draw_intervals_from fingering, semitones
        canvas_label = interval_name
        ctx.font = '10px Times'
        ctx.fillStyle = 'rgb(10,20,30)'
        ctx.fillText canvas_label, h_gutter, -3

  # filename = "#{string}-#{fret}-study-sheet.png"
  # save_canvas_to_png canvas, filename unless pdf

intervals_from_note_sheets = ->
  finger_positions_each (string, fret) ->
    intervals_from_note_sheet string, fret

intervals_page = (semitones) ->
  canvas_gutter = 5
  header_height = 40
  cols = fret_count + 1
  rows = string_count

  grid cols, rows, padded_fretboard_width + canvas_gutter, padded_fretboard_height + canvas_gutter, header_height, (cell) ->
    title = LongIntervalNames[semitones] + " Intervals"
    ctx.font = '25px Impact'
    ctx.fillStyle = 'rgb(128, 128, 128)'
    ctx.fillText title, canvas_gutter / 2, 30

    finger_positions_each (fingering) ->
      cell ->
        draw_fingerboard()
        draw_intervals_from fingering, semitones

  # unless pdf
  #   long_interval_name = Intervals[semitones].replace(/^m/, 'min').replace(/^M/, 'Maj')
  #   filename = "interval-#{long_interval_name}-study-sheet.pdf"
  #   fs.writeFile build_directory + filename, canvas.toBuffer()

intervals_book = ({by_root}) ->
  if by_root
    book "Fretboard Intervals by Root.pdf", (page) ->
      finger_positions_each (fingering) ->
        page -> intervals_from_position_page fingering
  else
    book "Fretboard Intervals.pdf", (page) ->
      for _, semitones in Intervals
        page -> intervals_page semitones

chord_page = (chord) ->
  diagram_gutter = 20
  header_height = 40
  diagram_title_height = 30
  cols = 3
  rows = 4
  if draw_diagrams
    diagram_title_height = 35
    diagram_gutter = 10

  pitch_fingers = []
  finger_positions_each (fingering) ->
    pitch_number = fingering_note_number(fingering) % 12
    pitch_fingers[pitch_number] = fingering

  colors = ['red', 'blue', 'green', 'orange']
  other_colors = ['rgba(255,0,0 ,.1)', 'rgba(0,0,255, 0.1)', 'rgba(0,255,0, 0.1)', 'rgba(255,0,255, 0.1)']

  grid cols, rows, padded_fretboard_width + diagram_gutter, padded_fretboard_height + diagram_gutter, diagram_title_height, (cell) ->
    ctx.font = '20px Impact'
    ctx.fillStyle = 'rgb(128, 128, 128)'
    ctx.fillText "#{chord.name} Chords", diagram_gutter / 2, header_height / 2

    for ix in [0...12]
      pitch_number = (ix * 5 + 7) % 12
      root_fingering = pitch_fingers[pitch_number]
      cell ->
        ctx.font = '20px Impact'
        ctx.font = '5pt Times' if draw_diagrams
        ctx.fillStyle = 'rgb(10,20,30)'
        ctx.fillText "#{NoteNames[pitch_number]}#{chord.abbr}", h_gutter, -3
        fingerings = []
        for semitones, si in chord.offsets
          for {string, fret} in intervals_from(root_fingering, semitones)
            fingerings.push {string, fret, color: colors[si]}
        draw_fingerboard fingerings

chord_book = ->
  book "Combined Fretboard Chords.pdf", (page) ->
    for chord in Chords
      page -> chord_page chord

# chord_page Chords[0]
# intervals_book by_root: true
# intervals_book by_root: false
chord_book()
