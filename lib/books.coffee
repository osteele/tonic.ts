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

  draw: draw_chord_diagram
  width: chord_diagram_width
  height: chord_diagram_height
} = require('./chord_diagram')

{
  draw: draw_fretboard
  height: padded_fretboard_height
  width: padded_fretboard_width
} = require('./fretboard_diagram')

Layout = require('./layout')
{
  PaperSizes
  erase_background
  draw_text
  with_graphics_context
  save_canvas_to_png
  with_grid
  with_book
} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw
draw_harmonic_table = require('./harmonic_table').draw

{chord_shape_fragments} = require './chord-fragment-book'

CC_LICENSE_TEXT = "This work is licensed under a Creative Commons Attribution 3.0 United States License."

draw_license_footer = (page) ->
  text = "©2013 by Oliver Steele. " + CC_LICENSE_TEXT
  draw_text text
  , font: '4pt Times'
  , fillStyle: 'black'
  , y: page.height - page.top_margin
  , gravity: 'botLeft'



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
        intervals_from_position_page finger_position
  else
    with_book "Fretboard Intervals", pages: pages, (book) ->
      for __, semitones in Intervals
        intervals_page semitones


#
# Chord Lattice Diagrams
#

harmonic_table_chords = () ->
  r = 20
  with_book "Harmonic Table", size: PaperSizes.letter, (book) ->
    with_grid cols: 6, rows: 4
    , cell_width: 80
    , cell_height: 80 + 40
    , header_height: 140
    , (grid) ->

      with_graphics_context (ctx) ->
        ctx.translate 100, -130
        grid.add_cell ->
          draw_harmonic_table [0...12], radius: 50, label_cells: true, center: true, fill_cells: true

      if false
        intervals = [7, 4, 3, 2, 1]
        interval_sets = [intervals]
        interval_sets.push (12 - interval for interval in intervals)
        interval_sets[1].push 6
        for intervals in interval_sets
          grid.start_row()
          for semitones in intervals
            continue if semitones == 0
            interval_name = Intervals[semitones]
            grid.add_cell ->
              draw_text interval_name
              , font: '12px Times', fillStyle: 'black'
              , x: 80 / 2, gravity: 'center'
              draw_harmonic_table [semitones], radius: r, label_cells: true

      grid.start_row()
      for chord in Chords
        grid.add_cell ->
          draw_text chord.name
          , font: '12px Times', fillStyle: 'black'
          , x: 80 / 2, gravity: 'center'
          draw_harmonic_table chord.pitch_classes, radius: r

mul_mat_col = (m, col) ->
  for row in m
    (x * col[j] for x, j in row).reduce (a, b) -> a + b

xyz2rgb = do ->
  m = [
    [3.2406, -1.5372, -0.4986]
    [-0.9689, 1.8758, 0.0415]
    [0.0557, -0.2040, 1.0570]
  ]
  f = (c) ->
    if c < 0.0031308 then 12.92 * c else 1.055 * Math.pow(c, 1/2.4) - 0.055
  ({x, y, z}) ->
    [r, g, b] = mul_mat_col(m, [x, y, z]).map f
    {r, g, b}

lab2rgb = do ->
  k1 = 6/29
  k2 = 4/29
  k3 = 3 * Math.pow(k1, 2)
  s = [0.95047, 1.00000, 1.08883]
  f = (t) ->
    if t < k1 then k3 * (t - k2) else Math.pow(t, 3)
  ({l, a, b}) ->
    y = (l + 16) / 116
    x = y + a / 500
    z = y - b / 200
    [x, y, z] = (s[i] * f(t) for t, i in [x, y, z])
    xyz2rgb {x, y, z}

