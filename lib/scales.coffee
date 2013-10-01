{FlatNoteNames, NoteNames, SharpNoteNames, normalizePitchClass, parsePitchClass} = require './pitches'
{Chord} = require './chords'

#
# Scales
#

class Scale
  constructor: ({@name, @pitchClasses, @parentName, @modeNames, @tonicName}) ->
    @tonicPitch or= parsePitchClass(@tonicName) if @tonicName
    @pitches = (pitch + @tonicPitch for pitch in @pitchClasses) if @tonicPitch?

  at: (tonicName) ->
    new Scale
      name: @name
      pitchClasses: @pitchClasses
      tonicName: tonicName

  chords: (options={}) ->
    throw new Error("only implemented for scales with tonics") unless @tonicPitch?
    noteNames = SharpNoteNames
    noteNames = FlatNoteNames if @tonicName not in noteNames or @tonicName == 'F'
    degrees = [0, 2, 4]
    degrees.push 6 if options.sevenths
    for rootPitch in [0 ... @pitches.length]
      modePitches = @pitches[rootPitch..].concat(@pitches[...rootPitch])
      chordPitches = (modePitches[degree] for degree in degrees)
      Chord.fromPitches(chordPitches).enharmonicizeTo(noteNames)

  @find: (tonicName) ->
    scaleName = 'Diatonic Major'
    Scales[scaleName].at(tonicName)

Scales = [
  {
    name: 'Diatonic Major'
    pitchClasses: [0, 2, 4, 5, 7, 9, 11]
    modeNames: 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(/\s/)
  }
  {
    name: 'Natural Minor'
    pitchClasses: [0, 2, 3, 5, 7, 8, 10]
    parentName: 'Diatonic Major'
  }
  {
    name: 'Major Pentatonic'
    pitchClasses: [0, 2, 4, 7, 9]
    modeNames: ['Major Pentatonic', 'Suspended Pentatonic', 'Man Gong', 'Ritusen', 'Minor Pentatonic']
  }
  {
    name: 'Minor Pentatonic'
    pitchClasses: [0, 3, 5, 7, 10]
    parentName: 'Major Pentatonic'
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
  rotateArray = (pitchClasses, i) ->
    i %= pitchClasses.length
    pitchClasses = pitchClasses.slice(i).concat pitchClasses[0 ... i]
    pitchClasses.map (pc) -> normalizePitchClass(pc - pitchClasses[0])
  for scale in Scales
    {name, modeNames, parentName, pitchClasses} = scale
    parent = scale.parent = Scales[parentName]
    modeNames or= parent?.modeNames
    if modeNames?
      scale.modeIndex = 0
      if parent?
        [scale.modeIndex] = [0 ... pitchClasses.length]
          .filter (i) -> rotateArray(parent.pitchClasses, i).join(',') == pitchClasses.join(',')
      scale.modes = modeNames.map (name, i) -> {
        name: name.replace(/#/, '\u266F').replace(/\bb(\d)/, '\u266D$1')
        pitchClasses: rotateArray((parent?.pitchClasses or pitchClasses), i)
        parent: scale
      }

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
