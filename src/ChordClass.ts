import { Chord } from './Chord';
import { asInterval, Interval } from './Interval';
import { Note } from './Note';
import { NoteClass } from './NoteClass';
import { parsePitchLike, PitchLike } from './PitchLike';

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
 * suspensions, and additions. A `ChordClass` is to a `Chord` as a `NoteClass`
 * is to a `Note`.
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
    _root: Note | NoteClass | string,
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

class ChordClassAccessor extends ChordClass {
  public static addChord(chordClass: ChordClass) {
    const pitchKey = chordClass.intervals.map((i) => i.semitones).join(',');
    [
      chordClass.name,
      chordClass.fullName,
      ...chordClass.abbrs,
      pitchKey,
    ].forEach((key) => {
      if (key) {
        ChordClass.chordMap.set(key, chordClass);
      }
    });
  }
}

// tslint:disable:object-literal-sort-keys
const chordClassArray: ChordClass[] = [
  { name: 'Major', abbrs: ['', 'M'], intervals: '047' },
  { name: 'Minor', abbrs: ['m'], intervals: '037' },
  { name: 'Augmented', abbrs: ['+', 'aug'], intervals: '048' },
  { name: 'Diminished', abbrs: ['°', 'dim'], intervals: '036' },
  { name: 'Sus2', abbrs: ['sus2'], intervals: '027' },
  { name: 'Sus4', abbrs: ['sus4'], intervals: '057' },
  { name: '6th', abbrs: ['6', 'M6', 'M6', 'maj6'], intervals: '0479' },
  { name: 'Minor 6th', abbrs: ['m6', 'min6'], intervals: '0379' },
  { name: 'Dominant 7th', abbrs: ['7', 'dom7'], intervals: '047t' },
  { name: 'Augmented 7th', abbrs: ['+7', '7aug'], intervals: '048t' },
  { name: 'Diminished 7th', abbrs: ['°7', 'dim7'], intervals: '0369' },
  { name: 'Major 7th', abbrs: ['maj7', 'M7'], intervals: '047e' },
  { name: 'Minor 7th', abbrs: ['min7', 'm7'], intervals: '037t' },
  { name: 'Dominant 7b5', abbrs: ['7b5'], intervals: '046t' },
  // following is also half-diminished 7th
  { name: 'Minor 7th b5', abbrs: ['ø', 'Ø', 'm7b5'], intervals: '036t' },
  { name: 'Diminished Maj 7th', abbrs: ['°Maj7'], intervals: '036e' },
  {
    name: 'Minor-Major 7th',
    abbrs: ['min/maj7', 'min(maj7)'],
    intervals: '037e',
  },
  { name: 'Major 9th', abbrs: ['M9'], intervals: 'P1 M3 P5 M7 M9' },
  { name: 'Minor 9th', abbrs: ['m9'], intervals: 'P1 m3 P5 m7 M9' },
  // tslint:enable:object-literal-sort-keys
].map(({ name, abbrs, intervals }) => {
  const shortName = name
    .replace(/Major(?!$)/, 'Maj')
    .replace(/Minor(?!$)/, 'Min')
    .replace('Dominant', 'Dom')
    .replace('Diminished', 'Dim');
  const toneNames: { [_: string]: number } = { t: 10, e: 11 };
  const intervalInstances = intervals.match(/[PMm]/)
    ? intervals.split(' ').map(Interval.fromString)
    : intervals.match(/./g)!.map((c: string) => {
        const left = toneNames[c];
        const semitones = left != null ? left : Number(c);
        return Interval.fromSemitones(semitones);
      });
  return new ChordClass({
    abbrs,
    fullName: name,
    intervals: intervalInstances,
    name: shortName,
  });
});

chordClassArray.forEach(ChordClassAccessor.addChord);
