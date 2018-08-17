import { Interval } from './interval';
import { Pitch } from './pitch';
import { rotateArray } from './utils';

// tslint:disable-next-line variable-name
const ChordNameRe = /^([a-gA-G],*'*[#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/;

// tslint:disable-next-line variable-name
const InversionNames = 'acd'.split(/./);

// An instance of ChordClass represents the intervals of the chord,
// without the root. For example, Dom7. It represents the quality, suspensions, and additions.
export class ChordClass {
  public static fromIntervals(intervals: Interval[]): ChordClass {
    const semitones = intervals.map((interval: Interval) => interval.semitones);
    const key = semitones
      .sort((a: number, b: number) => (a > b ? 1 : b > a ? -1 : 0))
      .join(',');
    const chordClass = ChordClassMap[key];
    if (!chordClass) {
      throw new Error(`Couldn't find chord class with intervals ${intervals}`);
    }
    return chordClass;
  }

  public static fromString(name: string): ChordClass {
    const chord = ChordClassMap[name];
    if (!chord) {
      throw new Error(`“${name}” is not a chord name`);
    }
    return chord;
  }
  public readonly name: string;
  public readonly fullName: string;
  public readonly abbr: string;
  public readonly abbrs: string[];
  public readonly intervals: Interval[];
  constructor({
    name,
    fullName,
    abbrs,
    intervals,
  }: {
    name: string;
    fullName: string;
    abbrs: string[];
    intervals: Interval[];
  }) {
    this.name = name;
    this.fullName = fullName;
    this.abbrs = abbrs;
    this.intervals = intervals;
    this.abbr = this.abbrs[0];
  }

  public at(root: Pitch | string): Chord {
    return new Chord({ chordClass: this, root });
  }
}

// A chord may be:
// - a torsor (e.g. Major)
// - a scale degree (e.g. I)
// - a tonicized scale (e.g. C Major)
export class Chord {
  public static fromString(name: string): Chord | ChordClass {
    const match = name.match(ChordNameRe);
    if (!match) {
      throw new Error(`“${name}” is not a chord name`);
    }
    const rootName = match[1];
    const className = match[2];
    const chordClass = ChordClass.fromString(className || 'Major');
    return rootName ? chordClass.at(Pitch.fromString(rootName)) : chordClass;
  }

  public static fromPitches(pitches: Pitch[]): Chord {
    const root = pitches[0];
    const intervals = pitches.map((pitch: Pitch) =>
      Interval.between(root, pitch),
    );
    return ChordClass.fromIntervals(intervals).at(root);
  }
  public readonly chordClass: ChordClass;
  public readonly root: Pitch;
  public readonly inversion: number;
  public readonly name: string;
  public readonly fullName: string;
  public readonly abbr: string;
  public readonly abbrs: string[];
  public readonly intervals: Interval[];
  public readonly pitches: Pitch[];
  constructor({
    chordClass,
    root,
    inversion = 0,
  }: {
    chordClass: ChordClass;
    root: Pitch | string;
    inversion?: number;
  }) {
    this.chordClass = chordClass;
    this.root = typeof root === 'string' ? Pitch.fromString(root) : root;
    this.inversion = inversion;

    this.name = `${this.root.toString()} ${this.chordClass.name}`;
    this.fullName = `${this.root.toString()} ${this.chordClass.fullName}`;
    this.abbrs = this.chordClass.abbrs.map((abbr: string) =>
      `${this.root.toString()} ${abbr}`.replace(/\s+$/, ''),
    );
    this.abbr = this.abbrs[0];
    this.intervals = this.chordClass.intervals;
    this.pitches = this.chordClass.intervals.map((interval: Interval) =>
      this.root.toPitch().transposeBy(interval),
    );

    // degrees = (1 + 2 * pitchClass.semitones for pitchClass in [0..@pitchClasses.length])
    // degrees[1] = {'Sus2':2, 'Sus4':4}[@name] || degrees[1]
    // degrees[3] = 6 if @name.match /6/

    if (this.inversion) {
      this.intervals = rotateArray(this.intervals, this.inversion);
      this.pitches = rotateArray(this.pitches, this.inversion);
    }
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

  // _clone(extend) {
  //   const attrs = {
  //     inversion: this.inversion,
  //     chordClass: this.chordClass,
  //     root: this.root
  //   };
  //   for (let key in extend) { const value = extend[key]; attrs[key] = value; }
  //   return new Chord(attrs);
  // }

  // at: (root) ->
  //   @_clone root: root

  // degreeName: (degreeIndex) ->
  //   @components[degreeIndex]

  // enharmonicizeTo: (scale) ->
  //   @_clone root: @root.enharmonicizeTo(scale)

  public invert(inversionKey: number | string): Chord {
    let inversion: number;
    if (typeof inversionKey === 'string') {
      const ix = InversionNames.indexOf(inversionKey);
      if (ix < 0) {
        throw new Error(`Unknown inversion “${inversionKey}”`);
      }
      inversion = 1 + ix;
    } else {
      inversion = inversionKey;
    }
    return new Chord({
      chordClass: this.chordClass,
      root: this.root,
      inversion,
    });
  }
}

// tslint:disable-next-line variable-name
export const ChordClasses: ChordClass[] = [
  { name: 'Major', abbrs: ['', 'M'], intervals: '047' },
  { name: 'Minor', abbrs: ['m'], intervals: '037' },
  { name: 'Augmented', abbrs: ['+', 'aug'], intervals: '048' },
  { name: 'Diminished', abbrs: ['°', 'dim'], intervals: '036' },
  { name: 'Sus2', abbrs: ['sus2'], intervals: '027' },
  { name: 'Sus4', abbrs: ['sus4'], intervals: '057' },
  { name: 'Dominant 7th', abbrs: ['7', 'dom7'], intervals: '047t' },
  { name: 'Augmented 7th', abbrs: ['+7', '7aug'], intervals: '048t' },
  { name: 'Diminished 7th', abbrs: ['°7', 'dim7'], intervals: '0369' },
  { name: 'Major 7th', abbrs: ['maj7'], intervals: '047e' },
  { name: 'Minor 7th', abbrs: ['min7'], intervals: '037t' },
  { name: 'Dominant 7b5', abbrs: ['7b5'], intervals: '046t' },
  // following is also half-diminished 7th
  { name: 'Minor 7th b5', abbrs: ['ø', 'Ø', 'm7b5'], intervals: '036t' },
  { name: 'Diminished Maj 7th', abbrs: ['°Maj7'], intervals: '036e' },
  {
    name: 'Minor-Major 7th',
    abbrs: ['min/maj7', 'min(maj7)'],
    intervals: '037e',
  },
  { name: '6th', abbrs: ['6', 'M6', 'M6', 'maj6'], intervals: '0479' },
  { name: 'Minor 6th', abbrs: ['m6', 'min6'], intervals: '0379' },
].map(({ name, abbrs, intervals }) => {
  const fullName = name;
  name = name
    .replace(/Major(?!$)/, 'Maj')
    .replace(/Minor(?!$)/, 'Min')
    .replace('Dominant', 'Dom')
    .replace('Diminished', 'Dim');
  const toneNames: { [_: string]: number } = { t: 10, e: 11 };
  const intervalInstances = intervals.match(/./g)!.map((c: string) => {
    const left = toneNames[c];
    const semitones = left != null ? left : Number(c);
    return Interval.fromSemitones(semitones);
  });
  return new ChordClass({
    name,
    fullName,
    abbrs,
    intervals: intervalInstances,
  });
});

// `ChordClassMap` is indexed by name, abbreviation, and pitch classes
// tslint:disable-next-line variable-name
export const ChordClassMap: { [_: string]: ChordClass } = ChordClasses.reduce(
  (acc: { [_: string]: ChordClass }, chordClass) => {
    [chordClass.name, chordClass.fullName, ...chordClass.abbrs].forEach(
      (name: string) => {
        acc[name] = chordClass;
      },
    );
    acc[chordClass.intervals.map((i) => i.semitones).join(',')] = chordClass;
    return acc;
  },
  {},
);
