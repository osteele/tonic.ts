#
# Notes and Pitches
#

SharpNoteNames = 'C C# D D# E F F# G G# A A# B'.replace(/#/g, '\u266F').split(/\s/)
FlatNoteNames = 'C Db D Eb E F Gb G Ab A Bb B'.replace(/b/g, '\u266D').split(/\s/)
NoteNames = SharpNoteNames

AccidentalValues =
  '#': 1
  '♯': 1
  'b': -1
  '♭': -1
  '𝄪': 2
  '𝄫': -2

IntervalNames = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8']

LongIntervalNames = [
  'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave']

getPitchClassName = (pitchClass) ->
  NoteNames[normalizePitchClass(pitchClass)]

getPitchName = (pitch) ->
  return pitch if typeof pitch == 'string'
  getPitchClassName(pitch)

# The interval class (integer in [0...12]) between two pitch class numbers
intervalClassDifference = (pca, pcb) ->
  normalizePitchClass(pcb - pca)

normalizePitchClass = (pitchClass) ->
  ((pitchClass % 12) + 12) % 12

pitchFromScientificNotation = (name) ->
  match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(\d+)$/i)
  throw new Error("#{name} is not in scientific notation") unless match
  [naturalName, accidentals, octave] = match[1...]
  pitch = SharpNoteNames.indexOf(naturalName.toUpperCase()) + 12 * (1 + Number(octave))
  pitch += AccidentalValues[c] for c in accidentals
  return pitch

parsePitchClass = (name) ->
  match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i)
  throw new Error("#{name} is not a pitch class name") unless match
  [naturalName, accidentals] = match[1...]
  pitch = SharpNoteNames.indexOf(naturalName.toUpperCase())
  pitch += AccidentalValues[c] for c in accidentals
  return pitch


#
# Scales
#

class Scale
  constructor: ({@name, @pitches, @tonicName}) ->
    @tonicPitch or= parsePitchClass(@tonicName) if @tonicName

  at: (tonicName) ->
    new Scale
      name: @name
      pitches: @pitches
      tonicName: tonicName

  chords: (options={}) ->
    throw new Error("only implemented for scales with tonics") unless @tonicPitch?
    noteNames = SharpNoteNames
    noteNames = FlatNoteNames if noteNames.indexOf(@tonicName) < 0 or @tonicName == 'F'
    degrees = [0, 2, 4]
    degrees.push 6 if options.sevenths
    for i in [0...@pitches.length]
      pitches = @pitches[i..].concat(@pitches[...i])
      pitches = (pitches[degree] for degree in degrees).map (n) => (n + @tonicPitch) % 12
      Chord.fromPitches(pitches).enharmonicizeTo(noteNames)

  @find: (tonicName) ->
    scaleName = 'Diatonic Major'
    Scales[scaleName].at(tonicName)

Scales = do ->
  scale_specs = [
    'Diatonic Major: 024579e'
    'Natural Minor: 023578t'
    'Melodic Minor: 023579e'
    'Harmonic Minor: 023578e'
    'Pentatonic Major: 02479'
    'Pentatonic Minor: 0357t'
    'Blues: 03567t'
    'Freygish: 014578t'
    'Whole Tone: 02468t'
    # 'Octatonic' is the classical name. It's the jazz 'Diminished' scale.
    'Octatonic: 0235689e'
  ]
  for spec in scale_specs
    [name, pitches] = spec.split(/:\s*/, 2)
    pitches = pitches.match(/./g).map (c) -> {'t':10, 'e':11}[c] or Number(c)
    new Scale {name, pitches}

do ->
  Scales[scale.name] = scale for scale in Scales

Modes = do ->
  rootTones = Scales['Diatonic Major'].pitches
  modeNames = 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(/\s/)
  for delta, i in rootTones
    name = modeNames[i]
    pitches = ((d - delta + 12) % 12 for d in rootTones[i...].concat rootTones[...i])
    new Scale {name, pitches}

do ->
  Modes[mode.name] = mode for mode in Modes

# Indexed by scale degree
Functions = 'Tonic Supertonic Mediant Subdominant Dominant Submediant Subtonic Leading'.split(/\s/)

parseChordNumeral = (name) ->
  chord = {
    degree: 'i ii iii iv v vi vii'.indexOf(name.match(/[iv+]/i)[1]) + 1
    major: name == name.toUpperCase()
    flat: name.match(/^b/)
    diminished: name.match(/°/)
    augmented: name.match(/\+/)
  }
  return chord

