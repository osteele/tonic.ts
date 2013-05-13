fs = require('fs')
_ = require 'underscore'
Canvas = require('canvas')

{Chords, NoteNames, Intervals, LongIntervalNames, compute_chord_name} =
  require('./lib/theory')
{FretCount, StringCount, fretboard_positions_each, intervals_from, pitch_number_for_position} =
  require('./lib/fretboard')
{ChordDiagramStyle, draw_chord_diagram, padded_chord_diagram_width, padded_chord_diagram_height} =
  require('./lib/chord_diagram')
{best_fingering_for, fingerings_for} = require('./lib/fingering')
{draw_fretboard, padded_fretboard_height, padded_fretboard_width} = require('./lib/fretboard_diagram')

#
# Drawing and Layout
#

{FretNumbers, StringNumbers} = require('./lib/fretboard')

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
  canvas = null
  ctx = null


#
# Specific Cards and Pages
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
        draw_fretboard ctx, positions

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

  grid {cols, rows
  , cell_width: padded_fretboard_width + canvas_gutter
  , cell_height: padded_fretboard_height + canvas_gutter
  , header_height: header_height
  }, (cell) ->
    title = LongIntervalNames[semitones] + " Intervals"
    ctx.font = '25px Impact'
    ctx.fillStyle = 'rgb(128, 128, 128)'
    ctx.fillText title, canvas_gutter / 2, 30

    fretboard_positions_each (finger_position) ->
      cell ->
        draw_fretboard ctx, intervals_from(finger_position, semitones)

intervals_book = ({by_root, pages}={}) ->
  if by_root
    book "Fretboard Intervals by Root", pages: pages, (page) ->
      fretboard_positions_each (finger_position) ->
        page -> intervals_from_position_page finger_position
  else
    book "Fretboard Intervals", pages: pages, (page) ->
      for __, semitones in Intervals
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
      cell -> draw_chord_diagram ctx, fingering.positions, barres: fingering.barres

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
  fretboard_positions_each (finger_position) ->
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
        draw_chord_diagram ctx, fingering.positions, barres: fingering.barres, dy: dy

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
  .command('all')
  .action (options) ->
    chord_flipbook()
    intervals_book by_root: true
    intervals_book by_root: false
    chord_book best_fingering: true
    chord_book best_fingering: false
    # FIXME this doesn't actually render in this context
    chord_fingerings_page Chords[6], 'F'

program
  .command('*')
  .action ->
    console.log 'Commands:'
    console.log '  chordbook'
    console.log '  fingerings'
    console.log '  intervals'
    console.log '  flipbook'

program.parse(process.argv)
