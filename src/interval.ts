import { semitonesToAccidentalString } from './accidentals';
import { normalizePitchClass, PitchClassNumber } from './names';
import { Pitch } from './pitch';
import { PitchClass } from './pitchClass';
import { PitchLike } from './pitchLike';

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

/** An Interval is the signed distance between two notes.
 *
 * Intervals that represent the same semitone span *and* accidental are interned.
 * Thus, two instance of M3 are ===, but sharp P4 and flat P5 are distinct from
 * each other and from TT.
 */
// FIXME these are interval classes, not intervals
export class Interval {
  public static fromSemitones(semitones: number, accidentals = 0): Interval {
    return new Interval(semitones, accidentals);
  }

  public static fromString(name: string): Interval {
    const semitones = IntervalNames.indexOf(name);
    if (!(semitones >= 0)) {
      throw new Error(`No interval named ${name}`);
    }
    return new Interval(semitones);
  }

  public static between<T extends PitchLike>(a: T, b: T): Interval;
  public static between(a: number, b: number): Interval;
  public static between<T extends PitchLike | number>(a: T, b: T) {
    let semitones = 0;
    if (a instanceof Pitch && b instanceof Pitch) {
      semitones = b.midiNumber - a.midiNumber;
    } else if (a instanceof PitchClass && b instanceof PitchClass) {
      semitones = normalizePitchClass(b.semitones - a.semitones);
    } else if (typeof a === 'number' && typeof b === 'number') {
      semitones = b - a;
    } else {
      throw new Error(`Can't take the interval between ${a} and ${b}`);
    }
    if (!(0 <= semitones && semitones < 12)) {
      semitones = normalizePitchClass(semitones);
    }
    return Interval.fromSemitones(semitones);
  }

  private static bySemitone = new Array<Map<number, Interval>>();

  constructor(
    public readonly semitones: number,
    public readonly accidentals = 0,
  ) {
    let dict = Interval.bySemitone[semitones];
    if (!dict) {
      dict = new Map<number, Interval>();
      Interval.bySemitone[semitones] = dict;
    }
    const interval = dict.get(accidentals);
    if (interval) {
      return interval;
    }
    dict.set(accidentals, this);
  }

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

export function asInterval(n: Interval | number): Interval {
  return n instanceof Interval ? n : new Interval(n);
}

export interface IntervalMap {
  [_: string]: Interval;
}

// TODO: change these to constants in a namespace
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
