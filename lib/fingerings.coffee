util = require 'util'
_ = require 'underscore'
{intervalClassDifference} = require './theory'
Instruments = require './instruments'

{
  FretNumbers
  fretboardPositionsEach
  pitchNumberForPosition
} = Instruments

require './utils'

# These are "fingerings", not "voicings", because they also include barre information.
class Fingering
  constructor: ({@positions, @chord, @barres, @instrument}) ->
    @positions.sort (a, b) -> a.string - b.string
    @properties = {}

  @cached_getter 'fretstring', ->
    fretArray = (-1 for s in @instrument.stringNumbers)
    fretArray[string] = fret for {string, fret} in @positions
    ((if x >= 0 then x else 'x') for x in fretArray).join('')

  # @cached_getter 'pitches', ->
  #   (@instrument.pitchAt(positions) for positions in @positions)

  # @cached_getter 'intervals', ->
  #   _.uniq(intervalClassDifference(@chord.rootPitch, pitchClass) for pitchClass in @.pitches)

  @cached_getter 'inversion', ->
    @chord.pitchClasses.indexOf intervalClassDifference(@chord.rootPitch, @instrument.pitchAt(@positions[0]))

# Returns an array of strings indexed by fret number. Each string
# has a character at each string position:
# 'x' = finger on this fret
# '.' = finger on a higher fret
# '-' = finger on a lower fret
# ' ' = no finger on that string
computeBarreArray = (instrument, positions) ->
  stringFrets = (null for s in instrument.stringNumbers)
  stringFrets[string] = fret for {string, fret} in positions
  barres = []
  for {fret: reference} in positions
    barres[reference] or= (for fret in stringFrets
      if fret == null
        ' '
      else if reference < fret
        '.'
      else if fret < reference
        '-'
      else if fret == reference
        'x').join('')
  barres

findBarres = (instrument, positions) ->
  barres = []
  for pattern, fret in computeBarreArray(instrument, positions)
    continue if fret == 0
    continue unless pattern
    match = pattern.match(/^[^x]*(x[\.x]+x\.*)$/)
    continue unless match
    run = match[1]
    barres.push
      fret: fret
      string: pattern.length - run.length
      stringCount: run.length
      fingerCount: run.match(/x/g).length
  barres

collectBarreSets = (instrument, positions) ->
  powerset = (xs) ->
    return [[]] unless xs.length
    [x, xs...] = xs
    tail = powerset xs
    tail.concat([x].concat(ys) for ys in tail)
  barres = findBarres(instrument, positions)
  return powerset(barres)

fingerPositionsOnChord = (chord, instrument) ->
  positions = []
  instrument.eachPosition (pos) ->
    intervalClass = intervalClassDifference chord.rootPitch, instrument.pitchAt(pos)
    degreeIndex = chord.pitchClasses.indexOf intervalClass
    positions.push {string: pos.string, fret: pos.fret, intervalClass, degreeIndex} if degreeIndex >= 0
  positions

# TODO add options for strumming vs. fingerstyle; muting; span
chordFingerings = (chord, instrument, options={}) ->
  options = _.extend {filter: true}, options
  warn = false
  throw new Error "No root for #{util.inspect chord}" unless chord.rootPitch?


  #
  # Generate
  #
  positions = fingerPositionsOnChord(chord, instrument)

  fretsPerString = do (strings=([] for __ in instrument.stringPitches)) ->
    strings[position.string].push position for position in positions
    strings

  collectFingeringPositions = (stringFrets) ->
    return [[]] unless stringFrets.length
    frets = stringFrets[0]
    followingFingerPositions = collectFingeringPositions(stringFrets[1..])
    return followingFingerPositions.concat(([n].concat(right) \
      for n in frets for right in followingFingerPositions)...)

  generateFingerings = ->
    fingerings = []
    for barres in collectBarreSets(instrument, positions)
      for positions in collectFingeringPositions(fretsPerString)
        fingerings.push new Fingering {positions, chord, barres, instrument}
    fingerings

  chordNoteCount = chord.pitchClasses.length


  #
  # Filters
  #

  countDistinctNotes = (fingering) ->
    # _.chain(fingering.positions).pluck('intervalClass').uniq().value().length
    pitches = []
    for {intervalClass} in fingering.positions
      pitches.push intervalClass unless intervalClass in pitches
    return pitches.length

  hasAllNotes = (fingering) ->
    return countDistinctNotes(fingering) == chordNoteCount

  mutedMedialStrings = (fingering) ->
    return fingering.fretstring.match(/\dx+\d/)

  mutedTrebleStrings = (fingering) ->
    return fingering.fretstring.match(/x$/)

  getFingerCount = (fingering) ->
    n = (pos for pos in fingering.positions when pos.fret > 0).length
    n -= barre.fingerCount - 1 for barre in fingering.barres
    n

  fourFingersOrFewer = (fingering) ->
    return getFingerCount(fingering) <= 4


  # Construct the filter set

  filters = []
  filters.push name: 'has all chord notes', select: hasAllNotes

  if options.filter
    filters.push name: 'four fingers or fewer', select: fourFingersOrFewer

  unless options.fingerpicking
    filters.push name: 'no muted medial strings', reject: mutedMedialStrings
    filters.push name: 'no muted treble strings', reject: mutedTrebleStrings

  # filter by all the filters in the list, except ignore those that wouldn't pass anything
  filterFingerings = (fingerings) ->
    for {name, select, reject} in filters
      filtered = fingerings
      select = ((x) -> not reject(x)) if reject
      filtered = filtered.filter(select) if select
      unless filtered.length
        console.warn "#{chord_name}: no fingerings pass filter \"#{name}\"" if warn
        filtered = fingerings
      fingerings = filtered
    return fingerings


  #
  # Sort
  #

  # FIXME count pitch classes, not sounded strings
  highNoteCount = (fingering) ->
    fingering.positions.length

  isRootPosition = (fingering) ->
    _(fingering.positions).sortBy((pos) -> pos.string)[0].degreeIndex == 0

  reverseSortKey = (fn) -> (a) -> -fn(a)

  # ordered list of preferences, from most to least important
  preferences = [
    {name: 'root position', key: isRootPosition}
    {name: 'high note count', key: highNoteCount}
    {name: 'avoid barres', key: reverseSortKey((fingering) -> fingering.barres.length)}
    {name: 'low finger count', key: reverseSortKey(getFingerCount)}
  ]

  sortFingerings = (fingerings) ->
    fingerings = _(fingerings).sortBy(key) for {key} in preferences.slice(0).reverse()
    fingerings.reverse()
    return fingerings


  #
  # Generate, filter, and sort
  #

  fingerings = generateFingerings()
  fingerings = filterFingerings(fingerings)
  fingerings = sortFingerings(fingerings)

  properties = {
    root: isRootPosition
    barres: (f) -> f.barres.length
    fingers: getFingerCount
    inverted: (f) -> not isRootPosition(f)
    skipping: /\dx\d/
    muting: /\dx/
    open: /0/
    triad: (f) -> fingering.positions.length == 3
    position: (f) -> _.min(_.pluck(fingering.positions, 'fret'))
  }
  for name, fn of properties
    for fingering in fingerings
      value = if fn instanceof RegExp then fn.test(fingering.fretstring) else fn(fingering)
      fingering.properties[name] = value if value


  return fingerings

bestFingeringFor = (chord, instrument) ->
  return chordFingerings(chord, instrument)[0]

module.exports = {
  bestFingeringFor
  chordFingerings
}
