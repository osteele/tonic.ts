/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {FlatNoteNames, Interval, Pitch, PitchClass, SharpNoteNames, normalizePitchClass} from './pitches';
import {Chord} from './chords';

const toPitchOrPitchClass = function(pitch) {
  if (typeof pitch !== 'string') { return pitch; }
  try {
    return PitchClass.fromString(pitch);
  } catch (error) {
    return Pitch.fromString(pitch);
  }
};

// A scale is a named collection, either of intervals or notes.
class Scale {
  name: string;
  pitchClasses: [Pitch];
  parent: Scale;
  modeNames: [string];
  tonic: [Pitch];
  intervals: [Interval];
  constructor({name, pitchClasses, parent = null, modeNames = [], tonic}) {
    this.name = name;
    this.pitchClasses = pitchClasses;
    this.parent = parent;
    this.modeNames = modeNames;
    this.tonic = tonic;
    this.tonic = toPitchOrPitchClass(this.tonic);
    this.intervals = (Array.from(this.pitchClasses).map((semitones) => new Interval(semitones)));
    if (this.tonic != null) { this.pitches = (Array.from(this.intervals).map((interval) => this.tonic.add(interval))); }
  }

  at(tonic) {
    return new Scale({
      name: this.name,
      pitchClasses: this.pitchClasses,
      tonic
    });
  }

  chords(options) {
    if (options == null) { options = {}; }
    if (this.tonic == null) { throw new Error("only implemented for scales with tonics"); }
    const degrees = [0, 2, 4];
    if (options.sevenths) { degrees.push(6); }
    return (() => {
      const result = [];
      for (let i = 0, end = this.pitches.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        var modePitches = this.pitches.slice(i).concat(this.pitches.slice(0, i));
        const chordPitches = (Array.from(degrees).map((degree) => modePitches[degree]));
        result.push(Chord.fromPitches(chordPitches));
      }
      return result;
    })();
  }

  noteNames() {
    let noteNames = SharpNoteNames;
    if (!Array.from(noteNames).includes(this.tonicName) || (this.tonicName === 'F')) { noteNames = FlatNoteNames; }
    return noteNames;
  }

