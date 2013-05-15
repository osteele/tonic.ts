_ = require('underscore')

FretboardLogic = require('../index')

{Chords, NoteNames, compute_chord_name} = FretboardLogic.theory
{best_fingering_for, finger_positions_on_chord} = FretboardLogic.logic.fingering

Layout = FretboardLogic.utils.layout
{with_book, with_page, draw_title, with_graphics_context} = Layout

{ChordDegreeColors} = require('./books')
draw_pitch_diagram = require('./pitch_diagram').draw
{
  defaultStyle: ChordDiagramStyle
  draw: draw_chord_diagram
} = FretboardLogic.drawing.chord_diagram

chord_shape_flipbook_page = (chord, root, options={}) ->
  {bend} = options

  with_page width: 640, height: 480, ->
    draw_title "#{chord.name} Chord Shapes"
    , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
    , x: 0, y: 0, gravity: 'top'

    with_graphics_context (ctx) ->
      ctx.translate 285, 20
      ctx.scale 0.85,0.85
      draw_pitch_diagram ctx
      , (pc + bend for pc in chord.pitch_classes)
      , pitch_colors: ChordDegreeColors
      , pitch_names: do (names=NoteNames) -> names[root..].concat(names[...root])

    chord_name = compute_chord_name root, chord

    # draw_title chord_name
    # , font: '10pt Times', fillStyle: 'rgb(10,20,30)'
    # , x: 0, y: -3

    positions = finger_positions_on_chord(chord, root)
    position.color = ChordDegreeColors[position.degree_index] for position in positions
    with_graphics_context (ctx) ->
      ctx.translate 0, 50
      draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height

chord_shape_flipbook = (options={}) ->
  {quick} = options
  chord = Chords[0]

  animation_options =
    bend_step: 1/20
    drop_step_size: 2
  if quick
    _.extend animation_options,
      bend_step: 1/2
      drop_step_size: 20

  with_book "Chord Shape Animation", (book) ->
    root = 0
    bend = 0
    diagrams = []
    newest_chord_diagram = null
    while true
      if newest_chord_diagram and not newest_chord_diagram.has_dropped()
        newest_chord_diagram.translate 0, animation_options.drop_step_size
        for diagram in diagrams when diagram != newest_chord_diagram
          diagram.translate animation_options.drop_step_size * 1/4, 0
      else
        bend += animation_options.bend_step
        [root, bend] = [root + 1, 0] if bend >= 1.0
        break if root >= 12
        if bend == 0
          do (x=0, y=0) ->
            r = root
            chord_name = compute_chord_name root, chord
            fingering = best_fingering_for(chord, root)
            newest_chord_diagram =
              translate: (dx, dy) -> x += dx; y += dy
              has_dropped: -> y >= 300
              draw: ->
                with_graphics_context (ctx) ->
                  ctx.translate x, y
                  draw_title chord_name, style: '20pt Times'
                  draw_chord_diagram ctx, fingering.positions, fingering.barres
            diagrams.push newest_chord_diagram
      book.add_page ->
        chord_shape_flipbook_page chord, root, bend: bend
        diagram.draw() for diagram in diagrams


module.exports = chord_shape_flipbook
