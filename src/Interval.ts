import * as _ from 'lodash';
import * as intervals from './internal/intervalParser';
import * as PitchClassParser from './internal/pitchClassParser';
import * as quality from './IntervalQuality';
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
    return this.naturalSemitones + quality.toSemitones(this.quality);
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
      quality.inverse(this.quality),
    );
  }

  get augment(): Interval | null {
    const perfect = this.natural.quality === IntervalQuality.Perfect;
    const q = quality.augment(this.quality, perfect);
    return q === null ? null : new Interval(this.naturalSemitones, q);
  }

  get diminish(): Interval | null {
    const perfect = this.natural.quality === IntervalQuality.Perfect;
    const q = quality.diminish(this.quality, perfect);
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
    return `${quality.toString(q)}${this.number}`;
  }

  // Override the default implementation, to get readable Jest messages
  public xtoJSON() {
    return `Interval::${this.toString()}`;
  }

  public add(other: Interval): Interval {
    return Interval.fromSemitones(
      this.naturalSemitones + other.naturalSemitones,
    );
  }
}

export function asInterval(n: Interval | number): Interval {
  return n instanceof Interval ? n : Interval.fromSemitones(n);
}

// TODO: change these to constants in a namespace?
// tslint:disable-next-line variable-name
export const Intervals: { [_: string]: Interval } = Interval.all;

// The interval class (integer in [0...12]) between two pitch class numbers
export function intervalClassDifference(a: number, b: number): number {
  return PitchClassParser.normalize(b - a);
}
