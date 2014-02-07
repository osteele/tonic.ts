{Interval, IntervalNames, Pitch, PitchClass} = require './pitches'

#
# Chords
#

ChordNameRE = /^([a-gA-G],*'*[#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/
InversionNames = 'acd'.split(/./)

# A chord may be:
# - a torsor (e.g. Major)
# - a scale degree (e.g. I)
# - a tonicized scale (e.g. C Major)
class Chord
  constructor: ({@name, @fullName, @abbr, @abbrs, @pitchClasses, @root, @inversion}) ->
    @root = Pitch.fromString(@root) if typeof @root == 'string'
    @abbrs ?= [@abbr]
    @abbrs = @abbrs.split(/s/) if typeof @abbrs == 'string'
    @abbr ?= @abbrs[0]

    @intervals = (Interval.fromSemitones(semitones) for semitones in @pitchClasses)

    if @root?
      @name = "#{@root.toString()} #{@name}"
      @fullName = "#{@root.toString()} #{@fullName}"
      @abbr = "#{@root.toString()} #{@abbr}".replace(/\s+$/, '')
      @abbrs = ("#{@root.toString()} #{abbr}".replace(/\s+$/, '') for abbr in @abbrs)
      @pitches = (@root.toPitch().transposeBy(interval) for interval in @intervals)

    degrees = (1 + 2 * pitchClass.semitones for pitchClass in [0..@pitchClasses.length])
    degrees[1] = {'Sus2':2, 'Sus4':4}[@name] || degrees[1]
    degrees[3] = 6 if @name.match /6/

    if @inversion
      @intervals = rotateArray(@intervals, @inversion)
      @pitches = rotateArray(@pitches, @inversion)
      @pitchClasses = rotateArray(@pitchClasses, @inversion)

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
      name: @name
      abbrs: @abbrs
      fullName: @fullName
      inversion: @inversion
      pitchClasses: @pitchClasses
      root: @root
    attrs[key] = value for key, value of extend
    new Chord(attrs)

  at: (root) ->
    @_clone root: root

  # degreeName: (degreeIndex) ->
  #   @components[degreeIndex]

  enharmonicizeTo: (scale) ->
    @_clone root: @root.enharmonicizeTo(scale)

  invert: (inversion) ->
    unless typeof inverson == 'number'
      throw new Error("Unknown inversion “#{inversion}”") unless inversion in InversionNames
      inversion = 1 + 'acd'.indexOf(inversion)
    @_clone inversion: inversion

  @fromRomanNumeral: (name, scale) ->
    chordFromRomanNumeral(name, scale)

  @fromString: (name) ->
    return chord if chord = Chords[name]
    rootName = null
    [rootName, chordName] = match[1...] if match = name.match(ChordNameRE)
    chordName or= 'Major' if match
    throw new Error("“#{name}” is not a chord name") unless chord = Chords[chordName]
    chord = chord.at(Pitch.fromString(rootName)) if rootName
    return chord

  @fromPitches: (pitches) ->
    root = pitches[0]
    intervals = (Interval.between(root, pitch) for pitch in pitches)
    Chord.fromIntervals(intervals).at(root)

  @fromIntervals: (intervals) ->
    semitones = (interval.semitones for interval in intervals)
    chord = Chords[semitones.sort((a, b) -> a > b)]
    throw new Error("Couldn't find chord with intervals #{semitones}") unless chord
    return chord

Chords = [
  {name: 'Major', abbrs: ['', 'M'], pitchClasses: '047'},
  {name: 'Minor', abbr: 'm', pitchClasses: '037'},
  {name: 'Augmented', abbrs: ['+', 'aug'], pitchClasses: '048'},
  {name: 'Diminished', abbrs: ['°', 'dim'], pitchClasses: '036'},
  {name: 'Sus2', abbr: 'sus2', pitchClasses: '027'},
  {name: 'Sus4', abbr: 'sus4', pitchClasses: '057'},
  {name: 'Dominant 7th', abbrs: ['7', 'dom7'], pitchClasses: '047t'},
  {name: 'Augmented 7th', abbrs: ['+7', '7aug'], pitchClasses: '048t'},
  {name: 'Diminished 7th', abbrs: ['°7', 'dim7'], pitchClasses: '0369'},
  {name: 'Major 7th', abbr: 'maj7', pitchClasses: '047e'},
  {name: 'Minor 7th', abbr: 'min7', pitchClasses: '037t'},
  {name: 'Dominant 7b5', abbr: '7b5', pitchClasses: '046t'},
  # following is also half-diminished 7th
  {name: 'Minor 7th b5', abbrs: ['ø', 'Ø', 'm7b5'], pitchClasses: '036t'},
  {name: 'Diminished Maj 7th', abbr: '°Maj7', pitchClasses: '036e'},
  {name: 'Minor-Major 7th', abbrs: ['min/maj7', 'min(maj7)'], pitchClasses: '037e'},
  {name: '6th', abbrs: ['6', 'M6', 'M6', 'maj6'], pitchClasses: '0479'},
  {name: 'Minor 6th', abbrs: ['m6', 'min6'], pitchClasses: '0379'},
].map ({name, abbr, abbrs, pitchClasses}) ->
  fullName = name
  name = name
    .replace(/Major(?!$)/, 'Maj')
    .replace(/Minor(?!$)/, 'Min')
    .replace('Dominant', 'Dom')
    .replace('Diminished', 'Dim')
  abbrs ?= [abbr]
  abbr ?= abbrs[0]
  pitchClasses = pitchClasses.match(/./g).map (c) -> {'t':10, 'e':11}[c] ? Number(c)
  new Chord {name, fullName, abbr, abbrs, pitchClasses}

# `Chords` is also indexed by chord names and abbreviations, and by pitch classes
do ->
  for chord in Chords
    {name, fullName, abbrs} = chord
    Chords[key] = chord for key in [name, fullName].concat(abbrs)
    Chords[chord.pitchClasses] = chord


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
  Chord
  Chords
}
