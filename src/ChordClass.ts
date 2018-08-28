import { asInterval, Chord, Interval, parsePitchLike, Pitch, PitchClass, PitchLike } from './index';

export interface ChordClassConstructorOptions {
  name: string;
  fullName?: string;
  abbrs?: string[];
  intervals: Interval[];
  inversion?: number | null;
}

const rootIntervalNumberToInversion: { [_: number]: number } = {
  3: 1,
  5: 2,
};

/** An instance of `ChordClass` represents the intervals of the chord, without
 * the root. For example, Major, or Dom7. It represents the quality,
 * suspensions, and additions. A `ChordClass` is to a `Chord` as a `PitchClass`
 * is to a `Pitch`.
 */
export class ChordClass {
  /** Return the ChordClass that matches a set of intervals. */
  public static fromIntervals(_intervals: Interval[] | number[]): ChordClass {
    const intervals = (_intervals as Array<Interval | number>).map(asInterval);
    const semitones = intervals.map((interval: Interval) => interval.semitones);
    const key = semitones.sort().join(',');
    const instance = ChordClass.chordMap.get(key);
    if (!instance) {
      throw new Error(`Couldn't find chord class with intervals ${intervals}`);
    }
    const inversion = rootIntervalNumberToInversion[intervals[0].number || 0];
    return inversion ? instance.invert(inversion) : instance;
  }

  /** Return a `ChordClass` identified by name, e.g. "Major". */
  public static fromString(name: string): ChordClass {
    const instance = ChordClass.chordMap.get(name);
    if (!instance) {
      throw new Error(`“${name}” is not a chord name`);
    }
    return instance;
  }

  // `Chords` is indexed by name, abbreviation, and pitch classes. Pitch class are
  // represented as comma-separated semitone numbers, e.g. '0,4,7' to represent a
  // major triad.
  protected static readonly chordMap = new Map<string, ChordClass>();

  public readonly name: string;
  public readonly fullName: string | null;
  public readonly abbr: string | null;
  public readonly abbrs: string[];
  /** Intervals relative to the root. */
  public readonly intervals: Interval[];
  public readonly inversion: number | null;
  constructor(private readonly options: ChordClassConstructorOptions) {
    this.name = options.name;
    this.fullName = options.fullName ? options.fullName : null;
    this.abbrs = options.abbrs || [];
    this.intervals = options.intervals;
    this.abbr = this.abbrs[0];
    this.inversion = options.inversion || null;
    // for use in invert:
    this.options = options;
  }

  /** Return a chord with these intervals relative to `root`. */
  public at<T extends PitchLike>(root: T): Chord<T>;
  public at(root: string): Chord<PitchLike>;
  public at<T extends PitchLike | string>(
    _root: Pitch | PitchClass | string,
  ): Chord<PitchLike> {
    const root = typeof _root === 'string' ? parsePitchLike(_root) : _root;
    return new Chord(this, root);
  }

  public invert(inversion: number): ChordClass {
    // TODO:
    // if (this.inversion) {
    //   throw Exception('unimplemented: invert an inverted chord');
    // }
    return new ChordClass({ inversion, ...this.options });
  }
}

/** A set of intervals from a root. A chord has a name, a set of intervals, a
 * set pitches (or pitch classes), and an inversion. For example, "E Major" and
 * "C Minor" name chords.
 */
