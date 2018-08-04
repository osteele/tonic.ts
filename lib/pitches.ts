/*
 * decaffeinate suggestions:
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//
// Pitches
//

type MidiNumber = number;
type PitchClassName = string;
type PitchClassNumber = number;

const SharpNoteNames = 'C C# D D# E F F# G G# A A# B'
  .replace(/#/g, '\u266F')
  .split(/\s/);
const FlatNoteNames = 'C Db D Eb E F Gb G Ab A Bb B'
  .replace(/b/g, '\u266D')
  .split(/\s/);
const NoteNames = SharpNoteNames;

const AccidentalValues: { [_: string]: number } = {
  '#': 1,
  '♯': 1,
  b: -1,
  '♭': -1,
  '𝄪': 2,
  '𝄫': -2
};
const AccidentalNames = ['𝄫', '♭', '', '♯', '𝄪'];

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

function semitonesToAccidentalString(n: number): string {
  // fast path:
  if (-2 <= n && n <= 2) {
    return AccidentalNames[n + 2];
  }
  let [single, double] = ['♯', '𝄪'];
  if (n < 0) {
    [n, single, double] = [-n, '♭', '𝄫'];
  }
  let s = new Array(Math.floor((n + 2) / 2)).join(double);
  if (n % 2) {
    s = single + s;
  }
  return s;
}

function getPitchClassName(pitchClass: PitchClassNumber) {
  return NoteNames[pitchClass];
}

// really returns the name of a pitch *class*
function getPitchName(
  pitch: PitchClassName | PitchClassNumber,
  { sharp, flat }: { sharp?: boolean; flat?: boolean } = {}
): string {
  if (typeof pitch === 'string') {
    return pitch;
  }
  const pitchClass = pitchToPitchClass(pitch);
  const flatName = FlatNoteNames[pitchClass];
  const sharpName = SharpNoteNames[pitchClass];
  let name = sharp ? sharpName : flatName;
  if (flat && sharp && flatName !== sharpName) {
    name = `${flatName}/\n${sharpName}`;
  }
  return name;
}

// The interval class (integer in [0...12]) between two pitch class numbers
const intervalClassDifference = (a: PitchClassNumber, b: PitchClassNumber) =>
  normalizePitchClass(b - a);

const normalizePitchClass = (pitchClass: PitchClassNumber) =>
  ((pitchClass % 12) + 12) % 12;

var pitchToPitchClass = normalizePitchClass;

function pitchFromScientificNotation(name: string): PitchClassNumber {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(\d+)$/i);
  if (!match) {
    throw new Error(`“${name}” is not in scientific notation`);
  }
  const [naturalName, accidentals, octave] = match.slice(1);
  let pitch =
    SharpNoteNames.indexOf(naturalName.toUpperCase()) +
    12 * (1 + Number(octave));
  for (let c of accidentals) {
    pitch += AccidentalValues[c];
  }
  return pitch;
}

function pitchFromHelmholtzNotation(name: string): PitchClassNumber {
  const match = name.match(/^([A-G][#♯b♭𝄪𝄫]*)(,*)('*)$/i);
  if (!match) {
    throw new Error(`“${name}” is not in Helmholtz notation`);
  }
  const [pitchClassName, commas, apostrophes] = match.slice(1);
  const pitchClassNumber = parsePitchClass(pitchClassName, false);
  const octave =
    4 -
    Number(pitchClassName === pitchClassName.toUpperCase()) -
    commas.length +
    apostrophes.length;
  return 12 * octave + pitchClassNumber;
}

function toScientificNotation(midiNumber: number): string {
  const octave = Math.floor(midiNumber / 12) - 1;
  return getPitchClassName(normalizePitchClass(midiNumber)) + octave;
}

function parsePitchClass(
  name: PitchClassName,
  normal = true
): PitchClassNumber {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i);
  if (!match) {
    throw new Error(`“${name}” is not a pitch class name`);
  }
  const [naturalName, accidentals] = match.slice(1);
  let pitch = SharpNoteNames.indexOf(naturalName.toUpperCase());
  for (let c of accidentals) {
    pitch += AccidentalValues[c];
  }
  if (normal) {
    pitch = normalizePitchClass(pitch);
  }
  return pitch;
}

const midi2name = (n: MidiNumber) =>
  `${NoteNames[(n + 12) % 12]}${Math.floor((n - 12) / 12)}`;

function name2midi(name: string): MidiNumber {
  const m = name.match(/^([A-Ga-g])([♯#♭b𝄪𝄫]*)(-?\d+)/);
  if (!m) {
    throw new Error(`“${name}” is not a note name`);
  }
  const [noteName, accidentals, octave] = m.slice(1);
  let pitch = NoteNames.indexOf(noteName);
  for (let c of accidentals) {
    pitch += AccidentalValues[c];
  }
  pitch += 12 * (1 + Number(octave));
  return pitch;
}

// An Interval is the signed distance between two notes.
// Intervals that represent the same semitone span *and* accidental are interned.
// Thus, two instance of M3 are ===, but sharp P4 and flat P5 are distinct from
// each other and from TT.
//
// FIXME these are interval classes, not intervals
class Interval {
  semitones: number;
  accidentals: number;
  constructor(semitones: number, accidentals = 0) {
    this.semitones = semitones;
    this.accidentals = accidentals;
    const dict =
      IntervalBySemitone[this.semitones] ||
      (IntervalBySemitone[this.semitones] = {});
    if (dict[this.accidentals]) {
      // FIXME: can ts intern this way?
      return dict[this.accidentals];
    }
    dict[this.accidentals] = this;
  }

  // TODO: what is the ts equivalent of toString?
  toString(): string {
    let s = IntervalNames[this.semitones];
    if (this.accidentals) {
      s = semitonesToAccidentalString(this.accidentals) + s;
    }
    return s;
  }

  add(other: Interval): Interval {
    return new Interval(this.semitones + other.semitones);
  }

  static fromSemitones(semitones: number): Interval {
    return new Interval(semitones);
  }

  static fromString(name: string): Interval {
    const semitones = IntervalNames.indexOf(name);
    if (!(semitones >= 0)) {
      throw new Error(`No interval named ${name}`);
    }
    return new Interval(semitones);
  }

  // pitch1 and pitch2 can both be pitches, or pitch classes
  // FIXME:
  static between(pitch1: Pitch | PitchClass, pitch2: Pitch | PitchClass) {
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
const IntervalBySemitone: { [_: number]: { [_: number]: Interval } } = {};

type IntervalMap = { [_: string]: Interval };
const Intervals = IntervalNames.reduce((acc: IntervalMap, name, semitones) => {
  acc[name] = new Interval(semitones);
  return acc;
}, {});

//
// Pitch
//

class Pitch {
  name: string;
  midiNumber: number;
  constructor({ name, midiNumber }: { name?: string; midiNumber: number }) {
    this.name = name || toScientificNotation(midiNumber);
    this.midiNumber = midiNumber;
  }

  toString(): string {
    return this.name;
  }

  add(other: Interval): Pitch {
    return new Pitch({ midiNumber: this.midiNumber + other.semitones });
  }

  toPitch(): Pitch {
    return this;
  }

  toPitchClass(): PitchClass {
    return PitchClass.fromSemitones(pitchToPitchClass(this.midiNumber));
  }

  transposeBy(interval: Interval): Pitch {
    return new Pitch({ midiNumber: this.midiNumber + interval.semitones });
  }

  static fromMidiNumber(midiNumber: number): Pitch {
    return new Pitch({ midiNumber });
  }

  static fromString(name: string): Pitch {
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
  name: string;
  semitones: number;
  constructor({ semitones, name }: { name?: string; semitones: number }) {
    this.semitones = semitones;
    this.name = name || NoteNames[semitones];
  }

  toString(): string {
    return this.name;
  }

  add(other: Interval): PitchClass {
    return PitchClass.fromSemitones(this.semitones + other.semitones);
  }

  // enharmonicizeTo: (scale) ->
  //   for name, semitones in scale.noteNames()
  //     return new PitchClass {name, semitones} if semitones == @semitones
  //   return this

  toPitch(octave = 0): Pitch {
    return Pitch.fromMidiNumber(this.semitones + 12 * octave);
  }

  toPitchClass() {
    return this;
  }

  static fromSemitones(semitones: number): PitchClass {
    semitones = normalizePitchClass(semitones);
    return new PitchClass({ semitones });
  }

  static fromString(name: string): PitchClass {
    return PitchClass.fromSemitones(parsePitchClass(name));
  }
}

const Pitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
  pitch => new Pitch({ midiNumber: pitch })
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
