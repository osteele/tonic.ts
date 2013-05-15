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

  ease = (s, x0, x1) -> x0 + s * (x1 - x0)

  sprite_position_at = (sprite, t) ->
    s = Math.min(1, (t - sprite.t0) / (sprite.t1 - sprite.t0))
    s = Math.min(1, t - sprite.t0) unless 't1' of sprite
    x = y = 0
    if sprite.path
      x = ease(s, sprite.path[0].x, sprite.path[1].x)
      y = ease(s, sprite.path[0].y, sprite.path[1].y)
    {x, y}

  with_book "Chord Shape Animation", (book) ->
    ctx = book.context
    sprites = []
    master =
      t0: 0
      t1: 12
      z_index: 1
      path:
        0: {x: 0, y: 50}
        1: {x: 400, y: 50}
      draw: (s) ->
        s *= 12
        pitch = Math.floor(s)
        bend = s - pitch
        positions = finger_positions_on_chord(chord, pitch)
        position.color = ChordDegreeColors[position.degree_index] for position in positions
        with_graphics_context (ctx) ->
          draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height

        pitch = (pitch + 1) % 12
        bend -= 1
        positions = finger_positions_on_chord(chord, pitch)
        position.color = ChordDegreeColors[position.degree_index] for position in positions
        with_graphics_context (ctx) ->
          draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height
    sprites.push master

    for i in [0...12]
      do (pitch=i) ->
        t0 = pitch
        chord_name = compute_chord_name pitch, chord
        fingering = best_fingering_for(chord, pitch)
        pos = sprite_position_at(master, t0)
        [col, row] = [i % 4 , Math.floor(i / 4)]
        sprites.push
          t0: t0
          path:
            0: pos
            1: {x: col * 120, y: pos.y + 100 + row * 100}
          draw: (dt) ->
            with_graphics_context (ctx) ->
              draw_title chord_name, font: '15pt Times', color: 'black'
              position.color = ChordDegreeColors[position.degree_index] for position in fingering.positions
              draw_chord_diagram ctx, fingering.positions, barres: fingering.barres

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

          for sprite in _.sortBy(sprites, (s) -> (s.z_index or 0)) when sprite.t0 <= t < (sprite.t1 or t_end)
            s = Math.min(1, (t - sprite.t0) / (sprite.t1 - sprite.t0))
            s = t - sprite.t0 unless sprite.t1
            {x, y} = sprite_position_at(sprite, t)
            with_graphics_context (ctx) ->
              ctx.translate x, y
              sprite.draw s
      t += t_step

module.exports = chord_shape_flipbook