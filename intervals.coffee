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
fretboard_width_with_gutter = 2 * v_gutter + fret_width * fret_count + fret_overhang
fretboard_height_with_gutter = 2 * h_gutter + (string_count - 1) * string_spacing

draw_diagrams = true
if draw_diagrams
  string_spacing = 6
  fret_height = 8
  fret_overhang = 0
  h_gutter = 5
  v_gutter = 5
  note_radius = 1
  fretboard_width_with_gutter = 2 * h_gutter + (string_count - 1) * string_spacing
  fretboard_height_with_gutter = 2 * v_gutter + fret_height * fret_count + fret_overhang

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
      ctx.moveTo v_gutter, y
      ctx.lineTo v_gutter + (string_count - 1) * string_spacing, y
      ctx.lineWidth = 3 if fret_number == 0
      ctx.stroke()
      ctx.lineWidth = 1

  draw_note = (string_number, fret_number, root, color) ->
    y = v_gutter + (fret_number - 1) * fret_height + fret_height / 2
    # y = v_gutter if fret_number == 0
    ctx.fillStyle = color or (if root then 'red' else 'white')
    ctx.strokeStyle = color or 'black'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc v_gutter + (6 - string_number) * string_spacing, y, note_radius, 0, 2 * Math.PI, false
    ctx.fill() if fret_number
    ctx.stroke()
    # ctx.fill() unless color and color.match(/rgba/)
    # ctx.strokeStyle = color if color and color.match(/rgba/)
    # ctx.stroke() if color and color.match(/rgba/)
    ctx.strokeStyle = 'black'


draw_fingerboard = ->
  draw_strings()
  draw_frets()

note_number_at = (string, fret) ->
  string_note_numbers[string - 1] + fret

positions_each = (fn) ->
  for string in strings
    for fret in frets
      fn string, fret

save_canvas_to_png = (canvas, fname) ->
  out = fs.createWriteStream(build_directory + fname)
  stream = canvas.pngStream()
  stream.on 'data', (chunk) -> out.write(chunk)
  stream.on 'end', () -> console.log "Saved #{fname}"

draw_intervals_from = (semitones, root_string, root_fret, color) ->
  root_note_number = note_number_at(root_string, root_fret)
  draw_note root_string, root_fret, true, color
  for string in strings
    for fret in frets
      continue if string == root_string and fret == root_fret
      continue unless (note_number_at(string, fret) - root_note_number + 120) % 12 == semitones
      draw_note string, fret, false, color

interval_cards = ->
  positions_each (string, fret) ->
    canvas = new Canvas(fretboard_width_with_gutter, fretboard_height_with_gutter)
    ctx = canvas.getContext('2d')
    erase_background()
    draw_fingerboard()
    draw_note string, fret
    filename = "#{string}-#{fret}.png"
    save_canvas_to_png canvas, filename

    for interval_name, semitones in intervals
      canvas = new Canvas(fretboard_width_with_gutter, fretboard_height_with_gutter)
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
  canvas_width = fretboard_width_with_gutter * 3 + canvas_gutter * 3
  canvas_height = (fretboard_height_with_gutter + header_height) * 4 + canvas_gutter * 3

  canvas = new Canvas(canvas_width, canvas_height, pdf and 'pdf') unless pdf and canvas
  ctx = canvas.getContext('2d')
  erase_background()

  for interval_name, semitones in intervals
    ix = (semitones + 11) % 12
    dx = (ix % 3) * (fretboard_width_with_gutter + canvas_gutter) + canvas_gutter / 2
    dy = Math.floor(ix / 3) * (header_height + fretboard_height_with_gutter + canvas_gutter)
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
  positions_each (string, fret) ->
    intervals_from_note_sheet string, fret

intervals_from_root_book = ->
  positions_each (string, fret) ->
    intervals_from_note_sheet string, fret, true
    ctx.addPage()
  filename = "Fretboard Intervals by Root.pdf"
  fs.writeFile build_directory + filename, canvas.toBuffer()

