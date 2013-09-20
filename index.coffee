module.exports =
  theory: require('./lib/theory')
  fretboard:
    logic: require('./lib/fingerings')
    model: require('./lib/instruments')
  utils:
    layout: require('./lib/layout')
  drawing:
    chord_diagram: require('./lib/chord_diagram')
    fretboard: require('./lib/fretboard_diagram')
    pitch_diagram: require('./lib/pitch_diagram')
