/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//
// Pitches
//

const SharpNoteNames = 'C C# D D# E F F# G G# A A# B'
  .replace(/#/g, '\u266F')
  .split(/\s/);
const FlatNoteNames = 'C Db D Eb E F Gb G Ab A Bb B'
  .replace(/b/g, '\u266D')
  .split(/\s/);
const NoteNames = SharpNoteNames;

const AccidentalValues = {
  '#': 1,
  '♯': 1,
  b: -1,
  '♭': -1,
  '𝄪': 2,
  '𝄫': -2
};

const IntervalNames = 'P1 m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7 P8'.split(/\s/);

const LongIntervalNames = [
  'Unison',
  'Minor 2nd',
  'Major 2nd',
  'Minor 3rd',
  'Major 3rd',
  'Perfect 4th',
  'Tritone',
  'Perfect 5th',
  'Minor 6th',
  'Major 6th',
  'Minor 7th',
  'Major 7th',
  'Octave'
];

const semitonesToAccidentalString = function(n) {
  if (!n) {
    return '';
  }
  if (n in AccidentalValues) {
    return AccidentalValues[n];
  } // fast path
  let [single, double] = Array.from(['♯', '𝄪']);
  if (n < 0) {
    [n, single, double] = Array.from([-n, '♭', '𝄫']);
  }
  let s = new Array(Math.floor((n + 2) / 2)).join(double);
  if (n % 2) {
    s = single + s;
  }
  return s;
};

const getPitchClassName = pitchClass => NoteNames[pitchClass];

// really returns the name of a pitch *class*
const getPitchName = function(pitch, options) {
  if (options == null) {
    options = {};
  }
  if (typeof pitch === 'string') {
    return pitch;
  }
  const pitchClass = pitchToPitchClass(pitch);
  const flatName = FlatNoteNames[pitchClass];
  const sharpName = SharpNoteNames[pitchClass];
  let name = options.sharp ? sharpName : flatName;
  if (options.flat && options.sharp && flatName !== sharpName) {
    name = `${flatName}/\n${sharpName}`;
  }
  return name;
};

// The interval class (integer in [0...12]) between two pitch class numbers
const intervalClassDifference = (pca, pcb) => normalizePitchClass(pcb - pca);

const normalizePitchClass = pitchClass => ((pitchClass % 12) + 12) % 12;

var pitchToPitchClass = normalizePitchClass;

const pitchFromScientificNotation = function(name) {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(\d+)$/i);
  if (!match) {
    throw new Error(`“${name}” is not in scientific notation`);
  }
  const [naturalName, accidentals, octave] = Array.from(match.slice(1));
  let pitch =
    SharpNoteNames.indexOf(naturalName.toUpperCase()) +
    12 * (1 + Number(octave));
  for (let c of Array.from(accidentals)) {
    pitch += AccidentalValues[c];
  }
  return pitch;
};

