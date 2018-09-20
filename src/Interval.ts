import * as _ from 'lodash';
import * as intervals from './internal/intervalParser';
import {
  qualityDegreeSemitones,
  semitoneQualities,
} from './internal/intervalParser';
import * as PitchClassParser from './internal/pitchClassParser';
import { IntervalQuality } from './IntervalQuality';
import { Note } from './Note';
import { PitchClass } from './PitchClass';
import { PitchLike } from './PitchLike';

/** An Interval is the distance between two notes.
 *
 * An interval has a (possibly null) *number*, a (possibly null) *quality* (e.g.
 * *major*, *minor*, *perfect*, etc.), and a semitone count (which is never
 * null).
 *
 * The semitone count is an integer, and assumes [twelve-tone equal
 * temperament](https://en.wikipedia.org/wiki/Equal_temperament).
 *
 * An interval may be *simple* (if it is eight scale degrees or fewer), or
 * *complex*.
 *
 * Only simple and complex *tritones* (TT) have a null number and quality.
 *
 * Two intervals are equal (and therefore `===`) if their numbers and qualities
 * are equal (or, for tritones, their semitone counts are equal). For example,
 * TT, augmented P4, and diminished P5 all have the same semitone count, but are
 * distinct intervals. Intervals can be tested for [enharmonic
 * equivalence](https://en.wikipedia.org/wiki/Enharmonic) by comparing their
 * semitone counts, *e.g.* `i1.semitones ==== i2.semitones`.
 *
 * Intervals are [interned](https://en.wikipedia.org/wiki/String_interning).
 * interned. This enables the use of the ECMAScript
 * [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * to implement sets of intervals.
 *
 * See [Wikipedia: Interval
 * quality](https://en.wikipedia.org/wiki/Interval_(music)).
 */
export class Interval {
  public static readonly names: ReadonlyArray<string> =
    intervals.shorthandNames;
  public static readonly longNames: ReadonlyArray<string> =
    intervals.longIntervalNames;

  /** Semitones doesn't include narrowing or widening by quality. */
  public static fromSemitones(semitones: number): Interval {
    return new Interval(semitones, intervals.semitoneQualities[semitones % 12]);
  }

  public static fromNumber(num: number, quality: IntervalQuality): Interval {
    const n = 1 + ((num - 1) % 8);
    const isPerfect = semitoneQualities[n] === IntervalQuality.Perfect;
    const pq = IntervalQuality.closestNatural(quality, isPerfect);
    const semitones = qualityDegreeSemitones.get(pq)!.get(n);
    if (semitones === undefined) {
      throw new Error(
        `Not an interval: ${IntervalQuality.toString(quality)}${num}`,
      );
    }
    return new Interval(semitones + 12 * Math.floor((num - 1) / 8), quality);
  }

  public static fromString(name: string): Interval {
    const { degree, semitones, quality } = intervals.parseInterval(name);
    const perfectDegree = degree && [0, 3, 4].indexOf((degree - 1) % 7) >= 0;
    function isMajorMinor(q: IntervalQuality | null) {
      return q === IntervalQuality.Major || q === IntervalQuality.Minor;
    }
    if (
      perfectDegree
        ? isMajorMinor(quality)
        : quality === IntervalQuality.Perfect
    ) {
      throw new Error(`No interval named ${name}`);
    }
    return new Interval(semitones, quality);
  }

  public static between<T extends PitchLike>(a: T, b: T): Interval;
  public static between(a: number, b: number): Interval;
  public static between<T extends PitchLike | number>(a: T, b: T) {
    // FIXME: preserve the quality?
    let semitones = 0;
    if (a instanceof Note && b instanceof Note) {
      semitones = Math.abs(b.midiNumber - a.midiNumber);
    } else if (a instanceof PitchClass && b instanceof PitchClass) {
      semitones = PitchClassParser.normalize(b.semitones - a.semitones);
    } else if (typeof a === 'number' && typeof b === 'number') {
      semitones = Math.abs(b - a);
    } else {
      throw new Error(
        `Can't take the interval between different types ${a} and ${b}`,
      );
    }
    return Interval.fromSemitones(semitones);
  }

  private static readonly instances = new Array<
    Map<IntervalQuality | null, Interval>
  >();

  // tslint:disable-next-line:member-ordering
  public static readonly all: Readonly<{
    [_: string]: Interval;
  }> = intervals.shorthandNames.reduce(
    (acc: { [_: string]: Interval }, name, semitones) => {
      acc[name] = Interval.fromSemitones(semitones);
      return acc;
    },
    {},
  );

  /*** `semitones` is the semitones of the corresponding natural interval. The
   *   constructed interval is diminished or augmented from this by
   *   `accidentals`.
   */
  private constructor(
    private readonly naturalSemitones: number,
    readonly quality: IntervalQuality | null = null,
  ) {
    let dict = Interval.instances[naturalSemitones];
    if (!dict) {
      dict = new Map<IntervalQuality | null, Interval>();
      Interval.instances[naturalSemitones] = dict;
    }
    const instance = dict.get(quality);
    if (instance) {
      return instance;
    }
    dict.set(quality, this);
    return this;
  }

  get name(): string {
    return this.toString();
  }