make_interval_sheet = (semitones, pdf) ->
  canvas_gutter = 20
  header_height = 40
  cols = fret_count + 1
  rows = (string_count - hidden_strings.length)
  canvas_width = fretboard_width_with_gutter * cols + canvas_gutter * cols
  canvas_height = header_height + fretboard_height_with_gutter * rows + canvas_gutter * rows

  canvas = new Canvas(canvas_width, canvas_height, pdf and 'pdf') unless pdf and canvas
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if pdf
  erase_background()

  canvas_label = long_intervals_names[semitones] + " Intervals"
  ctx.font = '30px Impact'
  ctx.fillStyle = 'rgb(128, 128, 128)'
  ctx.fillText canvas_label, canvas_gutter / 2, header_height

  positions_each (string, fret) ->
    return if hidden_strings.indexOf(string) >= 0
    row = string - 1
    row -= hidden_strings.length if show_hidden_strings and string > hidden_strings[0]
    dx = fret * (fretboard_width_with_gutter + canvas_gutter) + canvas_gutter / 2
    dy = header_height + row * (fretboard_height_with_gutter + canvas_gutter) + canvas_gutter / 2
    ctx.save()
    ctx.translate dx, dy
    draw_fingerboard()
    draw_intervals_from semitones, string, fret
    if show_hidden_strings
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.fillRect 0, v_gutter + 1.5 * string_spacing, fretboard_width_with_gutter, hidden_strings.length * string_spacing
      ctx.fillStyle = 'rgba(0,0,0,0.0125)'
      ctx.fillRect 0, v_gutter + 1.5 * string_spacing, fretboard_width_with_gutter, hidden_strings.length * string_spacing
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

chord_page = (title, intervals, outervals, pdf) ->
  outervals ||= []

  canvas_gutter = 20
  header_height = 40
  diagram_title_height = 30
  cols = 3
  rows = 4
  if draw_diagrams
    diagram_title_height = 15
    canvas_gutter = 2
  canvas_width = fretboard_width_with_gutter * cols + canvas_gutter * cols
  canvas_height = header_height + (fretboard_height_with_gutter + diagram_title_height) * rows + canvas_gutter * rows

  roots = []
  positions_each (string, fret) ->
    number = note_number_at(string, fret) % 12
    roots[number] = [string, fret]

  canvas = new Canvas(canvas_width, canvas_height, pdf and 'pdf') unless pdf and canvas
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if pdf
  erase_background()

  ctx.font = '20px Impact'
  ctx.fillStyle = 'rgb(128, 128, 128)'
  ctx.fillText "#{title} Chords", canvas_gutter / 2, header_height

  note_names = "E F F# G G# A A# B C C# D D#".split(/\s/)
  colors = ['red', 'blue', 'green', 'orange']
  other_colors = ['rgba(255,0,0 ,.1)', 'rgba(0,0,255, 0.1)', 'rgba(0,255,0, 0.1)', 'rgba(255,0,255, 0.1)']

  roots.map (note, ix) ->
    note_number = (ix * 5 + 7) % 12
    note = roots[note_number]
    string = note[0]
    fret = note[1]
    col = ix % cols
    row = Math.floor(ix / cols)
    dx = col * (fretboard_width_with_gutter + canvas_gutter) + canvas_gutter / 2
    dy = header_height + row * (fretboard_height_with_gutter + canvas_gutter + diagram_title_height) + canvas_gutter / 2
    ctx.save()
    ctx.translate dx, dy + diagram_title_height
    ctx.font = '20px Impact'
    ctx.font = '5pt Times' if draw_diagrams
    ctx.fillStyle = 'rgb(10,20,30)'
    ctx.fillText note_names[note_number] + ' ' + title, h_gutter, -3
    draw_fingerboard()
    for semitones, si in outervals
      continue if semitones in intervals
      draw_intervals_from semitones, string, fret, other_colors[si]
    for semitones, si in intervals
      draw_intervals_from semitones, string, fret, colors[si]
    ctx.restore()

  unless pdf
    filename = "test.pdf"
    fs.writeFile build_directory + filename, canvas.toBuffer()

# chord_page 'Major', [0, 4, 7]

chord_book = ->
  chords = [
    ['Major', [0, 4, 7], [0, 3, 7]],
    ['Minor', [0, 3, 7], [0, 4, 7]],
    ['Aug', [0, 4, 8], [0, 4, 7]],
    ['Dim', [0, 3, 6], [0, 3, 7]],
    ['7th', [0, 4, 7, 10]],
    ['Maj7', [0, 4, 7, 11]],
    ['Sus2', [0, 2, 7], [0, 4, 7]],
    ['Sus4', [0, 5, 7], [0, 4, 7]],
    ['Min7', [0, 3, 7, 10], [0, 4, 7, 10]],
    ['Dim7', [0, 3, 6, 9]],
    ['6th', [0, 4, 7, 9]],
  ]
  for chord in chords
    chord_page chord[0], chord[1], chord[2], true
    ctx.addPage()
  filename = "Combined Fretboard Chords.pdf"
  fs.writeFile build_directory + filename, canvas.toBuffer()

chord_book()
