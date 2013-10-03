chords = require('./dist/chords');
pitches = require('./dist/pitches');
scales = require('./dist/scales');

module.exports = {
  fingerings: require('./dist/fingerings'),
  instruments: require('./dist/instruments'),
  layout: require('./dist/layout'),
  pitches: pitches,
  scales: scales,

  Instruments: require('./dist/instruments').Instruments,
  Interval: pitches.Interval,
  Intervals: pitches.Intervals,
  Pitch: pitches.Pitch,
  Pitches: pitches.Pitches,
  PitchClasses: pitches.PitchClasses,
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
