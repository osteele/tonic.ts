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

getPitchName = (pitch, options={}) ->
  return pitch if typeof pitch == 'string'
  pitchClass = pitchToPitchClass(pitch)
  flatName = FlatNoteNames[pitchClass]
  sharpName = SharpNoteNames[pitchClass]
  name = if options.sharp then sharpName else flatName
  if options.flat and options.sharp and flatName != sharpName
    name = "#{flatName}/\n#{sharpName}"
  return name

# The interval class (integer in [0...12]) between two pitch class numbers
intervalClassDifference = (pca, pcb) ->
  normalizePitchClass(pcb - pca)

normalizePitchClass = (pitchClass) ->
  ((pitchClass % 12) + 12) % 12

pitchToPitchClass = normalizePitchClass

pitchFromScientificNotation = (name) ->
  match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(\d+)$/i)
  throw new Error("#{name} is not in scientific notation") unless match
  [naturalName, accidentals, octave] = match[1...]
  pitch = SharpNoteNames.indexOf(naturalName.toUpperCase()) + 12 * (1 + Number(octave))
  pitch += AccidentalValues[c] for c in accidentals
  return pitch

pitchFromHelmholtzNotation = (name) ->
  match = name.match(/^([A-G][#♯b♭𝄪𝄫]*)(,*)('*)$/i)
  throw new Error("#{name} is not in scientific notation") unless match
  [pitchClassName, commas, apostrophes] = match[1...]
  pitchClassNumber = parsePitchClass(pitchClassName, false)
  octave = 4 - Number(pitchClassName == pitchClassName.toUpperCase()) - commas.length + apostrophes.length
  return 12 * octave + pitchClassNumber

toScientificNotation = (midiNumber) ->
  octave = Math.floor(midiNumber / 12) - 1
  return getPitchClassName(normalizePitchClass(midiNumber)) + octave

parsePitchClass = (name, normal=true) ->
  match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i)
  throw new Error("#{name} is not a pitch class name") unless match
  [naturalName, accidentals] = match[1...]
  pitch = SharpNoteNames.indexOf(naturalName.toUpperCase())
  pitch += AccidentalValues[c] for c in accidentals
  pitch = normalizePitchClass(pitch) if normal
  return pitch

midi2name = (number) ->
  "#{NoteNames[(number + 12) % 12]}#{Math.floor((number - 12) / 12)}"

name2midi = (name) ->
  throw new Error "#{name} is not a note name" unless m = name.toUpperCase().match(/^([A-G])([♯#♭b𝄪𝄫]*)(\d+)/)
  [noteName, accidentals, octave] = m.slice(1)
  pitch = NoteNames.indexOf(noteName)
  pitch += AccidentalValues[c] for c in accidentals
  pitch += 12 * Number(octave)
  return pitch


#
# Classes
#

class Interval
  constructor: (@semitones) ->
    return Intervals[@semitones] if Intervals[@semitones]
    Intervals[@semitones] = this

  toString: -> IntervalNames[@semitones]

  add: (other) ->
    throw new Error("Can''t add #{self} and #{other}") unless other.semitones?
    return new Interval(@semitones + other.semitones)

  @fromSemitones: (semitones) -> new Interval(semitones)

  @fromString: (string) ->
    semitones = IntervalNames.indexOf(string)
    throw new Error("No interval named #{string}") unless semitones >= 0
    new Interval(semitones)

  # pitch1 and pitch2 can both be pitches, or pitch classes
  @between: (pitch1, pitch2) ->
    semitones = switch
      when pitch1 instanceof Pitch and pitch2 instanceof Pitch
        pitch2.midiNumber - pitch1.midiNumber
      when pitch1 instanceof PitchClass and pitch2 instanceof PitchClass
        normalizePitchClass(pitch2.semitones - pitch1.semitones)
      else
        throw new Error("Can't take the interval between #{pitch1} and #{pitch2}")
    unless 0 <= semitones < 12
      semitones = normalizePitchClass(semitones)
      # throw new Error("I haven't decided what to do about this case: #{pitch2} - #{pitch1} = #{semitones}")
    return Interval.fromSemitones(semitones)

Intervals = []

class Pitch
  constructor: ({@name, @midiNumber}) ->
    @name ?= toScientificNotation(@midiNumber)

  toString: -> @name

  add: (other) ->
    throw new Error("Can't add #{self} and #{other}") unless other.semitones?
    return new Pitch midiNumber: @midiNumber + other.semitones

  toPitch: -> this

  toPitchClass: -> PitchClass.fromSemitones(pitchToPitchClass(@midiNumber))

  transposeBy: (interval) ->
    new Pitch(midiNumber: @midiNumber + interval.semitones)

  @fromMidiNumber: (midiNumber) -> new Pitch {midiNumber}

  @fromString: (name) ->
    midiNumber = if name.match(/\d/)
      pitchFromScientificNotation(name)
    else
      pitchFromHelmholtzNotation(name)
    new Pitch {midiNumber, name}


class PitchClass
  constructor: ({@semitones, @name}) ->
    @name or= NoteNames[@semitones]

  toString: -> @name

  add: (other) ->
    throw new Error("Can''t add #{self} and #{other}") unless other.semitones?
    return PitchClass.fromSemitones(@semitones + other.semitones)

  enharmonicizeTo: (scale) ->
    for name, semitones in scale.noteNames()
      return new PitchClass {name, semitones} if semitones == @semitones
    return this

  toPitch: (octave=0) -> Pitch.fromMidiNumber(@semitones + 12 * octave)

  toPitchClass: -> this

  @fromSemitones: (semitones) ->
    semitones = normalizePitchClass(semitones)
    new PitchClass({semitones})

  @fromString: (string) -> PitchClass.fromSemitones(parsePitchClass(string))


Pitches = [0 ... 12].map (pitch) -> new Pitch(pitch)


#
# Exports
#

module.exports = {
  FlatNoteNames
  Interval
  IntervalNames
  LongIntervalNames
  NoteNames
  Pitch
  PitchClass
  Pitches
  SharpNoteNames
  getPitchClassName
  getPitchName
  intervalClassDifference
  midi2name
  name2midi
  normalizePitchClass
  parsePitchClass
  pitchFromScientificNotation
  pitchNameToNumber: parsePitchClass
  pitchNumberToName: getPitchName
  pitchToPitchClass
}
