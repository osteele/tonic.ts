module.exports =
  theory: require('./lib/theory')
  logic:
    fingering: require('./lib/fingering')
    fretboard: require('./lib/fretboard')
  utils:
    layout: require('./lib/layout')
  drawing:
    chord_diagram: require('./lib/chord_diagram')
    fretboard: require('./lib/fretboard_diagram')
    pitch_diagram: require('./lib/pitch_diagram')