pitch_color_sampler = () ->
  Color = require("color")

  labcolor = (x, y) ->
    x = 1 + Math.sin(2 * Math.PI * x) / 2
    y = 1 + Math.sin(2 * Math.PI * y) / 2
    lab2rgb {l: 1, a: .2 + .2 * x, b: .3 + .4 * y}

  rescale_rgb = (rgbs) ->
    for field in ['r', 'g', 'b']
      cs = _.pluck(rgbs, field)
      min = Math.min cs...
      max = Math.max cs...
      rgb[field] = Math.floor 255 * (rgb[field] - min) / (max - min) for rgb in rgbs

  do ->
    rows = 150
    cell_width = 800 / rows
    with_book "Color Sampler", size: {width: cell_width * rows + 20, height: cell_width * rows + 20}, (book) ->
      cmap = {}
      for i in [0...rows]
        for j in [0...rows]
          cmap["#{i},#{j}"] = labcolor i / (rows - 1), j / (rows - 1)
      rescale_rgb _.values(cmap)

      book.with_page (page) ->
        ctx = page.context
        for k, color of cmap
          [i, j] = k.split(',').map (s) -> Number s
          ctx.fillStyle = Color(color).rgbString()
          x = i * cell_width
          y = j * cell_width
          ctx.fillRect x, y, cell_width + 3, cell_width + 3
    # return

  with_book "Pitch Color Sampler", size: PaperSizes.letter, (book) ->
    with_grid cols: 3, rows: 4
    , cell_width: 160
    , cell_height: 250
    , header_height: 10
    , (grid) ->

      intervals = [0...12]
      colorize = (fn) ->
        colors = (fn[i] or 'white' for i in intervals) unless _.isFunction(fn)
        colors ||=
          for n in intervals
            m3 = Math.floor(((3 * n) % 12) / 3) / 2
            m4 = Math.floor(((4 * n) % 12) / 3) / 3
            m5 = Math.floor(((5 * n + 10) % 12) / 3) / 3
            fn({n, m3, m4, m5}).rgbString()
        grid.add_cell ->
          with_graphics_context (ctx) ->
            ctx.translate 60, 50
            ctx.scale 3, 3
            draw_pitch_diagram ctx, intervals, pitch_colors: colors
          with_graphics_context (ctx) ->
            ctx.translate 0, 120
            ctx.scale 1/2, 1/2
            draw_harmonic_table intervals, label_cells: true, fill_cells: true, interval_class_colors: colors

      # colorize ({n}) -> Color {h: 360 * n / 12, s: 100, v: 100}

      # colorize
      #    0: 'red'
      #    5: 'red'
      #    9: 'red'
      #    # 11: 'blue'
      #    # 5: 'purple'
      #    # 9: 'purple'
      #    10: 'purple'
      #    7: 'orange'
      #    2: 'orange'

      rgbs = [0...12].map (n) ->
        m3 = (3 * n % 12 + .5) / 12
        m4 = (4 * n % 12 + .5) / 12
        console.info n, m3, m4
        labcolor m4, m3
      rescale_rgb rgbs

      colorize ({n}) -> Color rgbs[n]
      colorize ({n}) -> Color {h: 360 * ((5 * n + 1) % 12) / 12, s: 100, v: 100}
      colorize ({n}) -> Color {h: 360 * ((7 * n + 1) % 12) / 12, s: 100, v: 100}
      colorize ({m3, m4, m5}) -> Color {h: 360 * 3 / 4 * m5, s: 100, v: 100}
      colorize ({m3, m4, m5}) -> Color {h: 360 * 3 / 4 * m4, s: 100, v: 100}
      colorize ({m3, m4, m5}) -> Color {h: 360 * 2 / 3 * m3, s: 100, v: 100}
      colorize ({m3, m4, m5}) -> Color {h: 360 * 3 / 4 * m5, s: 50 + 50 * m3, v: 100}
      colorize ({m3, m4, m5}) -> Color {h: 360 * 3 / 4 * m5, s: 50 + 50 * m4, v: 100}
      colorize ({m3, m4, m5}) -> Color {r: 255 * m5, g: 255 * m3, b: 255 * m4}
      colorize ({m3, m4, m5}) ->
        Color
          r: 255 * (1 + Math.cos(2 * Math.PI * m5)) / 2
          g: 255 * (1 + Math.cos(2 * Math.PI * m3)) / 3
          b: 255 * (1 + Math.cos(2 * Math.PI * m4)) / 3



#
# Chord Fingerings
#

chord_fingerings_page = (chord) ->
  fingerings = fingerings_for(chord)
  Layout.filename "#{chord.name} Fingerings"

  with_grid cols: 10, rows: 10
  , cell_width: chord_diagram_width + 10
  , cell_height: chord_diagram_height + 5
  , header_height: 40
  , (grid) ->
    draw_text "#{chord.name} Fingerings"
    , x: 0, y: 20
    , font: '25px Impact', fillStyle: 'black'
    for fingering in fingerings
      grid.add_cell ->
        draw_chord_diagram grid.context, fingering.positions, barres: fingering.barres

chord_page = (chord, options={}) ->
  {best_fingering} = options

  with_grid cols: 4, rows: 3
  , cell_width: chord_diagram_width
  , cell_height: chord_diagram_height
  , gutter_height: 20
  , header_height: 40
  , (grid) ->

    draw_text "#{chord.name} Chords"
    , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: 0, y: 0, gravity: 'topLeft'

    with_graphics_context (ctx) ->
      ctx.translate 285, 20
      ctx.scale 0.85, 0.85
      draw_pitch_diagram ctx, chord.pitch_classes

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
      chord_page chord, options


#
# Exports
#

module.exports = {
  chord_book
  chord_fingerings_page
  harmonic_table_chords
  chord_shape_fragments
  draw_license_footer
  intervals_book
  pitch_color_sampler
}
