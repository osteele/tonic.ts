import { ChordQuality } from './ChordQuality';
import { rotateArray } from './internal/utils';
import { Interval } from './Interval';
import { Note } from './Note';
import { PitchClass } from './PitchClass';
import { PitchLike } from './PitchLike';

const chordNameRegex1 = /^([a-gA-G],*'*[#b♯♭𝄪𝄫]*)\s*(7)$/;
const chordNameRegex2 = /^([a-gA-G],*'*[#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/;

const inversionNames = ['a', 'c', 'd'];

/** A set of notes or note classes; equivalently, a set of intervals, and an
 * optional root. For example, "E Major" and "C Minor" name chords.
 *
 * A `Chord<Note>` is a set of specific notes: for example, {C4, E4, G4}. A
 * `Chord<PitchClass>` is a set of note *classes*, without specifying octaves.
 *
 * See [Wikipedia: Chord](https://en.wikipedia.org/wiki/Chord_(music)).
 */
export class Chord<T extends PitchLike> {
  /** Return either a `Chord` or a `ChordQuality`, depending on whether `name`
   * specifies a pitch or pitch class (e.g. "E Major" or "E7 Major"), or just a
   * chord class (e.g. "Major").
   */
  public static fromString(
    name: string,
  ): Chord<Note> | Chord<PitchClass> | ChordQuality {
    const match = name.match(chordNameRegex1) || name.match(chordNameRegex2);
    if (!match) {
      throw new Error(`“${name}” is not a chord name`);
    }
    const rootName = match[1];
    const className = match[2];
    const chordClass = ChordQuality.fromString(className || 'Major');
    return rootName ? chordClass.at(Note.fromString(rootName)) : chordClass;
  }

  /** Return the Chord that matches a set of notes. The first note should be
   * the root.
   */
  public static fromPitches<T extends PitchLike>(
    pitches: ReadonlyArray<T>,
  ): Chord<T> {
    const root = pitches[0];
    const intervals = pitches.map((pitch) => Interval.between(root, pitch));
    return ChordQuality.fromIntervals(intervals).at(root);
  }

  /** The preferred abbreviation. */
  public readonly abbr: string;
  public readonly abbrs: ReadonlyArray<string>;
  public readonly notes: ReadonlyArray<T>;
  public readonly intervals: ReadonlyArray<Interval>;
  constructor(
    readonly chordClass: ChordQuality,
    readonly root: T,
    readonly inversion = 0,
  ) {
    this.abbrs = this.chordClass.abbrs.map((abbr: string) =>
      `${this.root.toString()} ${abbr}`.replace(/\s+$/, ''),
    );
    this.abbr = this.abbrs[0];
    this.intervals = this.chordClass.intervals;
    this.notes = this.chordClass.intervals.map((interval: Interval) =>
      this.root.transposeBy(interval),
    ) as T[];

    // degrees = (1 + 2 * pitchClass.semitones for pitchClass in [0..@pitchClasses.length])
    // degrees[1] = {'Sus2':2, 'Sus4':4}[@name] || degrees[1]
    // degrees[3] = 6 if @name.match /6/

    if (this.inversion) {
      this.intervals = rotateArray(this.intervals, this.inversion);
      this.notes = rotateArray(this.notes, this.inversion);
    }
  }

  get name(): string {
    return `${this.root.toString()} ${this.chordClass.name}`;
  }

  get fullName(): string {
    return `${this.root.toString()} ${this.chordClass.fullName}`;
  }

  // @pitchClasses = rotateArray(@pitchClasses, @inversion)

  // @components = for interval, index in intervals
  //   semitones = interval.semitones
  //   name = IntervalNames[semitones]
  //   degree = degrees[index]
  //   if semitones == 0
  //     name = 'R'
  //   else unless Number(name.match(/\d+/)?[0]) == degree
  //     name = "A#{degree}" if Number(IntervalNames[semitones - 1].match(/\d+/)?[0]) == degree
  //     name = "d#{degree}" if Number(IntervalNames[semitones + 1].match(/\d+/)?[0]) == degree
  //   name

  // at: (root) ->
  //   @_clone root: root

  // degreeName: (degreeIndex) ->
  //   @components[degreeIndex]

  // enharmonicizeTo: (scale) ->
  //   @_clone root: @root.enharmonicizeTo(scale)

  public invert(inversionKey: number | string): Chord<T> {
    let inversion: number;
    if (typeof inversionKey === 'string') {
      const ix = inversionNames.indexOf(inversionKey);
      if (ix < 0) {
        throw new Error(`Unknown inversion “${inversionKey}”`);
      }
      inversion = 1 + ix;
    } else {
      inversion = inversionKey;
    }
    return new Chord(this.chordClass, this.root, inversion);
  }
}
