_ = require('underscore')

FretboardLogic = require('../index')

{Chords, NoteNames, compute_chord_name} = FretboardLogic.theory
{best_fingering_for, finger_positions_on_chord} = FretboardLogic.logic.fingering

Layout = FretboardLogic.utils.layout
{with_book, with_page, draw_title, with_graphics_context} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw
{
  defaultStyle: ChordDiagramStyle
  draw: draw_chord_diagram
} = FretboardLogic.drawing.chord_diagram

ease = (s, x0, x1) ->x0 + s * (x1 - x0)

easeAttr = (path, aname, s, defaultValue) ->
  return defaultValue unless path and aname of path[0]
  ease(s, path[0][aname], path[1][aname])

sprite_position_at = (sprite, t) ->
  s = Math.min(1, (t - sprite.t0) / (sprite.t1 - sprite.t0))
  s = Math.min(1, t - sprite.t0) unless 't1' of sprite
  {
    x: easeAttr(sprite.path, 'x', s, 0)
    y: easeAttr(sprite.path, 'y', s, 0)
  }

write_animation_frames = (options) ->
  {step_size, sprites, end_padding} = options
  step_size ||= 1
  t_end = Math.max(_.chain(sprites).pluck('t1').compact().value()...)
  t_end += (end_padding or 0)
  t = 0
  with_book (options.title || "animation frames"), (book) ->
    ctx = book.context
    while t < t_end
      book.add_page ->
        with_page width: 640, height: 480, ->
          current_sprites = (sprite for sprite in sprites when (sprite.t0 or 0) <= t < (sprite.t1 or t_end))
          for sprite in _.sortBy(current_sprites, (s) -> (s.z_index or 0))
            s = Math.min(1, (t - sprite.t0) / (sprite.t1 - sprite.t0))
            s = t - sprite.t0 unless sprite.t1
            {x, y} = sprite_position_at(sprite, t)
            with_graphics_context (ctx) ->
              ctx.translate x, y
              sprite.draw s
      t += step_size

with_animation_context = (options, cb) ->
  sprites = []

  cb
    make_sprite: (options, cb=null) ->
      [options, cb] = [{}, options] if _.isFunction(options) and not cb
      sprite = options
      sprites.push sprite
      cb sprite if cb
      return sprite

  write_animation_frames
    title: options.title
    sprites: sprites
    step_size: options.step_size
    end_padding: options.end_padding


chord_shape_flipbook = (options={}) ->
  {quick, speed} = options
  speed ||= (if quick then 10 else 1)
  chord = Chords[0]
  title = "#{chord.name} Chord Shapes"

  with_animation_context
    title: "Chord Shape Animation Frames"
    step_size: speed / 20
    end_padding: 1
  , (animation) ->

    master_diagram = animation.make_sprite
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
        with_graphics_context (ctx) ->
          draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height

        pitch = (pitch + 1) % 12
        bend -= 1
        positions = finger_positions_on_chord(chord, pitch)
        with_graphics_context (ctx) ->
          draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height

    animation.make_sprite
      draw: ->
        draw_title title
        , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
        , x: 0, y: 0, gravity: 'top'

    for i in [0...12]
      do (pitch=i) ->
        t0 = pitch
        chord_name = compute_chord_name pitch, chord
        fingering = best_fingering_for(chord, pitch)
        pos = sprite_position_at master_diagram, t0
        [col, row] = [i % 4 , Math.floor(i / 4)]
        animation.make_sprite
          t0: t0
          path:
            0: pos
            1: {x: 50 + col * 130, y: pos.y + 100 + row * 115}
          draw: (dt) ->
            with_graphics_context (ctx) ->
              draw_title "#{chord_name} Major", font: '12pt Times', fillStyle: 'black', y: -3
              draw_chord_diagram ctx, fingering.positions, barres: fingering.barres

    # write_animation_frames
    #   title: "Chord Shape Animation Frames"
    #   sprites: sprites
    #   step_size: speed / 20
    #   end_padding: 1

module.exports = chord_shape_flipbook
