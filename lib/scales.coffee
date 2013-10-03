{FlatNoteNames, Interval, NoteNames, PitchClass, SharpNoteNames, normalizePitchClass, parsePitchClass} =
  require './pitches'
{Chord} = require './chords'

#
# Scales
#

class Scale
  constructor: ({@name, @pitchClasses, @parent, @modeNames, @tonic}) ->
    @tonic = PitchClass.fromString(@tonic) if typeof @tonic == 'string'
    @intervals = (new Interval(semitones) for semitones in @pitchClasses)
    @pitches = (@tonic.add(interval) for interval in @intervals) if @tonic?

  at: (tonic) ->
    new Scale
      name: @name
      pitchClasses: @pitchClasses
      tonic: tonic

  chords: (options={}) ->
    throw new Error("only implemented for scales with tonics") unless @tonic?
    degrees = [0, 2, 4]
    degrees.push 6 if options.sevenths
    for i in [0 ... @pitches.length]
      modePitches = @pitches[i..].concat(@pitches[...i])
      chordPitches = (modePitches[degree] for degree in degrees)
      Chord.fromPitches(chordPitches).enharmonicizeTo(this)

  noteNames: ->
    noteNames = SharpNoteNames
    noteNames = FlatNoteNames if @tonicName not in noteNames or @tonicName == 'F'
    return noteNames

  @fromString: (name) ->
    tonicName = null
    scaleName = null
    [tonicName, scaleName] = match[1...] if match = name.match(/^([a-gA-G][#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/)
    scaleName or= 'Diatonic Major'
    throw new Error("No scale named #{scaleName}") unless scale = Scales[scaleName]
    scale = scale.at(tonicName) if tonicName
    return scale


Scales = [
  {
    name: 'Diatonic Major'
    pitchClasses: [0, 2, 4, 5, 7, 9, 11]
    modeNames: 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(/\s/)
  }
  {
    name: 'Natural Minor'
    pitchClasses: [0, 2, 3, 5, 7, 8, 10]
    parent: 'Diatonic Major'
  }
  {
    name: 'Major Pentatonic'
    pitchClasses: [0, 2, 4, 7, 9]
    modeNames: ['Major Pentatonic', 'Suspended Pentatonic', 'Man Gong', 'Ritusen', 'Minor Pentatonic']
  }
  {
    name: 'Minor Pentatonic'
    pitchClasses: [0, 3, 5, 7, 10]
    parent: 'Major Pentatonic'
  }
  {
    name: 'Melodic Minor'
    pitchClasses: [0, 2, 3, 5, 7, 9, 11]
    modeNames:
      ['Jazz Minor', 'Dorian b2', 'Lydian Augmented', 'Lydian Dominant', 'Mixolydian b6', 'Semilocrian', 'Superlocrian']
  }
  {
    name: 'Harmonic Minor'
    pitchClasses: [0, 2, 3, 5, 7, 8, 11]
    modeNames:
      ['Harmonic Minor', 'Locrian #6', 'Ionian Augmented', 'Romanian', 'Phrygian Dominant', 'Lydian #2', 'Ultralocrian']
  }
  {
    name: 'Blues'
    pitchClasses: [0, 3, 5, 6, 7, 10]
  }
  {
    name: 'Freygish'
    pitchClasses: [0, 1, 4, 5, 7, 8, 10]
  }
  {
    name: 'Whole Tone'
    pitchClasses: [0, 2, 4, 6, 8, 10]
  }
  {
    # 'Octatonic' is the classical name. It's the jazz 'Diminished' scale.
    name: 'Octatonic'
    pitchClasses: [0, 2, 3, 5, 6, 8, 9, 11]
  }
].map (attrs) ->
  new Scale(attrs)

do ->
  Scales[scale.name] = scale for scale in Scales

# Find the modes
do ->
  rotatePitchClasses = (pitchClasses, i) ->
    i %= pitchClasses.length
    pitchClasses = pitchClasses.slice(i).concat pitchClasses[0 ... i]
    pitchClasses.map (pc) -> normalizePitchClass(pc - pitchClasses[0])

  for scale in Scales.filter((scale) -> typeof scale.parent == 'string')
    console.log 'set', scale, 'parent', Scales[scale.parent]
    scale.parent ?= Scales[scale.parent]

  for scale in Scales.filter((scale) -> scale.modeNames?)
    scale.modes ?= scale.modeNames.map (name, i) -> new Scale {
      name: name.replace(/#/, '\u266F').replace(/\bb(\d)/, '\u266D$1')
      parent: scale
      pitchClasses: rotatePitchClasses(scale.pitchClasses, i)
    }
    scale.modeIndex ?= 0

  # for scale in Scales.filter((scale) -> scale.parent?)
    # scale.modes ?= rotateArray(scale.parent?.modes, findArrayRotation()

  # for scale in Scales.filter((scale) -> scale.modes?)
    # modes = scale.modes ? scale.parent?.modes
    # continue unless modes
    # continue if
    # parent = scale.parent
    # modeNames or= parent?.modeNames
    # if modeNames?
    #   scale.modeIndex = 0
    #   if parent?
    #     [scale.modeIndex] = [0 ... pitchClasses.length]
    #       .filter (i) -> rotateArray(parent.pitchClasses, i).join(',') == pitchClasses.join(',')

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

ScaleDegreeNames = '1 b2 2 b3 3 4 b5 5 b6 6 b7 7'.split(/\s/)
  .map (d) -> d.replace(/(\d)/, '$1\u0302').replace(/b/, '\u266D')


#
# Exports
#

module.exports = {
  Scale
  ScaleDegreeNames
  Scales
}
