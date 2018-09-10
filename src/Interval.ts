import { IntervalQuality } from './IntervalQuality';
import { Note } from './Note';
import { NoteClass } from './NoteClass';
import { semitonesToAccidentalString } from './parsers/accidentals';
import {
  accidentalToIntervalQuality,
  intervalQualityName,
  longIntervalNames,
  parseInterval,
  shortIntervalNames,
} from './parsers/intervals';
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
// TODO: Some of these methods assume or create simple intervals.
export class Interval {
  public static names = shortIntervalNames;
  public static longNames = longIntervalNames;
  public static fromSemitones(semitones: number, accidentals = 0): Interval {
    return new Interval(semitones, accidentals);
  }

  public static fromString(name: string): Interval {
    const { semitones, accidentals } = parseInterval(name);
    return Interval.fromSemitones(semitones, accidentals || 0);
  }

  public static between<T extends PitchLike>(a: T, b: T): Interval;
  public static between(a: number, b: number): Interval;
  public static between<T extends PitchLike | number>(a: T, b: T) {
    // FIXME: preserve the quality
    let semitones = 0;
    if (a instanceof Note && b instanceof Note) {
      semitones = b.midiNumber - a.midiNumber;
    } else if (a instanceof NoteClass && b instanceof NoteClass) {
      semitones = PitchClass.normalize(b.semitones - a.semitones);
    } else if (typeof a === 'number' && typeof b === 'number') {
      semitones = b - a;
    } else {
      throw new Error(
        `Can't take the interval between different types ${a} and ${b}`,
      );
    }
    if (!(0 <= semitones && semitones < 12)) {
      semitones = PitchClass.normalize(semitones);
    }
    return Interval.fromSemitones(semitones);
  }

  private static bySemitone = new Array<Map<number, Interval>>();

  // tslint:disable-next-line:member-ordering
  public static all = shortIntervalNames.reduce(
    (acc: { [_: string]: Interval }, name, semitones) => {
      acc[name] = new Interval(semitones);
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
    readonly accidentals = 0,
  ) {
    return this.interned(naturalSemitones, accidentals, this);
  }

  get name(): string {
    return this.toString();
  }

  /** The diatonic number, within the C major scale. For example M2, m2, d2, and
   * D2 all have a diatonic number of 2. The tritone’s number is null.
   */
  get number(): number | null {
    const dn = this.naturalSemitones;
    const m = shortIntervalNames[dn > 12 ? dn % 12 : dn].match(/\d+/);
    return m && Number(m[0]) + (dn > 12 ? 7 * Math.floor(dn / 12) : 0);
  }

  /** Accidentals greater than double-augmented and double-diminished, and the
   * tritone, have a null quality.
   */
  get quality(): IntervalQuality | null {
    return accidentalToIntervalQuality(this.accidentals, this.naturalSemitones);
  }

  /** The number of semitones. For example, A1 and m2 have one semitone. */
  get semitones(): number {
    return this.naturalSemitones + this.accidentals;
  }

  /** The inverse interval, such that this interval and its inverse add to
   * unison. For example, M3 and m6 are inverses, as are m3 and M6, P4 and P5,
   * and TT and TT.
   */
  get inverse(): Interval {
    return Interval.fromSemitones(
      12 - this.naturalSemitones,
      -this.accidentals,
    );
  }

  get augment(): Interval {
    return Interval.fromSemitones(this.naturalSemitones, this.accidentals + 1);
  }

  get diminish(): Interval {
    return Interval.fromSemitones(this.naturalSemitones, this.accidentals - 1);
  }

  get natural(): Interval {
    return Interval.fromSemitones(this.naturalSemitones);
  }

  public toString(): string {
    if (this.naturalSemitones > 12) {
      return `${intervalQualityName(this.quality!)}${this.number}`;
    }
    let s = shortIntervalNames[this.naturalSemitones];
    if (this.accidentals) {
      s = semitonesToAccidentalString(this.accidentals) + s;
    }
    return s;
  }

  // Override the default implementation, to get readable Jest messages
  public toJSON() {
    return `Interval::${this.toString()}`;
  }

  public add(other: Interval): Interval {
    return Interval.fromSemitones(
      this.naturalSemitones + other.naturalSemitones,
    );
  }

  private interned<T extends Interval | null>(
    semitones: number,
    accidentals: number,
    instance: T,
  ): T;
  private interned<T extends Interval | null>(
    semitones: number,
    accidentals: number,
    instance: Interval | null,
  ): Interval | null {
    let dict = Interval.bySemitone[semitones];
    if (!dict) {
      dict = new Map<number, Interval>();
      Interval.bySemitone[semitones] = dict;
    }
    const interval = dict.get(accidentals);
    if (interval) {
      return interval;
    }
    if (instance) {
      dict.set(accidentals, this);
    }
    return instance;
  }
}

export function asInterval(n: Interval | number): Interval {
  return n instanceof Interval ? n : Interval.fromSemitones(n);
}

// TODO: change these to constants in a namespace?
// tslint:disable-next-line variable-name
export const Intervals: { [_: string]: Interval } = Interval.all;

// The interval class (integer in [0...12]) between two pitch class numbers
export function intervalClassDifference(a: PitchClass, b: PitchClass): number {
  return PitchClass.normalize(b - a);
}
