{Interval, IntervalNames, Pitch, PitchClass} = require './pitches'

#
# ChordClasses
#

ChordNameRE = /^([a-gA-G],*'*[#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/
InversionNames = 'acd'.split(/./)

# An instance of ChordClass represents the intervals of the chord,
# without the root. For example, Dom7. It represents the quality, suspensions, and additions.
class ChordClass
  constructor: ({@name, @fullName, @abbrs, @intervals}) ->
    @abbr = @abbrs[0]

  at: (root) ->
    new Chord {chordClass: this, root}

  @fromIntervals: (intervals) ->
    semitones = (interval.semitones for interval in intervals)
    chordClass = ChordClasses[semitones.sort((a, b) -> a > b)]
    throw new Error("Couldn't find chord class with intervals #{intervals}") unless chordClass
    return chordClass

  @fromString: (name) ->
    return chord if chord = ChordClasses[name]
    throw new Error("“#{name}” is not a chord name")


# A chord may be:
# - a torsor (e.g. Major)
# - a scale degree (e.g. I)
# - a tonicized scale (e.g. C Major)
class Chord
  constructor: ({@chordClass, @root, @inversion}) ->
    @root = Pitch.fromString(@root) if typeof @root == 'string'

    @name = "#{@root.toString()} #{@chordClass.name}"
    @fullName = "#{@root.toString()} #{@chordClass.fullName}"
    @abbrs = ("#{@root.toString()} #{abbr}".replace(/\s+$/, '') for abbr in @chordClass.abbrs)
    @abbr = @abbrs[0]
    @intervals = @chordClass.intervals
    @pitches = (@root.toPitch().transposeBy(interval) for interval in @chordClass.intervals)

    # degrees = (1 + 2 * pitchClass.semitones for pitchClass in [0..@pitchClasses.length])
    # degrees[1] = {'Sus2':2, 'Sus4':4}[@name] || degrees[1]
    # degrees[3] = 6 if @name.match /6/

    if @inversion
      @intervals = rotateArray(@intervals, @inversion)
      @pitches = rotateArray(@pitches, @inversion)
      # @pitchClasses = rotateArray(@pitchClasses, @inversion)

    # @components = for interval, index in intervals
    #   semitones = interval.semitones
    #   name = IntervalNames[semitones]
    #   degree = degrees[index]
    #   if semitones == 0
    #     name = 'R'
    #   else unless Number(name.match(/\d+/)?[0]) == degree
    #     name = "A#{degree}" if Number(IntervalNames[semitones - 1].match(/\d+/)?[0]) == degree
    #     name = "d#{degree}" if Number(IntervalNames[semitones + 1].match(/\d+/)?[0]) == degree
    #   name

  _clone: (extend) ->
    attrs =
      inversion: @inversion
      chordClass: @chordClass
      root: @root
    attrs[key] = value for key, value of extend
    new Chord(attrs)

  # at: (root) ->
  #   @_clone root: root

  # degreeName: (degreeIndex) ->
  #   @components[degreeIndex]

  # enharmonicizeTo: (scale) ->
  #   @_clone root: @root.enharmonicizeTo(scale)

  invert: (inversion) ->
    unless typeof inverson == 'number'
      throw new Error("Unknown inversion “#{inversion}”") unless inversion in InversionNames
      inversion = 1 + InversionNames.indexOf(inversion)
    @_clone inversion: inversion

  @fromRomanNumeral: (name, scale) ->
    chordFromRomanNumeral(name, scale)

  @fromString: (name) ->
    unless match = name.match(ChordNameRE)
      throw new Error("“#{name}” is not a chord name")
    [rootName, className] = match[1...]
    className or= 'Major'
    chordClass = ChordClass.fromString(className)
    return chordClass.at(Pitch.fromString(rootName)) if rootName

  @fromPitches: (pitches) ->
    root = pitches[0]
    intervals = (Interval.between(root, pitch) for pitch in pitches)
    ChordClass.fromIntervals(intervals).at(root)

ChordClasses = [
  {name: 'Major', abbrs: ['', 'M'], intervals: '047'},
  {name: 'Minor', abbrs: ['m'], intervals: '037'},
  {name: 'Augmented', abbrs: ['+', 'aug'], intervals: '048'},
  {name: 'Diminished', abbrs: ['°', 'dim'], intervals: '036'},
  {name: 'Sus2', abbrs: ['sus2'], intervals: '027'},
  {name: 'Sus4', abbrs: ['sus4'], intervals: '057'},
  {name: 'Dominant 7th', abbrs: ['7', 'dom7'], intervals: '047t'},
  {name: 'Augmented 7th', abbrs: ['+7', '7aug'], intervals: '048t'},
  {name: 'Diminished 7th', abbrs: ['°7', 'dim7'], intervals: '0369'},
  {name: 'Major 7th', abbrs: ['maj7'], intervals: '047e'},
  {name: 'Minor 7th', abbrs: ['min7'], intervals: '037t'},
  {name: 'Dominant 7b5', abbrs: ['7b5'], intervals: '046t'},
  # following is also half-diminished 7th
  {name: 'Minor 7th b5', abbrs: ['ø', 'Ø', 'm7b5'], intervals: '036t'},
  {name: 'Diminished Maj 7th', abbrs: ['°Maj7'], intervals: '036e'},
  {name: 'Minor-Major 7th', abbrs: ['min/maj7', 'min(maj7)'], intervals: '037e'},
  {name: '6th', abbrs: ['6', 'M6', 'M6', 'maj6'], intervals: '0479'},
  {name: 'Minor 6th', abbrs: ['m6', 'min6'], intervals: '0379'},
].map ({name, abbr, abbrs, intervals}) ->
  fullName = name
  name = name
    .replace(/Major(?!$)/, 'Maj')
    .replace(/Minor(?!$)/, 'Min')
    .replace('Dominant', 'Dom')
    .replace('Diminished', 'Dim')
  intervals = intervals.match(/./g).map (c) ->
    semitones = {'t':10, 'e':11}[c] ? Number(c)
    Interval.fromSemitones(semitones)
  new ChordClass {name, fullName, abbr, abbrs, intervals}

# `ChordClasses` is also indexed by name, abbreviation, and pitch classes
do ->
  for chordClass in ChordClasses
    {name, fullName, abbrs} = chordClass
    ChordClasses[key] = chordClass for key in [name, fullName].concat(abbrs)
    ChordClasses[interval.semitones for interval in chordClass.intervals] = chordClass


#
# Chord Progressions
#

ChordRomanNumerals = 'I II III IV V VI VII'.split(/\s+/)

rotateArray = (array, n) ->
  array[n...].concat array[...n]

RomanNumeralModifiers =
  '+': 'aug'
  '°': 'dim'
  '6': 'maj6'
  '7': 'dom7'
  '+7': '+7'
  '°7': '°7'
  'ø7': 'ø7'

chordFromRomanNumeral = (name, scale) ->
  console.log 'from', name, scale
  throw new Error("“#{name}” is not a chord roman numeral") unless match = name.match(/^(♭?)(i+v?|vi*)(.*?)([acd]?)$/i)
  throw new Error("requires a scale with a tonic") unless scale.tonic?
  [accidental, romanNumeral, modifiers, inversion] = match[1..]
  degree = ChordRomanNumerals.indexOf(romanNumeral.toUpperCase())
  throw new Error("Not a chord name") unless degree >= 0
  chordType = switch
    when romanNumeral == romanNumeral.toUpperCase()
      'Major'
    when romanNumeral == romanNumeral.toLowerCase()
      'Minor'
    else
      throw new Error("Roman numeral chords can't be mixed case in “#{romanNumeral}”")
  if modifiers
    # throw new Error("Unimplemented: mixing minor chords with chord modifiers") unless chordType == 'Major'
    chordType = RomanNumeralModifiers[modifiers]
    throw new Error("unknown chord modifier “#{modifiers}”") unless chordType
  # TODO 9, 13, sharp, natural
  chord = Chord.fromString(chordType).at(scale.pitches[degree])
  chord = chord.invert(inversion) if inversion
  return chord



#
# Exports
#

module.exports = {
  ChordClass
  ChordClasses
  Chord
}
