{intervalClassDifference, pitchFromScientificNotation} = require('./pitches')

#
# Fretboard
#

class Instrument
  stringCount: 6
  strings: 6
  fretCount: 12
  stringNumbers: [0..5]
  stringPitches: 'E4 B3 G3 D3 A2 E2'.split(/\s/).reverse().map pitchFromScientificNotation

  constructor: ({@name, @fretted}) ->

  eachFingerPosition: (fn) ->
    for string in @stringNumbers
      for fret in [0 .. @fretCount]
        fn string: string, fret: fret

  pitchAt: ({string, fret}) ->
    @stringPitches[string] + fret

Instruments = [
  {
    name: 'Guitar'
    fretted: true
  }
  {
    name: 'Violin'
    stringPitches: [7, 14, 21, 28]
  }
  {
    name: 'Viola'
    stringPitches: [0, 7, 14, 21]
  }
  {
    name: 'Cello'
    stringPitches: [0, 7, 14, 21]
  }
].map (attrs) -> new Instrument(attrs)

do ->
  Instruments[instrument.name] = instrument for instrument in Instruments

FretNumbers = [0..4]  # includes nut
FretCount = FretNumbers.length - 1  # doesn't include nut

intervalPositionsFromRoot = (instrument, rootPosition, semitones) ->
  rootPitch = instrument.pitchAt(rootPosition)
  positions = []
  fretboard_positions_each (fingerPosition) ->
    return unless intervalClassDifference(rootPitch, instrument.pitchAt(fingerPosition)) == semitones
    positions.push fingerPosition
  return positions

module.exports = {
  Default: Instruments.Guitar
  FretNumbers
  FretCount
  Instruments
  intervalPositionsFromRoot
}
