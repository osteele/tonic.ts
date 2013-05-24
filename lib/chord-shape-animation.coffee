_ = require 'underscore'
easings = require 'ease-component'

FretboardLogic = require '../index'

{Chords, NoteNames, compute_chord_name} = FretboardLogic.theory
{best_fingering_for, finger_positions_on_chord} = FretboardLogic.logic.fingering

Layout = FretboardLogic.utils.layout
{with_book, with_page, draw_title, with_graphics_context} = Layout

draw_pitch_diagram = require('./pitch_diagram').draw
{
  defaultStyle: ChordDiagramStyle
  draw: draw_chord_diagram
} = FretboardLogic.drawing.chord_diagram

ease = (s, x0, x1, method=null) ->
  s  = method.call easings, s if method
  x0 + s * (x1 - x0)

easeAttr = (path, aname, t, defaultValue) ->
  return defaultValue unless path
  parseKeyframeSelector = (k) ->
    return parseFloat(k) / 100 if k.match(/^(.+)%$/)
    {'from': 0, 'to': 1}[k] or parseFloat(k)
  frames = ({s: parseKeyframeSelector(k), v: properties[aname], easing} \
    for k, {properties, easing} of path when aname of properties)
  frames.sort ({s:a}, {s:b}) -> a - b
  f1 = _.find frames, ({s}) -> t <= s
  f0 = _.find frames.reverse(), ({s}) -> s <= t
  return defaultValue unless f0 or f1
  return f0.v if t <= f0.s
  return f1.v if f1.s <= t
  s = (t - f0.s) / (f1.s - f0.s)
  ease s, f0.v, f1.v, f1.easing

# t is a time value. Find the sprite.path keyframes that bracket it,
# and interpolate between them.
sprite_position_at = (sprite, t) ->
  if 't1' of sprite
    s = Math.min(1, (t - sprite.t0) / (sprite.t1 - sprite.t0))
  else
    s = Math.min(1, t - sprite.t0)
  return {
    x: easeAttr(sprite.path, 'x', s, 0)
    y: easeAttr(sprite.path, 'y', s, 0)
  }

write_animation_frames = (options) ->
  defaults = {step_size: 1, end_padding: 0, title:  "animation frames"}
  {step_size, sprites, end_padding} = _.extend defaults, options
  t_end = Math.max _.chain(sprites).pluck('t1').compact().value()...
  t_end += end_padding
  with_book options.title, (book) ->
    t = 0
    while t < t_end
      book.add_page ->
        with_page width: 640, height: 480, ->
          current_sprites = _.filter sprites, (sprite) ->
            (sprite.t0 or 0) <= t < (sprite.t1 or t_end) and sprite.visible != false
          for sprite in _.sortBy(current_sprites, (s) -> (s.z_index or 0))
            s = Math.min 1, (t - sprite.t0) / (sprite.t1 - sprite.t0)
            s = t - sprite.t0 unless sprite.t1
            {x, y} = sprite_position_at sprite, t
            with_graphics_context (ctx) ->
              ctx.translate x, y
              sprite.draw ctx, s
      t += step_size

with_animation_context = (options, cb) ->
  sprites = []

  cb
    make_sprite: (options, cb=null) ->
      [options, cb] = [{}, options] if _.isFunction(options) and not cb
      sprite =
        at: (t, properties, easing) ->
          @path ||= {}
          @path[t] = {properties, easing}
      sprite = _.extend sprite, options
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
  just_one = false

  with_animation_context
    title: "Chord Shape Animation Frames"
    step_size: speed / 20
    end_padding: 1
  , (animation) ->

    master_diagram = animation.make_sprite
      name: "master"
      t0: 0
      t1: 13
      z_index: 1
      visible: not just_one
      draw: (ctx, s) ->
        s *= 12
        pitch = Math.floor s
        pitch = Math.min 11, pitch
        bend = s - pitch
        positions = finger_positions_on_chord chord, pitch
        draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height

        pitch = (pitch + 1) % 12
        bend -= 1
        positions = finger_positions_on_chord chord, pitch
        draw_chord_diagram ctx, positions, dy: bend * ChordDiagramStyle.fret_height

      , (sprite) ->
        sprite.at 0, x: 0, y: 50
        sprite.at 1, x: 400, y: 50

    animation.make_sprite
      visible: not just_one
      draw: ->
        draw_title title
        , font: '20px Impact', fillStyle: 'rgb(128, 128, 128)'
        , gravity: 'top'

    [0...12].forEach (i) ->
      return if i > 0 and just_one
      t0 = pitch = i
      chord_name = compute_chord_name pitch, chord
      name = "#{chord_name} Major"
      fingering = best_fingering_for chord, pitch
      pos = sprite_position_at master_diagram, t0
      [col, row] = [i % 4 , Math.floor(i / 4)]

      animation.make_sprite
        name: name
        t0: t0
        draw: (ctx, dt) ->
          draw_title name, font: '12pt Times', fillStyle: 'black', y: -3
          draw_chord_diagram ctx, fingering.positions, barres: fingering.barres

      , (sprite) ->
        sprite.at 0, pos
        sprite.at 0.5, pos
        sprite.at 1
        , {x: 50 + col * 130, y: pos.y + 100 + row * 115}
        , easings.inCube

module.exports = chord_shape_flipbook
