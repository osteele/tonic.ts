#
# Music Theory
#

Intervals = ['P8', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7']

LongIntervalNames = [
  'Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th']

NoteNames = "G# A A# B C C# D D# E F F# G".split(/\s/)

Chords = [
  {name: 'Major', abbrs: ['', 'M'], pitch_classes: '047'},
  {name: 'Minor', abbr: 'm', pitch_classes: '037'},
  {name: 'Augmented', abbrs: ['+', 'aug'], pitch_classes: '048'},
  {name: 'Diminished', abbrs: ['°', 'dim'], pitch_classes: '036'},
  {name: 'Sus2', abbr: 'sus2', pitch_classes: '027'},
  {name: 'Sus4', abbr: 'sus4', pitch_classes: '057'},
  {name: 'Dominant 7th', abbrs: ['7', 'dom7'], pitch_classes: '047t'},
  {name: 'Augmented 7th', abbrs: ['+7', '7aug'], pitch_classes: '048t'},
  {name: 'Diminished 7th', abbrs: ['°7', 'dim7'], pitch_classes: '0369'},
  {name: 'Major 7th', abbr: 'maj7', pitch_classes: '047e'},
  {name: 'Minor 7th', abbr: 'min7', pitch_classes: '037t'},
  {name: 'Dominant 7 b5', abbr: '7b5', pitch_classes: '046t'},
  # following is also half-diminished 7th
  {name: 'Min 7th b5', abbrs: ['ø', 'Ø', 'm7b5'], pitch_classes: '036t'},
  {name: 'Dim Maj 7th', abbr: '°Maj7', pitch_classes: '036e'},
  {name: 'Min Maj 7th', abbrs: ['min/maj7', 'min(maj7)'], pitch_classes: '037e'},
  {name: '6th', abbrs: ['6', 'M6', 'M6', 'maj6'], pitch_classes: '0479'},
  {name: 'Minor 6th', abbrs: ['m6', 'min6'], pitch_classes: '0379'},
]

do ->
  keys = {'t': 10, 'e': 11}
  for chord in Chords
    chord.abbrs = chord.abbrs.split(/s/) if typeof chord.abbrs == 'string'
    chord.abbr ||= chord.abbrs[0]
    chord.pitch_classes = (keys[c] or parseInt(c, 10) for c in chord.pitch_classes)

compute_chord_name = (root_pitch, chord) ->
  "#{NoteNames[root_pitch]}#{chord.abbr}"

interval_class_between = (pca, pcb) ->
  n = (pcb - pca) % 12
  n += 12 while n < 0
  return n

module.exports =
  Chords: Chords
  Intervals: Intervals
  LongIntervalNames: LongIntervalNames
  NoteNames: NoteNames
  compute_chord_name: compute_chord_name
  interval_class_between: interval_class_between
