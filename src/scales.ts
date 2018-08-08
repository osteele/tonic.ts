import { Chord } from './chords';
import { chordFromRomanNumeral } from './chord_progressions';
import { Interval } from './interval';
import { normalizePitchClass } from './names';
import { Pitch } from './pitches';
import { PitchClass } from './pitch_class';

// A scale is a named collection, either of intervals or notes.
export class Scale {
  name: string;
  pitchClasses: number[];
  parent: Scale | null;
  modes: Scale[] = [];
  tonic: Pitch | PitchClass | null;
  intervals: Interval[];
  pitches: Pitch[] | PitchClass[] | null;
  constructor({
    name,
    pitchClasses,
    parent = null,
    modeNames = [],
    tonic = null
  }: {
    name: string;
    pitchClasses: number[];
    parent?: Scale | string | null;
    modeNames?: string[];
    tonic?: Pitch | string | null;
  }) {
    this.name = name;
    this.parent = typeof parent === 'string' ? Scales[parent] : parent;
    this.pitchClasses = pitchClasses;
    this.intervals = this.pitchClasses.map(
      (semitones: number) => new Interval(semitones)
    );
    this.tonic = typeof tonic === 'string' ? toPitchOrPitchClass(tonic) : tonic;
    if (this.tonic instanceof Pitch) {
      this.pitches = this.intervals.map((interval: Interval) =>
        (this.tonic! as Pitch).add(interval)
      );
    }
    if (this.tonic instanceof PitchClass) {
      this.pitches = this.intervals.map((interval: Interval) =>
        (this.tonic! as PitchClass).add(interval)
      );
    }
    this.modes = modeNames.map(
      (name, i) =>
        new Scale({
          name: name,
          parent: this,
          pitchClasses: rotatePitchClasses(pitchClasses, i)
        })
    );
  }

  at(tonic: Pitch | string): Scale {
    return new Scale({
      name: this.name,
      pitchClasses: this.pitchClasses,
      tonic
    });
  }

  chords(options: { sevenths?: boolean } = {}): Chord[] {
    if (this.tonic == null) {
      throw new Error('only implemented for scales with tonics');
    }
    const degrees = [0, 2, 4];
    if (options.sevenths) {
      degrees.push(6);
    }
    const pitches = this.pitchClasses;
    const tonic = this.tonic! as Pitch;
    return pitches.map((_, i) => {
      const modePitches = [...pitches.slice(i), ...pitches.slice(0, i)];
      const chordPitches = degrees.map((degree: number) =>
        tonic.add(Interval.fromSemitones(modePitches[degree]))
      );
      return Chord.fromPitches(chordPitches);
    });
  }

  // noteNames(): string[] {
  //   if (this.tonicName == null) {
  //     throw new Error('only implemented for scales with tonics');
  //   }
  //   return SharpNoteNames.indexOf(this.tonicName) >= 0 && this.tonicName !== 'F'
  //     ? SharpNoteNames
  //     : FlatNoteNames;
  // }

  static fromString(name: string): Scale {
    let tonicName = null;
    let scaleName = null;
    const match = name.match(/^([a-gA-G][#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/);
    if (match) {
      [tonicName, scaleName] = match.slice(1);
    }
    if (!scaleName) {
      scaleName = 'Diatonic Major';
    }
    let scale = Scales[scaleName];
    if (!scale) {
      throw new Error(`No scale named ${scaleName}`);
    }
    if (tonicName) {
      scale = scale.at(tonicName);
    }
    return scale;
  }

  fromRomanNumeral(name: string): Chord {
    return chordFromRomanNumeral(name, this);
  }

  progression(names: string): Chord[] {
    return names.split(/[\s+\-]+/).map(name => this.fromRomanNumeral(name));
  }
}

function toPitchOrPitchClass(
  pitch: Pitch | PitchClass | string
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

export const Scales: { [_: string]: Scale } = (<
  {
    name: string;
    parent?: string;
    pitchClasses: number[];
    modeNames?: string[];
  }[]
>[
  {
    name: 'Diatonic Major',
    pitchClasses: [0, 2, 4, 5, 7, 9, 11],
    modeNames: 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(
      /\s/
    )
  },
  {
    name: 'Natural Minor',
    parent: 'Diatonic Major',
    pitchClasses: [0, 2, 3, 5, 7, 8, 10]
  },
  {
    name: 'Major Pentatonic',
    pitchClasses: [0, 2, 4, 7, 9],
    modeNames: [
      'Major Pentatonic',
      'Suspended Pentatonic',
      'Man Gong',
      'Ritusen',
      'Minor Pentatonic'
    ]
  },
  {
    name: 'Minor Pentatonic',
    parent: 'Major Pentatonic',
    pitchClasses: [0, 3, 5, 7, 10]
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
      'Superlocrian'
    ]
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
      'Ultralocrian'
    ]
  },
  {
    name: 'Blues',
    pitchClasses: [0, 3, 5, 6, 7, 10]
  },
  {
    name: 'Freygish',
    pitchClasses: [0, 1, 4, 5, 7, 8, 10]
  },
  {
    name: 'Whole Tone',
    pitchClasses: [0, 2, 4, 6, 8, 10]
  },
  {
    // 'Octatonic' is the classical name. It's the jazz 'Diminished' scale.
    name: 'Octatonic',
    pitchClasses: [0, 2, 3, 5, 6, 8, 9, 11]
  }
]).reduce(
  (
    acc: { [_: string]: Scale },
    { name, parent = null, pitchClasses, modeNames }
  ) => {
    const scale = new Scale({
      name,
      parent: parent && acc[parent],
      pitchClasses,
      modeNames
    });
    acc[scale.name] = scale;
    acc[scale.name.replace(/\s/g, '')] = scale;
    return acc;
  },
  {}
);

function rotatePitchClasses(pitchClasses: number[], i: number) {
  i %= pitchClasses.length;
  pitchClasses = [...pitchClasses.slice(i), ...pitchClasses.slice(0, i)];
  return pitchClasses.map(pc => normalizePitchClass(pc - pitchClasses[0]));
}

// Indexed by scale degree
const Functions = [
  'Tonic',
  'Supertonic',
  'Mediant',
  'Subdominant',
  'Dominant',
  'Submediant',
  'Subtonic',
  'Leading'
];

function parseChordNumeral(name: string) {
  const chord = {
    degree: 'i ii iii iv v vi vii'.indexOf(name.match(/[iv+]/i)![1]) + 1,
    major: name === name.toUpperCase(),
    flat: name.match(/^[♭b]/),
    diminished: name.match(/°/),
    augmented: name.match(/\+/)
  };
  return chord;
}

// FunctionQualities =
//   major: 'I ii iii IV V vi vii°'.split(/\s/).map parseChordNumeral
//   minor: 'i ii° bIII iv v bVI bVII'.split(/\s/).map parseChordNumeral

export const ScaleDegreeNames = '1 ♭2 2 ♭3 3 4 ♭5 5 ♭6 6 ♭7 7'
  .split(/\s/)
  .map(d => d.replace(/(\d)/, '$1\u0302'));
