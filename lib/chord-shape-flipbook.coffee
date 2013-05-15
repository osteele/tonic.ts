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
    ctx = book.context
    sprites = []
    for pitch in [0...12]
      do (pitch=pitch) ->
        sprites.push
          t0: pitch
          t1: pitch + 1
          draw: (s) ->
            bend = s
            positions = finger_positions_on_chord(chord, pitch)
            position.color = ChordDegreeColors[position.degree_index] for position in positions
            with_graphics_context (ctx) ->
              ctx.translate 0, 50
              draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height
        chord_name = compute_chord_name pitch, chord
        fingering = best_fingering_for(chord, pitch)
        sprites.push
          t0: pitch
          draw: (dt) ->
            with_graphics_context (ctx) ->
              dx = 100 * Math.max(0, dt - 1)
              ctx.translate dx, 50 + 150 * Math.min(1, dt)
              draw_title chord_name, style: '20pt Times'
              draw_chord_diagram ctx, fingering.positions, fingering.barres
    t_end = Math.max(_.chain(sprites).pluck('t1').compact().value()...)
    t = 0
    t_step = 1/20
    t_step = .5 if options.quick
    while t < t_end
      book.add_page ->
        with_page width: 640, height: 480, ->
          draw_title "#{chord.name} Chord Shapes"
          , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
          , x: 0, y: 0, gravity: 'top'
          for sprite in sprites when sprite.t0 <= t < (sprite.t1 or t_end)
            sprite.draw(
              if sprite.t1
                (t - sprite.t0) / (sprite.t1 - sprite.t0)
              else
                t - sprite.t0
              )
      t += t_step

module.exports = chord_shape_flipbook