FunctionQualities =
  major: 'I ii iii IV V vi vii°'.split(/\s/).map parseChordNumeral
  minor: 'i ii° bIII iv v bVI bVII'.split(/\s/).map parseChordNumeral


#
# Chords
#

class Chord
  constructor: ({@name, @fullName, @abbr, @abbrs, @pitchClasses, @rootName, @rootPitch}) ->
    @abbrs ?= [@abbr]
    @abbrs = @abbrs.split(/s/) if typeof @abbrs == 'string'
    @abbr ?= @abbrs[0]
    if @rootPitch?
      @rootName or= NoteNames[@rootPitch]
    if @rootName?
      @rootPitch ?= parsePitchClass(@rootName)
      rootlessAbbr = @abbr
      rootlessFullName = @fullName
      Object.defineProperty this, 'name', get: -> "#{@rootName}#{rootlessAbbr}"
      Object.defineProperty this, 'fullName', get: -> "#{@rootName} #{rootlessFullName}"
    degrees = (1 + 2 * i for i in [0..@pitchClasses.length])
    degrees[1] = {'Sus2':2, 'Sus4':4}[@name] || degrees[1]
    degrees[3] = 6 if @name.match /6/
    @components = for pc, pci in @pitchClasses
      name = IntervalNames[pc]
      degree = degrees[pci]
      if pc == 0
        name = 'R'
      else unless Number(name.match(/\d+/)?[0]) == degree
        name = "A#{degree}" if Number(IntervalNames[pc - 1].match(/\d+/)?[0]) == degree
        name = "d#{degree}" if Number(IntervalNames[pc + 1].match(/\d+/)?[0]) == degree
      name

  at: (rootNameOrPitch) ->
    [rootName, rootPitch] = switch typeof rootNameOrPitch
      when 'string'
        [rootNameOrPitch, null]
      when 'number'
        [null, rootNameOrPitch]
      else
        throw new Error("#rootNameOrPitch} must be a pitch name or number")

    new Chord
      name: @name
      abbrs: @abbrs
      fullName: @fullName
      pitchClasses: @pitchClasses
      rootName: rootName
      rootPitch: rootPitch

  degreeName: (degreeIndex) ->
    @components[degreeIndex]

  enharmonicizeTo: (pitchNameArray) ->
    for pitchName, pitchClass in pitchNameArray
      @rootName = pitchName if @rootPitch == pitchClass
    return this

  @find: (name) ->
    match = name.match(/^([a-gA-G][♯♭]*)(.*)$/)
    throw new Error("#{name} is not a chord name") unless match
    [noteName, chordName] = match[1...]
    throw new Error("#{name} is not a chord name") unless Chords[chordName]
    return Chords[chordName].at(noteName)

  @fromPitches: (pitches) ->
    root = pitches[0]
    Chord.fromPitchClasses(pitch - root for pitch in pitches).at(root)

  @fromPitchClasses: (pitchClasses) ->
    pitchClasses = ((n + 12) % 12 for n in pitchClasses).sort((a, b) -> a > b)
    chord = Chords[pitchClasses]
    throw new Error("Couldn''t find chord with pitch classes #{pitchClasses}") unless chord
    return chord


ChordDefinitions = [
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
]

# Chords is an array of chord classes
Chords = ChordDefinitions.map (spec) ->
  spec.fullName = spec.name
  spec.name = spec.name
    .replace(/Major(?!$)/, 'Maj')
    .replace(/Minor(?!$)/, 'Min')
    .replace('Dominant', 'Dom')
    .replace('Diminished', 'Dim')
  spec.abbrs or= [spec.abbr]
  spec.abbrs = spec.abbrs.split(/s/) if typeof spec.abbrs == 'string'
  spec.abbr or= spec.abbrs[0]
  spec.pitchClasses = spec.pitchClasses.match(/./g).map (c) -> {'t':10, 'e':11}[c] or Number(c)
  new Chord spec

# `Chords` is also indexed by chord names and abbreviations, and by pitch classes
do ->
  for chord in Chords
    {name, fullName, abbrs} = chord
    Chords[key] = chord for key in [name, fullName].concat(abbrs)
    Chords[chord.pitchClasses] = chord


#
# Exports
#

module.exports = {
  Chord
  Chords
  IntervalNames
  LongIntervalNames
  Modes
  NoteNames
  Scale
  Scales
  getPitchClassName
  intervalClassDifference
  pitchFromScientificNotation
}
