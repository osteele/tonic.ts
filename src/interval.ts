import { semitonesToAccidentalString } from './accidentals';
import { normalizePitchClass, PitchClassNumber } from './names';
import { Pitch } from './pitch';
import { PitchClass } from './pitchClass';

// tslint:disable-next-line variable-name
export const IntervalNames = 'P1 m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7 P8'.split(
  /\s/,
);

// tslint:disable-next-line variable-name
export const LongIntervalNames = [
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
  'Octave',
];

// An Interval is the signed distance between two notes.
// Intervals that represent the same semitone span *and* accidental are interned.
// Thus, two instance of M3 are ===, but sharp P4 and flat P5 are distinct from
// each other and from TT.
//
// FIXME these are interval classes, not intervals
export class Interval {
  public static fromSemitones(semitones: number): Interval {
    return new Interval(semitones);
  }

  public static fromString(name: string): Interval {
    const semitones = IntervalNames.indexOf(name);
    if (!(semitones >= 0)) {
      throw new Error(`No interval named ${name}`);
    }
    return new Interval(semitones);
  }

  public static between(pitch1: Pitch, pitch2: Pitch): Interval;
  public static between(pitch1: PitchClass, pitch2: PitchClass): Interval;
  public static between(pitch1: number, pitch2: number): Interval;
  public static between(pitch1: any, pitch2: any) {
    let semitones = 0;
    if (pitch1 instanceof Pitch && pitch2 instanceof Pitch) {
      semitones = pitch2.midiNumber - pitch1.midiNumber;
    } else if (pitch1 instanceof PitchClass && pitch2 instanceof PitchClass) {
      semitones = normalizePitchClass(pitch2.semitones - pitch1.semitones);
    } else if (typeof pitch1 === 'number' && typeof pitch2 === 'number') {
      semitones = pitch2 - pitch1;
    } else {
      throw new Error(
        `Can't take the interval between ${pitch1} and ${pitch2}`,
      );
    }
    if (!(0 <= semitones && semitones < 12)) {
      semitones = normalizePitchClass(semitones);
    }
    // throw new Error("I haven't decided what to do about this case: #{pitch2} - #{pitch1} = #{semitones}")
    return Interval.fromSemitones(semitones);
  }
  public readonly semitones: number;
  public readonly accidentals: number;
  constructor(semitones: number, accidentals = 0) {
    this.semitones = semitones;
    this.accidentals = accidentals;
    const dict =
      intervalBySemitone[this.semitones] ||
      (intervalBySemitone[this.semitones] = {});
    if (dict[this.accidentals]) {
      // FIXME: can ts intern this way?
      return dict[this.accidentals];
    }
    dict[this.accidentals] = this;
  }

  // TODO: what is the ts equivalent of toString?
  public toString(): string {
    let s = IntervalNames[this.semitones];
    if (this.accidentals) {
      s = semitonesToAccidentalString(this.accidentals) + s;
    }
    return s;
  }

  public add(other: Interval): Interval {
    return new Interval(this.semitones + other.semitones);
  }
}

// new Interval interns into this
const intervalBySemitone: { [_: number]: { [_: number]: Interval } } = {};

export interface IntervalMap {
  [_: string]: Interval;
}

// tslint:disable-next-line variable-name
export const Intervals: IntervalMap = IntervalNames.reduce(
  (acc: IntervalMap, name, semitones) => {
    acc[name] = new Interval(semitones);
    return acc;
  },
  {},
);

// The interval class (integer in [0...12]) between two pitch class numbers
export function intervalClassDifference(
  a: PitchClassNumber,
  b: PitchClassNumber,
): number {
  return normalizePitchClass(b - a);
}
