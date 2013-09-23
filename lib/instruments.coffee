{intervalClassDifference, pitchFromScientificNotation} = require('./theory')

#
# Fretboard
#

class Instrument
  stringCount: 6
  strings: 6
  fretCount: 12
  stringNumbers: [0..5]
  stringPitches: 'E4 B3 G3 D3 A2 E2'.split(/\s/).reverse().map pitchFromScientificNotation

  eachFingerPosition: (fn) ->
    for string in @stringNumbers
      for fret in [0..@fretCount]
        fn string: string, fret: fret

  pitchAt: ({string, fret}) ->
    @stringPitches[string] + fret

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
  Default: new Instrument
  FretNumbers
  FretCount
  intervalPositionsFromRoot
}
