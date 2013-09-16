{interval_class_between, pitchFromScientificNotation} = require('./theory')

#
# Fretboard
#

StringNumbers = [0..5]
StringCount = StringNumbers.length

FretNumbers = [0..4]  # includes nut
FretCount = FretNumbers.length - 1  # doesn't include nut

OpenStringPitches = 'E4 B3 G3 D3 A2 E2'.split(/\s/).reverse().map pitchFromScientificNotation

pitch_number_for_position = ({string, fret}) ->
  OpenStringPitches[string] + fret

fretboard_positions_each = (fn) ->
  for string in StringNumbers
    for fret in FretNumbers
      fn string: string, fret: fret

intervals_from = (root_position, semitones) ->
  root_note_number = pitch_number_for_position(root_position)
  positions = []
  fretboard_positions_each (finger_position) ->
    return unless interval_class_between(root_note_number, pitch_number_for_position(finger_position)) == semitones
    positions.push finger_position
  return positions

module.exports = {
  StringNumbers
  StringCount
  FretNumbers
  FretCount
  OpenStringPitches
  fretboard_positions_each
  pitch_number_for_position
  intervals_from
}
