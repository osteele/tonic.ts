import { Chord } from './Chord';
import { chordFromRomanNumeral } from './chordProgressions';
import { Interval } from './Interval';
import { PitchClass } from './PitchClass';
import { asPitchLike, PitchLike } from './PitchLike';

interface GenericScaleConstructorOptions {
  name: string;
  pitchClasses: number[];
  parent?: Scale | string | null;
  modeNames?: string[];
}

interface ScaleConstructorOptions<T extends PitchLike>
  extends GenericScaleConstructorOptions {
  tonic: T;
}

// A scale is a named collection, either of intervals or notes.
class GenericScale<T extends PitchLike | null> {
  // noteNames(): string[] {
  //   if (this.tonicName == null) {
  //     throw new Error('only implemented for scales with tonics');
  //   }
  //   return SharpNoteNames.indexOf(this.tonicName) >= 0 && this.tonicName !== 'F'
  //     ? SharpNoteNames
  //     : FlatNoteNames;
  // }

  public readonly name: string;
  public readonly pitchClasses: number[];
  /** For a minor scale, this is the relative major. For a mode, it's the
   * deriving scale.
   */
  public readonly parent: Scale | null;
  public readonly modes: Scale[] = [];
  public readonly intervals: Interval[];
  constructor({
    name,
    pitchClasses,
    parent = null,
    modeNames = [],
  }: GenericScaleConstructorOptions) {
    this.name = name;
    this.parent =
      typeof parent === 'string' ? Scale.fromString(parent) : parent;
    this.pitchClasses = pitchClasses;
    this.intervals = this.pitchClasses.map(
      (semitones: number) => new Interval(semitones),
    );
    this.modes = modeNames.map(
      (modeName, i) =>
        new Scale({
          name: modeName,
          parent: this as Scale,
          pitchClasses: rotatePitchClasses(pitchClasses, i),
        }),
    );
  }

  /** Return a specific scale of the same scale class, at the specified tonic. */
  public at(tonic: string): SpecificScale<PitchLike>;
  public at<T extends PitchLike>(tonic: T): SpecificScale<T>;
  public at(tonic: PitchLike | string): SpecificScale<PitchLike> {
    return new SpecificScale({
      name: this.name,
      pitchClasses: this.pitchClasses,
      tonic: asPitchLike(tonic),
    });
  }
}

/** `Scale` is a named sequence of intervals from an (unspecified) tonic. For
 * example, "Diatonic Major" names a scale.
 */
export class Scale extends GenericScale<null> {
  public static fromString(name: string): Scale {
    const scale = Scale.scaleMap.get(name);
    if (!scale) {
      throw new Error(`No scale named ${name}`);
    }
    return scale;
  }

  public static addScale(scale: Scale) {
    Scale.scaleMap.set(scale.name, scale);
  }

  public static get scales(): IterableIterator<Scale> {
    return Scale.scaleMap.values();
  }

  private static readonly scaleMap = new Map<string, Scale>();
}

/** `SpecificScale<PitchLike>` is a scale that starts at a specific pitch or pitch
 * class.
 */
export class SpecificScale<T extends PitchLike> extends GenericScale<T> {
  public static fromString(name: string): SpecificScale<PitchLike> {
    const match = name.match(/^([a-gA-G][#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/);
    if (match) {
      const [tonicName, scaleName] = match.slice(1);
      const scale = Scale.fromString(scaleName || defaultScaleName);
      if (scale) {
        return scale.at(tonicName);
      }
    }
    throw new Error(`No scale named ${name}`);
  }

  public readonly tonic: T;
  public readonly pitches: T[];

  constructor(options: ScaleConstructorOptions<T>) {
    super(options);
    this.tonic = options.tonic;
    this.pitches = this.intervals.map((interval) =>
      options.tonic.transposeBy(interval),
    ) as T[];
  }

  public chords(options: { sevenths?: boolean } = {}): Array<Chord<PitchLike>> {
    const tonic = this.tonic;
    const degrees = [0, 2, 4];
    if (options.sevenths) {
      degrees.push(6);
    }
    const pitches = this.pitchClasses;
    return pitches.map((_, i) => {
      const modePitches = [...pitches.slice(i), ...pitches.slice(0, i)];
      const chordPitches = degrees.map((degree) =>
        tonic.transposeBy(Interval.fromSemitones(modePitches[degree])),
      );
      return Chord.fromPitches(chordPitches)!;
    });
  }

  public progression(names: string): Array<Chord<T>> {
    return names.split(/[\s+\-]+/).map((name) => this.fromRomanNumeral(name));
  }

  public fromRomanNumeral(name: string): Chord<T> {
    return chordFromRomanNumeral(name, this);
  }
}

const diatonicMajorScaleName = 'Diatonic Major';
const majorPentatonicScaleName = 'Major Pentatonic';
const defaultScaleName = diatonicMajorScaleName;

// tslint:disable: object-literal-sort-keys
const scaleMap = [
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
].forEach((options) => Scale.addScale(new Scale(options)));
// tslint:enable: object-literal-sort-keys

function rotatePitchClasses(pitchClasses: number[], i: number) {
  i %= pitchClasses.length;
  pitchClasses = [...pitchClasses.slice(i), ...pitchClasses.slice(0, i)];
  return pitchClasses.map((pc) =>
    PitchClass.normalize(pc - pitchClasses[0]),
  );
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
const ScaleDegreeNames = '1 ♭2 2 ♭3 3 4 ♭5 5 ♭6 6 ♭7 7'
  .split(/\s/)
  .map((d) => d.replace(/(\d)/, '$1\u0302'));
