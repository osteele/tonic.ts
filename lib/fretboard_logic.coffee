util = require 'util'
_ = require 'underscore'

{interval_class_between} = require('./theory')

{
  FretNumbers
  OpenStringPitches
  StringNumbers
  fretboard_positions_each
  pitch_number_for_position
} = require('./fretboard_model')

Function::define ||= (name, desc) ->
  Object.defineProperty @prototype, name, desc

Function::cached_getter ||= (name, fn) ->
  Object.defineProperty @prototype, name, get: ->
    cache = @_getter_cache ||= {}
    return cache[name] if name of cache
    cache[name] = fn.call(this)

class Fingering
  constructor: ({@positions, @chord, @barres}) ->
    @positions.sort (a, b) -> a.string - b.string

  @cached_getter 'fretstring', ->
    fret_vector = (-1 for s in StringNumbers)
    fret_vector[string] = fret for {string, fret} in @positions
    ((if x >= 0 then x else 'x') for x in fret_vector).join('')

  @cached_getter 'inversion', ->
    @chord.pitch_classes.indexOf interval_class_between(@chord.root, pitch_number_for_position(@positions[0]))

find_barres = (positions) ->
  fret_rows = for fn in FretNumbers
    (for sn in StringNumbers
      if _.find(positions, (pos)-> pos.string == sn and pos.fret > fn)
        '.'
      else if _.find(positions, (pos)-> pos.string == sn and pos.fret < fn)
        '-'
      else if _.find(positions, (pos) -> pos.string == sn and pos.fret == fn)
        'x'
      else
        ' ').join('')
  barres = []
  for fp, fn in fret_rows
    continue if fn == 0
    m = fp.match(/^[^x]*(x[\.x]+x\.*)$/)
    continue unless m
    barres.push
      fret: fn
      string: m[0].length - m[1].length
      string_count: m[1].length
      subsumption_count: m[1].match(/x/g).length
  barres

find_barre_sets = (positions) ->
  powerset = (xs) ->
    return [[]] unless xs.length
    [x, xs...] = xs
    tail = powerset xs
    tail.concat([x].concat(ys) for ys in tail)
  barres = find_barres positions
  return powerset barres

finger_positions_on_chord = (chord) ->
  positions = []
  fretboard_positions_each (pos) ->
    interval_class = interval_class_between(chord.root, pitch_number_for_position(pos))
    degree_index = chord.pitch_classes.indexOf(interval_class)
    positions.push {string: pos.string, fret: pos.fret, degree_index} if degree_index >= 0
  positions

# TODO add options for strumming vs. fingerstyle; muting; span
fingerings_for = (chord, options={}) ->
  options = _.extend {filter: true}, options
  warn = false
  throw new Error("No root for #{util.inspect chord}") unless 'root' of chord


  #
  # Generate
  #
  positions = finger_positions_on_chord(chord)

  frets_per_string = do (strings=([] for __ in OpenStringPitches)) ->
    strings[position.string].push position for position in positions
    strings

  collect_fingering_positions = (string_frets) ->
    return [[]] unless string_frets.length
    frets = string_frets[0]
    following_finger_positions = collect_fingering_positions(string_frets[1..])
    return following_finger_positions.concat(([n].concat(right) \
      for n in frets for right in following_finger_positions)...)

  generate_fingerings = ->
    _.flatten(new Fingering {positions, chord, barres} \
      for barres in find_barre_sets(positions) \
      for positions in collect_fingering_positions(frets_per_string))

  chord_note_count = chord.pitch_classes.length


  #
  # Filters
  #

  count_distinct_notes = (fingering) ->
    _.chain(fingering.positions).pluck('degree_index').uniq().value().length

  has_all_notes = (fingering) ->
    return count_distinct_notes(fingering) == chord_note_count

  muted_medial_strings = (fingering) ->
    return fingering.fretstring.match(/\dx+\d/)

  muted_treble_strings = (fingering) ->
    return fingering.fretstring.match(/x$/)

  finger_count = (fingering) ->
    n = (pos for pos in fingering.positions when pos.fret > 0).length
    n -= barre.subsumption_count for barre in fingering.barres
    n

  four_fingers_or_fewer = (fingering) ->
    return finger_count(fingering) <= 4

  cmp = (fn) -> (x...) -> !fn(x...)

  # Construct the filter set

  filters = [
    {name: 'four fingers or fewer', filter: four_fingers_or_fewer}
  ]

  if options.filter
    filters.push name: 'has all chord notes', filter: has_all_notes

  unless options.fingerpicking
    filters.push name: 'no muted medial strings', filter: cmp(muted_medial_strings)
    filters.push name: 'no muted treble strings', filter: cmp(muted_treble_strings)

  # filter by all the filters in the list, except ignore those that wouldn't pass anything
  filter_fingerings = (fingerings) ->
    for {name, filter} in filters
      filtered = (fingering for fingering in fingerings when filter(fingering))
      unless filtered.length
        console.warn "#{chord_name}: no fingerings pass filter \"#{name}\"" if warn
        filtered = fingerings
      fingerings = filtered
    return fingerings


  #
  # Sort
  #

  high_note_count = (fingering) -> -fingering.positions.length

  is_root_position = (fingering) ->
    _(fingering.positions).sortBy((pos) -> pos.string)[0].degree_index == 0

  sorts = [
    {name: 'low finger count', key: (fingering) -> -fingering.positions.length}
    {name: 'high note count', key: high_note_count}
    {name: 'root position', key: cmp(is_root_position)}
  ]

  sort_fingerings = (fingerings) ->
    fingerings = _(fingerings).sortBy(key) for {key} in sorts
    return fingerings


  #
  # Generate, filter, and sort
  #

  chord_name = chord.name
  fingerings = generate_fingerings()
  fingerings = filter_fingerings fingerings
  fingerings = sort_fingerings fingerings

  return fingerings

best_fingering_for = (chord) ->
  return fingerings_for(chord)[0]

module.exports = {
  best_fingering_for
  fingerings_for
  finger_positions_on_chord
}
