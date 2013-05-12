{interval_class_between} = require('./theory')

#
# Fretboard
#

StringNumbers = [0..5]
StringCount = StringNumbers.length

FretNumbers = [0..4]  # includes nut
FretCount = FretNumbers.length - 1  # doesn't include nut

StringIntervals = [5, 5, 5, 4, 5]

OpenStringPitches = do (numbers=[]) ->
  numbers.push 20
  for interval, i in StringIntervals
    numbers.push numbers[i] + interval
  numbers

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

module.exports =
  StringNumbers: StringNumbers
  StringCount: StringCount
  FretNumbers: FretNumbers
  FretCount: FretCount
  OpenStringPitches: OpenStringPitches
  fretboard_positions_each: fretboard_positions_each
  pitch_number_for_position: pitch_number_for_position
  intervals_from: intervals_from