  static fromString(name) {
    let match, scale;
    let tonicName = null;
    let scaleName = null;
    if (match = name.match(/^([a-gA-G][#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/)) { [tonicName, scaleName] = Array.from(match.slice(1)); }
    if (!scaleName) { scaleName = 'Diatonic Major'; }
    if (!(scale = Scales[scaleName])) { throw new Error(`No scale named ${scaleName}`); }
    if (tonicName) { scale = scale.at(tonicName); }
    return scale;
  }
}


var Scales = [
  {
    name: 'Diatonic Major',
    pitchClasses: [0, 2, 4, 5, 7, 9, 11],
    modeNames: 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(/\s/)
  },
  {
    name: 'Natural Minor',
    pitchClasses: [0, 2, 3, 5, 7, 8, 10],
    parent: 'Diatonic Major'
  },
  {
    name: 'Major Pentatonic',
    pitchClasses: [0, 2, 4, 7, 9],
    modeNames: ['Major Pentatonic', 'Suspended Pentatonic', 'Man Gong', 'Ritusen', 'Minor Pentatonic']
  },
  {
    name: 'Minor Pentatonic',
    pitchClasses: [0, 3, 5, 7, 10],
    parent: 'Major Pentatonic'
  },
  {
    name: 'Melodic Minor',
    pitchClasses: [0, 2, 3, 5, 7, 9, 11],
    modeNames:
      ['Jazz Minor', 'Dorian b2', 'Lydian Augmented', 'Lydian Dominant', 'Mixolydian b6', 'Semilocrian', 'Superlocrian']
  },
  {
    name: 'Harmonic Minor',
    pitchClasses: [0, 2, 3, 5, 7, 8, 11],
    modeNames:
      ['Harmonic Minor', 'Locrian #6', 'Ionian Augmented', 'Romanian', 'Phrygian Dominant', 'Lydian #2', 'Ultralocrian']
  },
  {
    name: 'Blues',
    pitchClasses: [0, 3, 5, 6, 7, 10]
  },
  {
    name: 'Freygish',
    pitchClasses: [0, 1, 4, 5, 7, 8, 10]
  },
  {
    name: 'Whole Tone',
    pitchClasses: [0, 2, 4, 6, 8, 10]
  },
  {
    // 'Octatonic' is the classical name. It's the jazz 'Diminished' scale.
    name: 'Octatonic',
    pitchClasses: [0, 2, 3, 5, 6, 8, 9, 11]
  }
].map(attrs => new Scale(attrs));

(function() {
  for (var scale of Array.from(Scales)) { Scales[scale.name] = scale; }
  return (() => {
    const result = [];
    for (scale of Array.from(Scales)) {       result.push(Scales[scale.name.replace(/\s/g, '')] = scale);
    }
    return result;
  })();
})();

// Find the modes
(function() {
  const rotatePitchClasses = function(pitchClasses, i) {
    i %= pitchClasses.length;
    pitchClasses = pitchClasses.slice(i).concat(pitchClasses.slice(0 ,  i));
    return pitchClasses.map(pc => normalizePitchClass(pc - pitchClasses[0]));
  };

  for (var scale of Array.from(Scales.filter(scale => typeof scale.parent === 'string'))) {
    if (scale.parent == null) { scale.parent = Scales[scale.parent]; }
  }

  return (() => {
    const result = [];
    for (scale of Array.from(Scales.filter(scale => scale.modeNames != null))) {
      if (scale.modes == null) { scale.modes = scale.modeNames.map((name, i) => new Scale({
        name: name.replace(/#/, '\u266F').replace(/\bb(\d)/, '\u266D$1'),
        parent: scale,
        pitchClasses: rotatePitchClasses(scale.pitchClasses, i)
      }) ); }
      result.push(scale.modeIndex != null ? scale.modeIndex : (scale.modeIndex = 0));
    }
    return result;
  })();
})();

  // for scale in Scales.filter((scale) -> scale.parent?)
    // scale.modes ?= rotateArray(scale.parent?.modes, findArrayRotation()

  // for scale in Scales.filter((scale) -> scale.modes?)
    // modes = scale.modes ? scale.parent?.modes
    // continue unless modes
    // continue if
    // parent = scale.parent
    // modeNames or= parent?.modeNames
    // if modeNames?
    //   scale.modeIndex = 0
    //   if parent?
    //     [scale.modeIndex] = [0 ... pitchClasses.length]
    //       .filter (i) -> rotateArray(parent.pitchClasses, i).join(',') == pitchClasses.join(',')

// Indexed by scale degree
const Functions = 'Tonic Supertonic Mediant Subdominant Dominant Submediant Subtonic Leading'.split(/\s/);

const parseChordNumeral = function(name) {
  const chord = {
    degree: 'i ii iii iv v vi vii'.indexOf(name.match(/[iv+]/i)[1]) + 1,
    major: name === name.toUpperCase(),
    flat: name.match(/^b/),
    diminished: name.match(/°/),
    augmented: name.match(/\+/)
  };
  return chord;
};

// FunctionQualities =
//   major: 'I ii iii IV V vi vii°'.split(/\s/).map parseChordNumeral
//   minor: 'i ii° bIII iv v bVI bVII'.split(/\s/).map parseChordNumeral

const ScaleDegreeNames = '1 b2 2 b3 3 4 b5 5 b6 6 b7 7'.split(/\s/)
  .map(d => d.replace(/(\d)/, '$1\u0302').replace(/b/, '\u266D'));


//
// Chord Progressions
//

Chord.progression = function(string, scale) {
  if (scale == null) { scale = Scales.DiatonicMajor; }
  return (Array.from(string.split(/[\s+\-]+/)).map((name) => Chord.fromRomanNumeral(name, scale)));
};



//
// Exports
//

module.exports = {
  Scale,
  ScaleDegreeNames,
  Scales
};
