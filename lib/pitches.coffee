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

Pitches = [0 ... 12]
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

parsePitchClass = (name) ->
  match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i)
  throw new Error("#{name} is not a pitch class name") unless match
  [naturalName, accidentals] = match[1...]
  pitch = SharpNoteNames.indexOf(naturalName.toUpperCase())
  pitch += AccidentalValues[c] for c in accidentals
  return normalizePitchClass(pitch)

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
# Exports
#

module.exports = {
  FlatNoteNames
  IntervalNames
  LongIntervalNames
  NoteNames
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