const pitchFromHelmholtzNotation = function(name) {
  const match = name.match(/^([A-G][#♯b♭𝄪𝄫]*)(,*)('*)$/i);
  if (!match) {
    throw new Error(`“${name}” is not in Helmholtz notation`);
  }
  const [pitchClassName, commas, apostrophes] = Array.from(match.slice(1));
  const pitchClassNumber = parsePitchClass(pitchClassName, false);
  const octave =
    4 -
    Number(pitchClassName === pitchClassName.toUpperCase()) -
    commas.length +
    apostrophes.length;
  return 12 * octave + pitchClassNumber;
};

const toScientificNotation = function(midiNumber) {
  const octave = Math.floor(midiNumber / 12) - 1;
  return getPitchClassName(normalizePitchClass(midiNumber)) + octave;
};

var parsePitchClass = function(name, normal) {
  if (normal == null) {
    normal = true;
  }
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i);
  if (!match) {
    throw new Error(`“${name}” is not a pitch class name`);
  }
  const [naturalName, accidentals] = Array.from(match.slice(1));
  let pitch = SharpNoteNames.indexOf(naturalName.toUpperCase());
  for (let c of Array.from(accidentals)) {
    pitch += AccidentalValues[c];
  }
  if (normal) {
    pitch = normalizePitchClass(pitch);
  }
  return pitch;
};

const midi2name = number =>
  `${NoteNames[(number + 12) % 12]}${Math.floor((number - 12) / 12)}`;

const name2midi = function(name) {
  let m;
  if (!(m = name.match(/^([A-Ga-g])([♯#♭b𝄪𝄫]*)(-?\d+)/))) {
    throw new Error(`“${name}” is not a note name`);
  }
  const [noteName, accidentals, octave] = Array.from(m.slice(1));
  let pitch = NoteNames.indexOf(noteName);
  for (let c of Array.from(accidentals)) {
    pitch += AccidentalValues[c];
  }
  pitch += 12 * (1 + Number(octave));
  return pitch;
};

// An Interval is the signed distance between two notes.
// Intervals that represent the same semitone span *and* accidental are interned.
// Thus, two instance of M3 are ===, but sharp P4 and flat P5 are distinct from
// each other and from TT.
//
// FIXME these are interval classes, not intervals
class Interval {
  constructor(semitones, accidentals) {
    this.semitones = semitones;
    if (accidentals == null) {
      accidentals = 0;
    }
    this.accidentals = accidentals;
    if (!this.accidentals) {
      this.accidentals = 0;
    }
    const dict =
      IntervalBySemitone[this.semitones] ||
      (IntervalBySemitone[this.semitones] = {});
    if (dict[this.accidentals]) {
      return dict[this.accidentals];
    }
    dict[this.accidentals] = this;
  }

  toString() {
    let s = IntervalNames[this.semitones];
    if (this.accidentals) {
      s = semitonesToAccidentalString(this.accidentals) + s;
    }
    return s;
  }

  add(other) {
    if (other.semitones == null) {
      throw new Error(`Can''t add ${self} and ${other}`);
    }
    return new Interval(this.semitones + other.semitones);
  }

  static fromSemitones(semitones) {
    return new Interval(semitones);
  }

  static fromString(string) {
    const semitones = IntervalNames.indexOf(string);
    if (!(semitones >= 0)) {
      throw new Error(`No interval named ${string}`);
    }
    return new Interval(semitones);
  }

  // pitch1 and pitch2 can both be pitches, or pitch classes
  static between(pitch1, pitch2) {
    let semitones = (() => {
      switch (false) {
        case !(pitch1 instanceof Pitch) || !(pitch2 instanceof Pitch):
          return pitch2.midiNumber - pitch1.midiNumber;
        case !(pitch1 instanceof PitchClass) || !(pitch2 instanceof PitchClass):
          return normalizePitchClass(pitch2.semitones - pitch1.semitones);
        default:
          throw new Error(
            `Can't take the interval between ${pitch1} and ${pitch2}`
          );
      }
    })();
    if (!(0 <= semitones && semitones < 12)) {
      semitones = normalizePitchClass(semitones);
    }
    // throw new Error("I haven't decided what to do about this case: #{pitch2} - #{pitch1} = #{semitones}")
    return Interval.fromSemitones(semitones);
  }
}

// new Interval interns into this
var IntervalBySemitone = {};

const Intervals = (function() {
  const array = {};
  for (let semitones = 0; semitones < IntervalNames.length; semitones++) {
    const name = IntervalNames[semitones];
    array[name] = new Interval(semitones);
  }
  return array;
})();

//
// Pitch
//

class Pitch {
  name: string;
  midiNumber: number;
  constructor({ name, midiNumber }) {
    this.name = name;
    this.midiNumber = midiNumber;
    if (this.name == null) {
      this.name = toScientificNotation(this.midiNumber);
    }
  }

  toString() {
    return this.name;
  }

  add(other) {
    if (other.semitones == null) {
      throw new Error(`Can't add ${self} and ${other}`);
    }
    return new Pitch({ midiNumber: this.midiNumber + other.semitones });
  }

  toPitch() {
    return this;
  }

  toPitchClass() {
    return PitchClass.fromSemitones(pitchToPitchClass(this.midiNumber));
  }

  transposeBy(interval) {
    return new Pitch({ midiNumber: this.midiNumber + interval.semitones });
  }

  static fromMidiNumber(midiNumber) {
    return new Pitch({ midiNumber });
  }

  static fromString(name) {
    const midiNumber = (name.match(/\d/)
      ? pitchFromScientificNotation
      : pitchFromHelmholtzNotation)(name);
    return new Pitch({ midiNumber, name });
  }
}

//
// Pitch Class
//

class PitchClass {
  constructor({ semitones, name }) {
    this.semitones = semitones;
    this.name = name;
    if (!this.name) {
      this.name = NoteNames[this.semitones];
    }
  }

  toString() {
    return this.name;
  }

  add(other) {
    if (other.semitones == null) {
      throw new Error(`Can''t add ${self} and ${other}`);
    }
    return PitchClass.fromSemitones(this.semitones + other.semitones);
  }

  // enharmonicizeTo: (scale) ->
  //   for name, semitones in scale.noteNames()
  //     return new PitchClass {name, semitones} if semitones == @semitones
  //   return this

  toPitch(octave) {
    if (octave == null) {
      octave = 0;
    }
    return Pitch.fromMidiNumber(this.semitones + 12 * octave);
  }

  toPitchClass() {
    return this;
  }

  static fromSemitones(semitones) {
    semitones = normalizePitchClass(semitones);
    return new PitchClass({ semitones });
  }

  static fromString(string) {
    return PitchClass.fromSemitones(parsePitchClass(string));
  }
}

const Pitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
  pitch => new Pitch(pitch)
);

//
// Exports
//

export {
  NoteNames,
  FlatNoteNames,
  SharpNoteNames,
  IntervalNames,
  LongIntervalNames,
  // Function interface
  semitonesToAccidentalString,
  getPitchClassName,
  intervalClassDifference,
  midi2name,
  name2midi,
  normalizePitchClass,
  pitchFromScientificNotation,
  parsePitchClass,
  // pitchNumberToName,
  getPitchName,
  pitchToPitchClass,
  // OO interface
  Interval,
  Intervals,
  Pitch,
  PitchClass,
  Pitches
};
