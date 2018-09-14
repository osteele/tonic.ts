import * as _ from 'lodash';
import * as quality from './IntervalQuality';
import { IntervalQuality } from './IntervalQuality';
import { Note } from './Note';
import * as intervals from './parsers/intervalParser';
import * as PitchClassParser from './parsers/pitchClassParser';
import { PitchClass } from './PitchClass';
import { PitchLike } from './PitchLike';

/** An Interval is the signed distance between two pitches or pitch classes.
 *
 * An instance of Interval is a musical *simple diatonic interval*, that spans
 * at most a single octave.
 *
 * Intervals that represent the same semitone span *and* accidental are
 * [interned](https://en.wikipedia.org/wiki/String_interning). interned. For
 * example, two instance of M3 are ===, but augmented P4 and diminished P5 are
 * distinct from each other and from TT. This enables the use of the ECMAScript
 * [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * to implement sets of intervals.
 *
 * See [Wikipedia: Interval
 * quality](https://en.wikipedia.org/wiki/Interval_(music)).
 */
export class Interval {
  public static readonly names: ReadonlyArray<string> =
    intervals.shortIntervalNames;
  public static readonly longNames: ReadonlyArray<string> =
    intervals.longIntervalNames;

  /** Semitones doesn't include narrowing or widening by quality. */
  public static fromSemitones(semitones: number): Interval {
    return new Interval(semitones, intervals.semitoneQualities[semitones % 12]);
  }

  public static fromString(name: string): Interval {
    const { semitones, quality } = intervals.parseInterval(name);
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
  }> = intervals.shortIntervalNames.reduce(
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
    const m = intervals.shortIntervalNames[dn > 12 ? dn % 12 : dn].match(/\d+/);
    return m && Number(m[0]) + (dn > 12 ? 7 * Math.floor(dn / 12) : 0);
  }

  /** The number of semitones. For example, A1 and m2 have one semitone. */
  get semitones(): number {
    return this.naturalSemitones + quality.toSemitones(this.quality);
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
        ? intervals.shortIntervalNames[semitones]
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
