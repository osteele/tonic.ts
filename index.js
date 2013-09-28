module.exports = {
  theory: require('./dist/theory'),
  fingerings: require('./dist/fingerings'),
  instruments: require('./dist/instruments'),
  layout: require('./dist/layout'),
  diagrams: {
    chord: require('./dist/chord_diagram'),
    fretboard: require('./dist/fretboard_diagram'),
    pitches: require('./dist/pitch_diagram'),
  }
}
