util = require 'util'
_ = require 'underscore'
{getPitchClassName, intervalClassDifference} = require './theory'
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

  @cached_getter 'chordName', ->
    name = @chord.name
    name += " / #{getPitchClassName(@instrument.pitchAt(@positions[0]))}" if @inversion > 0
    return name

  # @cached_getter 'pitches', ->
  #   (@instrument.pitchAt(positions) for positions in @positions)

  # @cached_getter 'intervals', ->
  #   _.uniq(intervalClassDifference(@chord.rootPitch, pitchClass) for pitchClass in @.pitches)

  @cached_getter 'inversion', ->
    @chord.pitchClasses.indexOf intervalClassDifference(@chord.rootPitch, @instrument.pitchAt(@positions[0]))

  @cached_getter 'inversionLetter', ->
    return unless @inversion > 0
    return String.fromCharCode(96 + @inversion)


#
# Barres
#

powerset = (array) ->
  return [[]] unless array.length
  [x, xs...] = array
  tail = powerset(xs)
  return tail.concat([x].concat(ys) for ys in tail)

# Returns an array of strings indexed by fret number. Each string
# has a character at each string position:
# '=' = fretted at this fret
# '>' = fretted at a higher fret
# '<' = fretted at a lower fret, or open
# 'x' = muted
computeBarreCandidateStrings = (instrument, fretArray) ->
  codeStrings = []
  for referenceFret in fretArray
    continue unless typeof(referenceFret) == 'number'
    codeStrings[referenceFret] or= (for fret in fretArray
      if fret < referenceFret
        '<'
      else if fret > referenceFret
        '>'
      else if fret == referenceFret
        '='
      else
        'x').join('')
  return codeStrings

findBarres = (instrument, fretArray) ->
  barres = []
  for codeString, fret in computeBarreCandidateStrings(instrument, fretArray)
    continue if fret == 0
    continue unless codeString
    match = codeString.match(/(=[>=]+)/)
    continue unless match
    run = match[1]
    continue unless run.match(/\=/g).length > 1
    barres.push
      fret: fret
      firstString: match.index
      stringCount: run.length
      fingerReplacementCount: run.match(/\=/g).length
  return barres

collectBarreSets = (instrument, fretArray) ->
  barres = findBarres(instrument, fretArray)
  return powerset(barres)


#
# Fingerings
#

fingerPositionsOnChord = (chord, instrument) ->
  {rootPitch, pitchClasses} = chord
  positions = []
  instrument.eachFingerPosition (pos) ->
    intervalClass = intervalClassDifference rootPitch, instrument.pitchAt(pos)
    degreeIndex = pitchClasses.indexOf intervalClass
    positions.push pos if degreeIndex >= 0
  positions

# TODO add options for strumming vs. fingerstyle; muting; stretch
chordFingerings = (chord, instrument, options={}) ->
  options = _.extend {filter: true, allPositions: false}, options
  warn = false
  throw new Error "No root for #{util.inspect chord}" unless chord.rootPitch?


  #
  # Generate
  #

  fretsPerString =  ->
    positions = fingerPositionsOnChord(chord, instrument)
    positions = (pos for pos in positions when pos.fret <= 4) unless options.allPositions
    strings = ([null] for s in [0...instrument.stringCount])
    strings[string].push fret for {string, fret} in positions
    strings

  collectFingeringPositions = (fretCandidatesPerString) ->
    stringCount = fretCandidatesPerString.length
    positionSet = []
    fretArray = []
    fill = (s) ->
      if s == stringCount
        positionSet.push fretArray.slice()
      else
        for fret in fretCandidatesPerString[s]
          fretArray[s] = fret
          fill s + 1
    fill 0
    return positionSet

  containsAllChordPitches = (fretArray) ->
    pitches = []
    for fret, string in fretArray
      continue unless typeof(fret) is 'number'
      pitchClass = (instrument.pitchAt {fret, string}) % 12
      pitches.push pitchClass unless pitches.indexOf(pitchClass) >= 0
    return pitches.length == chord.pitchClasses.length

  maximumFretDistance = (fretArray) ->
    frets = (fret for fret in fretArray when typeof(fret) is 'number')
    # fretArray = (fret for fret in fretArray when fret > 0)
    return Math.max(frets...) - Math.min(frets...) <= 3

  generateFingerings = ->
    fingerings = []
    fretArrays = collectFingeringPositions(fretsPerString())
    fretArrays = fretArrays.filter(containsAllChordPitches)
    fretArrays = fretArrays.filter(maximumFretDistance)
    for fretArray in fretArrays
      positions = ({fret, string} for fret, string in fretArray when typeof(fret) is 'number')
      for pos in positions
        pos.intervalClass = intervalClassDifference chord.rootPitch, instrument.pitchAt(pos)
        pos.degreeIndex = chord.pitchClasses.indexOf pos.intervalClass
      sets = [[]]
      sets = collectBarreSets(instrument, fretArray) if positions.length > 4
      for barres in sets
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
    n -= barre.fingerReplacementCount - 1 for barre in fingering.barres
    n

  fourFingersOrFewer = (fingering) ->
    return getFingerCount(fingering) <= 4


  # Construct the filter set

  filters = []
  # filters.push name: 'has all chord notes', select: hasAllNotes

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
    inversion: (f) -> f.inversionLetter or ''
    # bass: /^\d{3}x*$/
    # treble: /^x*\d{3}$/
    skipping: /\dx+\d/
    muting: /\dx/
    open: /0/
    triad: ({positions}) -> positions.length == 3
    position: ({positions}) -> Math.max(_.min(_.pluck(positions, 'fret')) - 1, 0)
    strings: ({positions}) -> positions.length
  }
  for name, fn of properties
    for fingering in fingerings
      value = if fn instanceof RegExp then fn.test(fingering.fretstring) else fn(fingering)
      fingering.properties[name] = value


  return fingerings

bestFingeringFor = (chord, instrument) ->
  return chordFingerings(chord, instrument)[0]

module.exports = {
  bestFingeringFor
  chordFingerings
}
