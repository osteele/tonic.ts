fs = require('fs')
Canvas = require('canvas')

show_hidden_strings = false  # render invisible CF (between G and B)

strings = [1..6]
hidden_strings = []
if show_hidden_strings
  strings = [1..12]
  hidden_strings = [3..8]
string_count = strings.length

frets = [0..4]  # includes nut
fret_count = frets.length - 1  # doesn't include nut

h_gutter = 10
v_gutter = 10
string_spacing = 20
fret_width = 45
fret_overhang = .3 * fret_width
padded_fretboard_width = 2 * v_gutter + fret_width * fret_count + fret_overhang
padded_fretboard_height = 2 * h_gutter + (string_count - 1) * string_spacing

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

build_directory = __dirname + '/build/'
canvas = null
ctx = null

string_note_numbers = ((string_count - n) * 5 for n in strings)
unless show_hidden_strings
  string_note_numbers[0] -= 1
  string_note_numbers[1] -= 1

intervals = ['P8', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7']
long_intervals_names = [
  'Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th']

erase_background = ->
  ctx.fillStyle = 'white'
  ctx.fillRect 0, 0, canvas.width, canvas.height

draw_strings = ->
  for n, i in strings
    y = i * string_spacing + h_gutter
    ctx.beginPath()
    ctx.moveTo h_gutter, y
    ctx.lineTo h_gutter + fret_count * fret_width + fret_overhang, y
    ctx.lineWidth = 1
    ctx.lineWidth = 0.5 if hidden_strings.indexOf(n) >= 0
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

draw_note = (string_number, fret_number, root, color) ->
  x = h_gutter + (fret_number - 1) * fret_width + fret_width / 2
  x = h_gutter if fret_number == 0
  ctx.beginPath()
  ctx.arc x, v_gutter + (string_number - 1) * string_spacing, 7, 0, 2 * Math.PI, false
  ctx.fillStyle = 'red'
  ctx.fillStyle = color or 'white' unless root
  ctx.lineWidth = 2 unless root
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

  draw_note = (string_number, fret_number, root, color) ->
    y = v_gutter + (fret_number - 1) * fret_height + fret_height / 2
    ctx.fillStyle = color or (if root then 'red' else 'white')
    ctx.strokeStyle = color or 'black'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc h_gutter + (6 - string_number) * string_spacing, y, note_radius, 0, 2 * Math.PI, false
    ctx.fill() if fret_number
    ctx.stroke()
    ctx.strokeStyle = 'black'


draw_fingerboard = (fingerings) ->
  draw_strings()
  draw_frets()
  if fingerings
    fretted_strings = (false for _ in [0..string_number])
    for {string, fret, root, color} in fingerings
      fretted_strings[string] = true
      draw_note string, fret, root, color
    for is_fretted, string_number in fretted_strings
      continue if is_fretted or string_number < 1
      ctx.font = '4pt Helvetica'
      ctx.fillStyle = 'black'
      ctx.fillText "x", h_gutter + (6 - string_number) * string_spacing - 1, v_gutter - 2.5


note_number_at = (string, fret) ->
  string_note_numbers[string - 1] + fret

fingerings_each = (fn) ->
  for string in strings
    for fret in frets
      fn string, fret

save_canvas_to_png = (canvas, fname) ->
  out = fs.createWriteStream(build_directory + fname)
  stream = canvas.pngStream()
  stream.on 'data', (chunk) -> out.write(chunk)
  stream.on 'end', () -> console.log "Saved #{fname}"

intervals_from = (root_string, root_fret, semitones) ->
  root_note_number = note_number_at(root_string, root_fret)
  fingerings = []
  for string in strings
    for fret in frets
      continue unless (note_number_at(string, fret) - root_note_number + 120) % 12 == semitones
      fingerings.push string: string, fret: fret
  return fingerings

draw_intervals_from = (semitones, root_string, root_fret, color) ->
  root_note_number = note_number_at(root_string, root_fret)
  draw_note root_string, root_fret, true, color
  for {string, fret} in intervals_from(root_string, root_fret, semitones)
    continue if string == root_string and fret == root_fret
    draw_note string, fret, false, color

interval_cards = ->
  fingerings_each (string, fret) ->
    canvas = new Canvas(padded_fretboard_width, padded_fretboard_height)
    ctx = canvas.getContext('2d')
    erase_background()
    draw_fingerboard()
    draw_note string, fret
    filename = "#{string}-#{fret}.png"
    save_canvas_to_png canvas, filename

    for interval_name, semitones in intervals
      canvas = new Canvas(padded_fretboard_width, padded_fretboard_height)
      ctx = canvas.getContext('2d')
      erase_background()
      draw_fingerboard()
      draw_intervals_from semitones, string, fret
      interval_long_name = interval_name.replace(/^m/, 'min').replace(/^M/, 'Maj')
      filename = "#{string}-#{fret}-#{interval_long_name}.png"
      save_canvas_to_png canvas, filename

intervals_from_note_sheet = (string, fret, pdf) ->
  canvas_gutter = 20
  header_height = 40
  canvas_width = padded_fretboard_width * 3 + canvas_gutter * 3
  canvas_height = (padded_fretboard_height + header_height) * 4 + canvas_gutter * 3

  canvas = new Canvas(canvas_width, canvas_height, pdf and 'pdf') unless pdf and canvas
  ctx = canvas.getContext('2d')
  erase_background()

  for interval_name, semitones in intervals
    ix = (semitones + 11) % 12
    dx = (ix % 3) * (padded_fretboard_width + canvas_gutter) + canvas_gutter / 2
    dy = Math.floor(ix / 3) * (header_height + padded_fretboard_height + canvas_gutter)
    ctx.save()
    ctx.translate dx, dy
    ctx.translate 0, header_height
    draw_fingerboard()
    draw_intervals_from semitones, string, fret
    canvas_label = interval_name
    ctx.font = '30px Impact'
    ctx.fillStyle = 'rgb(10,20,30)'
    ctx.fillText canvas_label, h_gutter, -3
    ctx.restore()

  filename = "#{string}-#{fret}-study-sheet.png"
  save_canvas_to_png canvas, filename unless pdf

intervals_from_note_sheets = ->
  fingerings_each (string, fret) ->
    intervals_from_note_sheet string, fret

intervals_from_root_book = ->
  fingerings_each (string, fret) ->
    intervals_from_note_sheet string, fret, true
    ctx.addPage()
  filename = "Fretboard Intervals by Root.pdf"
  fs.writeFile build_directory + filename, canvas.toBuffer()

make_interval_sheet = (semitones, pdf) ->
  canvas_gutter = 20
  header_height = 40
  cols = fret_count + 1
  rows = (string_count - hidden_strings.length)
  canvas_width = padded_fretboard_width * cols + canvas_gutter * cols
  canvas_height = header_height + padded_fretboard_height * rows + canvas_gutter * rows

  canvas = new Canvas(canvas_width, canvas_height, pdf and 'pdf') unless pdf and canvas
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if pdf
  erase_background()

  canvas_label = long_intervals_names[semitones] + " Intervals"
  ctx.font = '30px Impact'
  ctx.fillStyle = 'rgb(128, 128, 128)'
  ctx.fillText canvas_label, canvas_gutter / 2, header_height

  fingerings_each (string, fret) ->
    return if hidden_strings.indexOf(string) >= 0
    row = string - 1
    row -= hidden_strings.length if show_hidden_strings and string > hidden_strings[0]
    dx = fret * (padded_fretboard_width + canvas_gutter) + canvas_gutter / 2
    dy = header_height + row * (padded_fretboard_height + canvas_gutter) + canvas_gutter / 2
    ctx.save()
    ctx.translate dx, dy
    draw_fingerboard()
    draw_intervals_from semitones, string, fret
    if show_hidden_strings
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.fillRect 0, v_gutter + 1.5 * string_spacing, padded_fretboard_width, hidden_strings.length * string_spacing
      ctx.fillStyle = 'rgba(0,0,0,0.0125)'
      ctx.fillRect 0, v_gutter + 1.5 * string_spacing, padded_fretboard_width, hidden_strings.length * string_spacing
    ctx.restore()

  unless pdf
    long_interval_name = intervals[semitones].replace(/^m/, 'min').replace(/^M/, 'Maj')
    filename = "interval-#{long_interval_name}-study-sheet.pdf"
    fs.writeFile build_directory + filename, canvas.toBuffer()

intervals_book = (pages) ->
  for _, semitones in intervals
    make_interval_sheet semitones, true
    break if pages
    ctx.addPage()
  filename = "Fretboard Intervals.pdf"
  fs.writeFile build_directory + filename, canvas.toBuffer()

# intervals_from_note_sheets()
# for _, semitones in intervals
#   make_interval_sheet semitones

# intervals_book()

# intervals_from_root_book()

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
    draw_page ctx, (draw_cell) ->
      ctx.save()
      ctx.translate (i % cols) * cell_width, header_height + Math.floor(i / cols) * cell_height
      draw_cell()
      ctx.restore()
      i += 1

chord_page = (chord_name, abbr, intervals, outervals, pdf) ->
  outervals ||= []

  diagram_gutter = 20
  header_height = 40
  diagram_title_height = 30
  cols = 3
  rows = 4
  if draw_diagrams
    diagram_title_height = 35
    diagram_gutter = 10

  pitch_fingers = []
  fingerings_each (string, fret) ->
    pitch_number = note_number_at(string, fret) % 12
    pitch_fingers[pitch_number] = [string, fret]

  note_names = "E F F# G G# A A# B C C# D D#".split(/\s/)
  colors = ['red', 'blue', 'green', 'orange']
  other_colors = ['rgba(255,0,0 ,.1)', 'rgba(0,0,255, 0.1)', 'rgba(0,255,0, 0.1)', 'rgba(255,0,255, 0.1)']

  grid cols, rows, padded_fretboard_width + diagram_gutter, padded_fretboard_height + diagram_gutter, diagram_title_height, (ctx, draw_cell) ->
    ctx.font = '20px Impact'
    ctx.fillStyle = 'rgb(128, 128, 128)'
    ctx.fillText "#{chord_name} Chords", diagram_gutter / 2, header_height / 2

    for ix in [0...12]
      pitch_number = (ix * 5 + 7) % 12
      fingering = pitch_fingers[pitch_number]
      root_string = fingering[0]
      root_fret = fingering[1]
      draw_cell ->
        ctx.font = '20px Impact'
        ctx.font = '5pt Times' if draw_diagrams
        ctx.fillStyle = 'rgb(10,20,30)'
        ctx.fillText note_names[pitch_number] + abbr, h_gutter, -3
        fingerings = []
        # for semitones, si in outervals
        #   continue if semitones in intervals
        #   draw_intervals_from semitones, string, fret, other_colors[si]
        for semitones, si in intervals
          for {string, fret} in intervals_from(root_string, root_fret, semitones)
            fingerings.push string: string, fret: fret, color: colors[si]
        draw_fingerboard fingerings

# chord_page 'Major', [0, 4, 7]

book = (filename, draw_book) ->
  pdf = true
  mode = 'draw'
  draw_book (draw_page) ->
    draw_page()
    ctx.addPage()
  fs.writeFile build_directory + filename, canvas.toBuffer()

chord_book = ->
  chords = [
    {name: 'Major', abbr: '', offsets: [0, 4, 7], relative: [0, 3, 7]},
    {name: 'Minor', abbr: 'm', offsets: [0, 3, 7], relative: [0, 4, 7]},
    {name: 'Aug', abbr: '+', offsets: [0, 4, 8], relative: [0, 4, 7]},
    {name: 'Dim', abbr: '°', offsets: [0, 3, 6], relative: [0, 3, 7]},
    {name: 'Sus2', abbr: 'sus2', offsets: [0, 2, 7], relative: [0, 4, 7]},
    {name: 'Sus4', abbr: 'sus4', offsets: [0, 5, 7], relative: [0, 4, 7]},
    {name: 'Dom 7th', abbr: '7', offsets: [0, 4, 7, 10]},
    {name: 'Major 7th', abbr: 'maj7', offsets: [0, 4, 7, 11]},
    {name: 'Minor 7th', abbr: 'min7', offsets: [0, 3, 7, 10], relative: [0, 4, 7, 10]},
    {name: 'Dim 7th', abbr: '°7', offsets: [0, 3, 6, 9]},
    {name: 'Dom 7 b5', abbr: '7b5', offsets: [0, 4, 6, 10]},
    {name: 'Min 7th b5', abbr: 'm7b5', offsets: [0, 3, 6, 10]},
    # {name: 'Aug 7th', abbr: '7aug', offsets: [0, 4, 8, 10]},
    {name: 'Dim Maj 7th', abbr: '°maj7', offsets: [0, 3, 6, 11]},
    {name: 'Min Maj 7th', abbr: 'min-maj7', offsets: [0, 3, 7, 11]},
    # {name: '6th', abbr: '6', offsets: [0, 4, 7, 9]},
  ]
  book "Combined Fretboard Chords.pdf", (page) ->
    for {name, abbr, offsets, relative} in chords
      page -> chord_page name, abbr, offsets, relative

chord_book()
