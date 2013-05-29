_ = require 'underscore'

Intervals = ['P8', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7']

LongIntervalNames = [
  'Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th']

NoteNames = "G# A A# B C C# D D# E F F# G".split(/\s/)

class Chord
  constructor: (options) ->
    @name = options.name
    @abbrs = options.abbrs or [options.abbr]
    @abbrs = @abbrs.split(/s/) if typeof @abbrs == 'string'
    @abbr = options.abbr or @abbrs[0]
    parse_pitch_class = (pc) ->
      pitch_class_codes = {'t': 10, 'e': 11}
      pitch_class_codes[pc] or parseInt(pc, 10)
    @pitch_classes = _.map(options.pitch_classes, parse_pitch_class)
    @root = options.root
    @root = NoteNames.indexOf(@root) if typeof @root == 'string'
    degrees = (1 + 2 * i for i in [0..@pitch_classes.length])
    degrees[1] = {'Sus2': 2, 'Sus4': 4}[@name] || degrees[1]
    degrees[3] = 6 if @name.match /6/
    @components = for pc, pci in @pitch_classes
      name = Intervals[pc]
      degree = degrees[pci]
      if pc == 0
        name = 'R'
      else unless Number(name.match(/\d+/)?[0]) == degree
        name = "A#{degree}" if Number(Intervals[pc - 1].match(/\d+/)?[0]) == degree
        name = "d#{degree}" if Number(Intervals[pc + 1].match(/\d+/)?[0]) == degree
      name
    if typeof @root == 'number'
      Object.defineProperty this, 'name', get: ->
        "#{NoteNames[@root]}#{@abbr}"

  at: (root) ->
    new Chord
      name: @name
      abbrs: @abbrs
      pitch_classes: @pitch_classes
      root: root

  degree_name: (degree_index) ->
    @components[degree_index]

ChordDefinitions = [
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

Chords = (new Chord(chord) for chord in ChordDefinitions)

interval_class_between = (pca, pcb) ->
  n = (pcb - pca) % 12
  n += 12 while n < 0
  return n

module.exports = {
  Chords
  Intervals
  LongIntervalNames
  NoteNames
  interval_class_between
}
