chords = require('./dist/chords');
scales = require('./dist/scales');

module.exports = {
  pitches: require('./dist/pitches'),
  fingerings: require('./dist/fingerings'),
  instruments: require('./dist/instruments'),
  layout: require('./dist/layout'),

  Instruments: require('./dist/instruments').Instruments,
  Pitches: require('./dist/pitches').Pitches,
  Chord: chords.Chord,
  Chords: chords.Chords,
  Scale: scales.Scale,
  Scales: scales.Scales,

  diagrams: {
    chord: require('./dist/chord_diagram'),
    fretboard: require('./dist/fretboard_diagram'),
    pitches: require('./dist/pitch_diagram'),
  }
};
