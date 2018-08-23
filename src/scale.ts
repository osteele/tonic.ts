import { Chord } from './chord';
import { chordFromRomanNumeral } from './chordProgression';
import { Interval } from './interval';
import { normalizePitchClass } from './names';
import { asPitchLike, PitchLike } from './pitchLike';

// A scale is a named collection, either of intervals or notes.
export class Scale<T extends PitchLike | null> {
  // noteNames(): string[] {
  //   if (this.tonicName == null) {
  //     throw new Error('only implemented for scales with tonics');
  //   }
  //   return SharpNoteNames.indexOf(this.tonicName) >= 0 && this.tonicName !== 'F'
  //     ? SharpNoteNames
  //     : FlatNoteNames;
  // }

  public static fromString(name: string): Scale<PitchLike | null> {
    if (scaleMap.has(name)) {
      return scaleMap.get(name)!;
    }
    const match = name.match(/^([a-gA-G][#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/);
    const [tonicName, scaleName] = match ? match.slice(1) : [null, name];
    const scale = scaleMap.get(
      scaleName || (tonicName ? defaultScaleName : name),
    );
    if (!scale) {
      throw new Error(`No scale named ${scaleName}`);
    }
    return tonicName ? scale.at(tonicName) : scale;
  }

  public static get scales(): IterableIterator<Scale<null>> {
    return scaleMap.values();
  }

  public readonly name: string;
  public readonly pitchClasses: number[];
  public readonly parent: Scale<T | null> | null;
  public readonly modes: Array<Scale<T>> = [];
  public readonly tonic: T;
  public readonly intervals: Interval[];
  public readonly pitches: T[];
  constructor({
    name,
    pitchClasses,
    parent = null,
    modeNames = [],
    tonic = null,
  }: {
    name: string;
    pitchClasses: number[];
    parent?: Scale<T> | string | null;
    modeNames?: string[];
    tonic?: T;
  }) {
    this.name = name;
    this.parent = typeof parent === 'string' ? scaleMap.get(parent)! : parent;
    this.pitchClasses = pitchClasses;
    this.intervals = this.pitchClasses.map(
      (semitones: number) => new Interval(semitones),
    );
    this.tonic = tonic as T;
    if (this.tonic) {
      this.pitches = this.intervals.map((interval: Interval) =>
        (this.tonic as PitchLike).transposeBy(interval),
      ) as T[];
    }
    this.modes = modeNames.map(
      (modeName, i) =>
        new Scale({
          name: modeName,
          parent: this,
          pitchClasses: rotatePitchClasses(pitchClasses, i),
        }),
    );
  }

  /// Return a scale of the same scale class, at the specified tonic.
  public at(tonic: string): Scale<PitchLike>;
  public at<T extends PitchLike>(tonic: T): Scale<T>;
  public at(tonic: PitchLike | string): Scale<PitchLike> {
    return new Scale({
      name: this.name,
      pitchClasses: this.pitchClasses,
      tonic: asPitchLike(tonic),
    });
  }

  // TODO: can this return Array<Chord<T & PitchLike>>
  public chords(options: { sevenths?: boolean } = {}): Array<Chord<PitchLike>> {
    const tonic = this.tonic;
    if (!tonic) {
      throw new Error('only implemented for scales with tonics');
    }
    const degrees = [0, 2, 4];
    if (options.sevenths) {
      degrees.push(6);
    }
    const pitches = this.pitchClasses;
    return pitches.map((_, i) => {
      const modePitches = [...pitches.slice(i), ...pitches.slice(0, i)];
      const chordPitches = degrees.map((degree: number) =>
        tonic.transposeBy(Interval.fromSemitones(modePitches[degree])),
      );
      return Chord.fromPitches(chordPitches)!;
    });
  }
  public progression(names: string): Array<Chord<PitchLike>> {
    if (this.tonic == null) {
      throw new Error('only implemented for scales with tonics');
    }
    return names.split(/[\s+\-]+/).map((name) => this.fromRomanNumeral(name));
  }
  public fromRomanNumeral(name: string): Chord<PitchLike> {
    if (this.tonic == null) {
      throw new Error('only implemented for scales with tonics');
    }
    return chordFromRomanNumeral(name, this as Scale<PitchLike>);
  }
}

const diatonicMajorScaleName = 'Diatonic Major';
const majorPentatonicScaleName = 'Major Pentatonic';
const defaultScaleName = diatonicMajorScaleName;

// tslint:disable: object-literal-sort-keys
const scaleMap = ([
  {
    name: diatonicMajorScaleName,
    pitchClasses: [0, 2, 4, 5, 7, 9, 11],
    modeNames: 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(
      /\s/,
    ),
  },
  {
    name: 'Natural Minor',
    parent: diatonicMajorScaleName,
    pitchClasses: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    name: majorPentatonicScaleName,
    pitchClasses: [0, 2, 4, 7, 9],
    modeNames: [
      majorPentatonicScaleName,
      'Suspended Pentatonic',
      'Man Gong',
      'Ritusen',
      'Minor Pentatonic',
    ],
  },
  {
    name: 'Minor Pentatonic',
    parent: majorPentatonicScaleName,
    pitchClasses: [0, 3, 5, 7, 10],
  },
  {
    name: 'Melodic Minor',
    pitchClasses: [0, 2, 3, 5, 7, 9, 11],
    modeNames: [
      'Jazz Minor',
      'Dorian b2',
      'Lydian Augmented',
      'Lydian Dominant',
      'Mixolydian b6',
      'Semilocrian',
      'Superlocrian',
    ],
  },
  {
    name: 'Harmonic Minor',
    pitchClasses: [0, 2, 3, 5, 7, 8, 11],
    modeNames: [
      'Harmonic Minor',
      'Locrian #6',
      'Ionian Augmented',
      'Romanian',
      'Phrygian Dominant',
      'Lydian #2',
      'Ultralocrian',
    ],
  },
  {
    name: 'Blues',
    pitchClasses: [0, 3, 5, 6, 7, 10],
  },
  {
    name: 'Freygish',
    pitchClasses: [0, 1, 4, 5, 7, 8, 10],
  },
  {
    name: 'Whole Tone',
    pitchClasses: [0, 2, 4, 6, 8, 10],
  },
  {
    // 'Octatonic' is the classical name. It's the jazz 'Diminished' scale.
    name: 'Octatonic',
    pitchClasses: [0, 2, 3, 5, 6, 8, 9, 11],
  },
] as Array<{
  name: string;
  parent?: string;
  pitchClasses: number[];
  modeNames?: string[];
}>).reduce((dict, { name, parent = null, pitchClasses, modeNames }) => {
  const scale = new Scale({
    name,
    parent: parent && dict.get(parent)!,
    pitchClasses,
    modeNames,
  });
  dict.set(scale.name, scale);
  return dict;
}, new Map<string, Scale<null>>());
// tslint:enable: object-literal-sort-keys

function rotatePitchClasses(pitchClasses: number[], i: number) {
  i %= pitchClasses.length;
  pitchClasses = [...pitchClasses.slice(i), ...pitchClasses.slice(0, i)];
  return pitchClasses.map((pc) => normalizePitchClass(pc - pitchClasses[0]));
}

// Indexed by scale degree
// tslint:disable-next-line variable-name
const FunctionNames = [
  'Tonic',
  'Supertonic',
  'Mediant',
  'Subdominant',
  'Dominant',
  'Submediant',
  'Subtonic',
  'Leading',
];

function parseChordNumeral(name: string) {
  return {
    augmented: name.match(/\+/),
    degree: 'i ii iii iv v vi vii'.indexOf(name.match(/[iv+]/i)![1]) + 1,
    diminished: name.match(/°/),
    flat: name.match(/^[♭b]/),
    major: name === name.toUpperCase(),
  };
}

// FunctionQualities =
//   major: 'I ii iii IV V vi vii°'.split(/\s/).map parseChordNumeral
//   minor: 'i ii° bIII iv v bVI bVII'.split(/\s/).map parseChordNumeral

// tslint:disable-next-line variable-name
export const ScaleDegreeNames = '1 ♭2 2 ♭3 3 4 ♭5 5 ♭6 6 ♭7 7'
  .split(/\s/)
  .map((d) => d.replace(/(\d)/, '$1\u0302'));
