import { semitonesToAccidentalString } from './accidentals';
import { normalizePitchClass, PitchClassNumber } from './notation';
import { Note } from './Note';
import { NoteClass } from './NoteClass';
import { PitchLike } from './PitchLike';

// tslint:disable-next-line variable-name
export const ShortIntervalNames = 'P1 m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7 P8'.split(
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

/** The *quality* distinguishes between [major and
 * minor](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords)
 * intervals, and further augments or diminishes an interval. See [Wikipedia:
 * Interval quality](https://en.wikipedia.org/wiki/Interval_(music)#Quality).
 */
export enum IntervalQuality {
  DoublyDiminished,
  /** A
   * [diminished](https://en.wikipedia.org/wiki/Diminution#Diminution_of_intervals)
   * interval is narrowed by a chromatic semitone.
   */
  Diminished,
  /** A [minor](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords) interval. */
  Minor,
  Perfect,
  /** A [major](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords) interval. */
  Major,
  /** An
   * [augmented](https://en.wikipedia.org/wiki/Augmentation_(music)#Augmentation_of_intervals)
   * interval is widened by a chromatic semitone.
   */
  Augmented,
  DoublyAugmented,
}

// ar[semitones + 2] = IntervalQuality | null.
// ar[0 + 2] = null, since this is ambiguous among Major, Minor, and Perfect,
// depending on the interval's (diatonic) number.
const accidentalsToQuality: Array<IntervalQuality | null> = [
  IntervalQuality.DoublyDiminished,
  IntervalQuality.Diminished,
  null,
  IntervalQuality.Augmented,
  IntervalQuality.DoublyAugmented,
];

const qualityAbbrList: Array<[IntervalQuality, string]> = [
  [IntervalQuality.Major, 'M'],
  [IntervalQuality.Minor, 'm'],
  [IntervalQuality.Perfect, 'P'],
  [IntervalQuality.Augmented, 'A'],
  [IntervalQuality.Diminished, 'd'],
  [IntervalQuality.DoublyAugmented, 'AA'],
  [IntervalQuality.DoublyDiminished, 'dd'],
];

const abbrevToQuality = new Map<string, IntervalQuality>(
  qualityAbbrList.map(([abbr, q]) => [q, abbr] as [string, IntervalQuality]),
);

const qualityAbbrs = new Map<IntervalQuality, string>(
  qualityAbbrList.map(([abbr, q]) => [abbr, q] as [IntervalQuality, string]),
);

// Arrays of ar[diatonicNumber] to semitone counts. `Interval.fromString` uses
// these. They're initialized below.
const majorSemitones = new Array<number>(8);
const minorSemitones = new Array<number>(8);
const perfectSemitones = new Array<number>(8);

// Initialize majorSemitones, minorSemitones, and perfectSemitones from
// ShortIntervalNames.
ShortIntervalNames.forEach((name, semitones) => {
  const m = name.match(/(.)(\d)/);
  if (m) {
    const ar =
      ({ P: perfectSemitones, M: majorSemitones, m: minorSemitones } as {
        [_: string]: number[];
      })[m[1]] || [];
    const num = +m[2];
    ar[num] = semitones;
  }
});

const lowerCaseQualities: { [_: string]: number } = {
  a: 1,
  augmented: 1,
  d: -1,
  diminished: -1,
};

/** An Interval is the signed distance between two pitches or pitch classes. See
 * [Interval](https://en.wikipedia.org/wiki/Interval_(music)).
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
 */
// TODO: these are interval classes, limited to P1–P8. Allow complex intervals.
export class Interval {
  public static fromSemitones(semitones: number, accidentals = 0): Interval {
    return new Interval(semitones, accidentals);
  }

  public static fromString(name: string): Interval {
    let semitones = ShortIntervalNames.indexOf(name);
    if (semitones >= 0) {
      return Interval.fromSemitones(semitones);
    }
    semitones = LongIntervalNames.indexOf(name);
    if (semitones >= 0) {
      return Interval.fromSemitones(semitones);
    }
    const m =
      name.match(/^([AMPmd])(\d+)$/) ||
      name.match(/^(augmented|diminished)\s*(\d+)$/i);
    if (!m) {
      throw new Error(`No interval named ${name}`);
    }
    const qualityAbbr = m[1];
    const dn = Number(m[2]); // diatonic number
    if (dn > 8) {
      const simplex = Interval.fromString(`${qualityAbbr}${dn - 7}`);
      return new Interval(simplex.semitones + 12, simplex.accidentals);
    }
    const accidentals = lowerCaseQualities[qualityAbbr.toLowerCase()] || 0;
    semitones =
      (accidentals < 0 ? minorSemitones : majorSemitones)[dn] ||
      perfectSemitones[dn];
    return new Interval(semitones, accidentals);
  }

  public static between<T extends PitchLike>(a: T, b: T): Interval;
  public static between(a: number, b: number): Interval;
  public static between<T extends PitchLike | number>(a: T, b: T) {
    // FIXME: preserve the quality
    let semitones = 0;
    if (a instanceof Note && b instanceof Note) {
      semitones = b.midiNumber - a.midiNumber;
    } else if (a instanceof NoteClass && b instanceof NoteClass) {
      semitones = normalizePitchClass(b.semitones - a.semitones);
    } else if (typeof a === 'number' && typeof b === 'number') {
      semitones = b - a;
    } else {
      throw new Error(
        `Can't take the interval between different types ${a} and ${b}`,
      );
    }
    if (!(0 <= semitones && semitones < 12)) {
      semitones = normalizePitchClass(semitones);
    }
    return Interval.fromSemitones(semitones);
  }

  private static bySemitone = new Array<Map<number, Interval>>();

  /*** `semitones` is the semitones of the corresponding natural interval. The
   *   constructed interval is diminished or augmented from this by
   *   `accidentals`.
   */
  constructor(
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
    const m = ShortIntervalNames[dn > 12 ? dn % 12 : dn].match(/\d+/);
    return m && Number(m[0]) + (dn > 12 ? 7 * Math.floor(dn / 12) : 0);
  }

  /** Accidentals greater than double-augmented and double-diminished, and the
   * tritone, have a null quality.
   */
  get quality(): IntervalQuality | null {
    if (this.accidentals === 0) {
      const m = ShortIntervalNames[this.naturalSemitones % 12].match(/./);
      return (m && abbrevToQuality.get(m[0])) || null;
    }
    return accidentalsToQuality[this.accidentals + 2];
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

  // TODO: add properties number, quality (enum P M m A d; and doubles)
  // TODO: add methods natural, augment, diminish

  public toString(): string {
    if (this.naturalSemitones > 12) {
      return `${qualityAbbrs.get(this.quality!)}${this.number}`;
    }
    let s = ShortIntervalNames[this.naturalSemitones];
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
  return n instanceof Interval ? n : new Interval(n);
}

// TODO: change these to constants in a namespace?
// tslint:disable-next-line variable-name
export const Intervals: { [_: string]: Interval } = ShortIntervalNames.reduce(
  (acc: { [_: string]: Interval }, name, semitones) => {
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
