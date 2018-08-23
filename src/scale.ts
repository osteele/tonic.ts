import { Chord } from './chord';
import { chordFromRomanNumeral } from './chordProgression';
import { Interval } from './interval';
import { normalizePitchClass } from './names';
import { Pitch } from './pitch';
import { PitchClass } from './pitchClass';

// A scale is a named collection, either of intervals or notes.
export class Scale<T> {
  // noteNames(): string[] {
  //   if (this.tonicName == null) {
  //     throw new Error('only implemented for scales with tonics');
  //   }
  //   return SharpNoteNames.indexOf(this.tonicName) >= 0 && this.tonicName !== 'F'
  //     ? SharpNoteNames
  //     : FlatNoteNames;
  // }

  public static fromString(
    name: string,
  ): Scale<null> | Scale<Pitch> | Scale<PitchClass> {
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
  public readonly parent: Scale<T> | null;
  public readonly modes: Array<Scale<T>> = [];
  public readonly tonic: Pitch | PitchClass | null;
  public readonly intervals: Interval[];
  public readonly pitches: Pitch[] | PitchClass[] | null;
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
    tonic?: Pitch | string | null;
  }) {
    this.name = name;
    this.parent = typeof parent === 'string' ? scaleMap.get(parent)! : parent;
    this.pitchClasses = pitchClasses;
    this.intervals = this.pitchClasses.map(
      (semitones: number) => new Interval(semitones),
    );
    this.tonic = typeof tonic === 'string' ? asPitchOrPitchClass(tonic) : tonic;
    if (this.tonic instanceof Pitch) {
      this.pitches = this.intervals.map((interval: Interval) =>
        (this.tonic! as Pitch).add(interval),
      );
    }
    if (this.tonic instanceof PitchClass) {
      this.pitches = this.intervals.map((interval: Interval) =>
        (this.tonic! as PitchClass).add(interval),
      );
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

  public at(tonic: Pitch | string): Scale<Pitch> {
    return new Scale({
      name: this.name,
      pitchClasses: this.pitchClasses,
      tonic,
    });
  }

  public chords(options: { sevenths?: boolean } = {}): Array<Chord<Pitch>> {
    if (this.tonic == null) {
      throw new Error('only implemented for scales with tonics');
    }
    const degrees = [0, 2, 4];
    if (options.sevenths) {
      degrees.push(6);
    }
    const pitches = this.pitchClasses;
    const tonic = this.tonic as Pitch;
    return pitches.map((_, i) => {
      const modePitches = [...pitches.slice(i), ...pitches.slice(0, i)];
      const chordPitches = degrees.map((degree: number) =>
        tonic.add(Interval.fromSemitones(modePitches[degree])),
      );
      return Chord.fromPitches(chordPitches)!;
    });
  }

  public fromRomanNumeral(name: string): Chord<Pitch> {
    return chordFromRomanNumeral(name, this);
  }

  public progression(names: string): Array<Chord<Pitch>> {
    return names.split(/[\s+\-]+/).map((name) => this.fromRomanNumeral(name));
  }
}

function asPitchOrPitchClass(
  pitch: Pitch | PitchClass | string,
): Pitch | PitchClass {
  if (typeof pitch !== 'string') {
    return pitch;
  }
  try {
    return PitchClass.fromString(pitch);
  } catch (error) {
    return Pitch.fromString(pitch);
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
