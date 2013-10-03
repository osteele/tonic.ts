{Pitch, intervalClassDifference, pitchFromScientificNotation} = require('./pitches')

#
# Fretboard
#

class Instrument
  constructor: ({@name, @fretted, @stringPitches, @fretCount}) ->
    @stringPitches = @stringPitches.split(/\s/) if typeof @stringPitches == 'string'
    @stringPitches = (Pitch.fromString(name) for name in @stringPitches) if typeof @stringPitches[0] == 'string'
    @strings = @stringCount = @stringPitches.length
    @stringNumbers = [0 ... @strings]

  eachFingerPosition: (fn) ->
    for string in @stringNumbers
      for fret in [0 .. @fretCount]
        fn string: string, fret: fret

  pitchAt: ({string, fret}) ->
    Pitch.fromMidiNumber(@stringPitches[string].midiNumber + fret)


Instruments = [
  {
    name: 'Guitar'
    stringPitches: 'E2 A2 D3 G3 B3 E4'
    fretted: true
    fretCount: 12
  }
  {
    name: 'Violin'
    stringPitches: 'G D A E'
  }
  {
    name: 'Viola'
    stringPitches: 'C G D A'
  }
  {
    name: 'Cello'
    stringPitches: 'C G D A'
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
  Instrument
  Instruments
  intervalPositionsFromRoot
}