  /** The diatonic number, within the C major scale. For example M2, m2, d2, and
   * D2 all have a diatonic number of 2. The tritone’s number is null.
   */
  get number(): number | null {
    const dn = this.naturalSemitones;
    const m = intervals.shorthandNames[dn > 12 ? dn % 12 : dn].match(/\d+/);
    return m && Number(m[0]) + (dn > 12 ? 7 * Math.floor(dn / 12) : 0);
  }

  /** The number of semitones. For example, A1 and m2 have one semitone. */
  get semitones(): number {
    return this.naturalSemitones + IntervalQuality.toSemitones(this.quality);
  }

  get isSimple(): boolean {
    return this.naturalSemitones <= 12;
  }

  get isComplex(): boolean {
    return !this.isSimple;
  }

  /** The inverse interval, such that this interval and its inverse add to
   * unison. For example, M3 and m6 are inverses, as are m3 and M6, P4 and P5,
   * and TT and TT.
   */
  get inverse(): Interval {
    return new Interval(
      12 - this.naturalSemitones,
      IntervalQuality.inverse(this.quality),
    );
  }

  get augment(): Interval | null {
    const perfect = this.natural.quality === IntervalQuality.Perfect;
    const q = IntervalQuality.augment(this.quality, perfect);
    return q === null ? null : new Interval(this.naturalSemitones, q);
  }

  get diminish(): Interval | null {
    const perfect = this.natural.quality === IntervalQuality.Perfect;
    const q = IntervalQuality.diminish(this.quality, perfect);
    return q === null ? null : new Interval(this.naturalSemitones, q);
  }

  get natural(): Interval {
    return Interval.fromSemitones(this.naturalSemitones);
  }

  public toString(): string {
    const q = this.quality;
    if (q === null) {
      // Tritone, or complex interval that includes one
      const semitones = this.semitones;
      return semitones === 6
        ? intervals.shorthandNames[semitones]
        : _.times((semitones - 6) / 12, () => 'P8').join('+') + '+TT';
    }
    return `${IntervalQuality.toString(q)}${this.number}`;
  }

  public add(other: Interval): Interval {
    if (this.number !== null && other.number !== null) {
      const num = this.number + other.number - 1;
      let q = IntervalQuality.add(this.quality!, other.quality!);
      if (
        q === IntervalQuality.Perfect &&
        [1, 4, 5].indexOf(1 + ((num - 1) % 8)) < 0
      ) {
        q = IntervalQuality.Major;
      }
      if (q !== null) {
        return Interval.fromNumber(num, q);
      }
    }
    return Interval.fromSemitones(
      this.naturalSemitones + other.naturalSemitones,
    );
  }
}

export function asInterval(n: Interval | number): Interval {
  return n instanceof Interval ? n : Interval.fromSemitones(n);
}

export namespace Intervals {
  // simple diatonic intervals
  export const P1 = Interval.fromString('P1');
  export const m2 = Interval.fromString('m2');
  export const M2 = Interval.fromString('M2');
  export const m3 = Interval.fromString('m3');
  export const M3 = Interval.fromString('M3');
  export const P4 = Interval.fromString('P4');
  export const TT = Interval.fromString('TT');
  export const P5 = Interval.fromString('P5');
  export const m6 = Interval.fromString('m6');
  export const M6 = Interval.fromString('M6');
  export const m7 = Interval.fromString('m7');
  export const M7 = Interval.fromString('M7');
  export const P8 = Interval.fromString('P8');

  // augmented and diminished intervals
  // FIXME:
  // export const a1 = Interval.fromString('a1');
  export const d2 = Interval.fromString('d2');
  export const A2 = Interval.fromString('A2');
  export const d3 = Interval.fromString('d3');
  export const A3 = Interval.fromString('A3');
  export const d4 = Interval.fromString('d4');
  export const A4 = Interval.fromString('A4');
  export const d5 = Interval.fromString('d5');
  export const A5 = Interval.fromString('A5');
  export const d6 = Interval.fromString('d6');
  export const A6 = Interval.fromString('A6');
  export const d7 = Interval.fromString('d7');
  export const A7 = Interval.fromString('A7');
  export const d8 = Interval.fromString('d8');
  export const A8 = Interval.fromString('A8');

  // compound intervals
  export const m9 = Interval.fromString('m9');
  export const M9 = Interval.fromString('M9');
  export const m10 = Interval.fromString('m10');
  export const M10 = Interval.fromString('M10');
  export const P11 = Interval.fromString('P11');
  export const P12 = Interval.fromString('P12');
  export const m13 = Interval.fromString('m13');
  export const M13 = Interval.fromString('M13');
  export const m14 = Interval.fromString('m14');
  export const M14 = Interval.fromString('M14');
  export const P15 = Interval.fromString('P15');

  export const d9 = Interval.fromString('d9');
  export const A9 = Interval.fromString('A9');
  export const d10 = Interval.fromString('d10');
  export const A10 = Interval.fromString('A10');
  export const d11 = Interval.fromString('d11');
  export const A11 = Interval.fromString('A11');
  export const d12 = Interval.fromString('d12');
  export const A12 = Interval.fromString('A12');
  export const d13 = Interval.fromString('d13');
  export const A13 = Interval.fromString('A13');
  export const d14 = Interval.fromString('d14');
  export const A14 = Interval.fromString('A14');
  export const d15 = Interval.fromString('d15');
  export const A15 = Interval.fromString('A15');
}

// The interval class (integer in [0...12]) between two pitch class numbers
export function intervalClassDifference(a: number, b: number): number {
  return PitchClassParser.normalize(b - a);
}
