{Interval, IntervalNames, Pitch, PitchClass,
    getPitchName, normalizePitchClass, parsePitchClass, pitchFromScientificNotation} =
  require './pitches'

#
# Chords
#

class Chord
  constructor: ({@name, @fullName, @abbr, @abbrs, @pitchClasses, @root}) ->
    @root = PitchClass.fromString(@root) if typeof @root == 'string'
    @abbrs ?= [@abbr]
    @abbrs = @abbrs.split(/s/) if typeof @abbrs == 'string'
    @abbr ?= @abbrs[0]

    if @root?
      @pitches = (@root.toPitch().transposeBy(pitchClass) for pitchClass in @pitchClasses)
      @name = "#{@root.toString()} #{@name}"
      @fullName = "#{@root.toString()} #{@fullName}"
      @abbr = "#{@root.toString()} #{@abbr}".replace(/\s+$/, '')
      @abbrs = ("#{@root.toString()} #{abbr}".replace(/\s+$/, '') for abbr in @abbrs)

    degrees = (1 + 2 * pitchClass.semitones for pitchClass in [0..@pitchClasses.length])
    degrees[1] = {'Sus2':2, 'Sus4':4}[@name] || degrees[1]
    degrees[3] = 6 if @name.match /6/

    @intervals = (Interval.fromSemitones(semitones) for semitones in @pitchClasses)

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

  at: (root) ->
    new Chord
      name: @name
      abbrs: @abbrs
      fullName: @fullName
      pitchClasses: @pitchClasses
      root: root

  # degreeName: (degreeIndex) ->
  #   @components[degreeIndex]

  enharmonicizeTo: (scale) ->
    @root = @root.enharmonicizeTo(scale)
    return this

  @fromString: (name) ->
    chord = Chords[name]
    return chord if chord
    rootName = null
    [rootName, chordName] = match[1...] if match = name.match(/^([a-gA-G][#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/)
    chordName or= 'Major'
    chord = Chords[chordName]
    throw new Error("#{name} is not a chord name") unless chord
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

Chord.progression = (tonic, chords) ->
  scale = [0, 2, 4, 5, 7, 9, 11]
  romanNumerals = 'I II III IV V VI VII'.split(/\s+/)
  tonic = name2midi(tonic) if typeof tonic == 'string'
  for name in chords.split(/[\s+\-]+/)
    cr = name.replace(/[♭67°ø\+bcd]/g, '')
    i = romanNumerals.indexOf(cr.toUpperCase())
    if i >= 0
      acc = 0
      acc = -1 if name.match /♭/
      chordRoot = midi2name(tonic + scale[i] + acc)
      chordType = "Major"
      chordType = "Minor" if cr == cr.toLowerCase()
      chordType = "aug" if name.match /\+/
      chordType = "dim" if name.match /°/
      chordType = "maj6" if name.match /6/
      chordType = "dom7" if name.match /7/
      chordType = "+7" if name.match /\+7/
      chordType = "°7" if name.match /°7/
      chordType = "ø7" if name.match /ø7/
      # TODO 9, 13, sharp, natural
      chord = Chord.find(chordType).at(chordRoot)
      chord.inversion = 1 if name.match /b/
      chord.inversion = 2 if name.match /c/
      chord.inversion = 3 if name.match /d/
      chord.pitches = chord.pitches[chord.inversion...].concat chord.pitches[...chord.inversion] if chord.inversion?
      chord
    else
      name


#
# Exports
#

module.exports = {
  Chord
  Chords
}
