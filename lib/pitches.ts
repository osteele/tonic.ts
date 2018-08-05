import { AccidentalValues } from './accidentals';
import { Interval } from './interval';
import { FlatNoteNames, NoteNames, SharpNoteNames } from './notes';
import {
  getPitchClassName,
  normalizePitchClass,
  parsePitchClass,
  PitchClass,
  PitchClassName,
  PitchClassNumber,
  pitchToPitchClass
} from './pitch_class';

type MidiNumber = number;

// really returns the name of a pitch *class*
function getPitchName(
  pitch: PitchClassName | PitchClassNumber,
  { sharp, flat }: { sharp?: boolean; flat?: boolean } = {}
): string {
  if (typeof pitch === 'string') {
    return pitch;
  }
  const pitchClass = pitchToPitchClass(pitch);
  const flatName = FlatNoteNames[pitchClass];
  const sharpName = SharpNoteNames[pitchClass];
  let name = sharp ? sharpName : flatName;
  if (flat && sharp && flatName !== sharpName) {
    name = `${flatName}/\n${sharpName}`;
  }
  return name;
}

function pitchFromScientificNotation(name: string): PitchClassNumber {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(\d+)$/i);
  if (!match) {
    throw new Error(`“${name}” is not in scientific notation`);
  }
  const [naturalName, accidentals, octave] = match.slice(1);
  let pitch =
    SharpNoteNames.indexOf(naturalName.toUpperCase()) +
    12 * (1 + Number(octave));
  for (let c of accidentals) {
    pitch += AccidentalValues[c];
  }
  return pitch;
}

function pitchFromHelmholtzNotation(name: string): PitchClassNumber {
  const match = name.match(/^([A-G][#♯b♭𝄪𝄫]*)(,*)('*)$/i);
  if (!match) {
    throw new Error(`“${name}” is not in Helmholtz notation`);
  }
  const [pitchClassName, commas, apostrophes] = match.slice(1);
  const pitchClassNumber = parsePitchClass(pitchClassName, false);
  const octave =
    4 -
    Number(pitchClassName === pitchClassName.toUpperCase()) -
    commas.length +
    apostrophes.length;
  return 12 * octave + pitchClassNumber;
}

function toScientificNotation(midiNumber: number): string {
  const octave = Math.floor(midiNumber / 12) - 1;
  return getPitchClassName(normalizePitchClass(midiNumber)) + octave;
}

const midi2name = (n: MidiNumber) =>
  `${NoteNames[(n + 12) % 12]}${Math.floor((n - 12) / 12)}`;

function name2midi(name: string): MidiNumber {
  const m = name.match(/^([A-Ga-g])([♯#♭b𝄪𝄫]*)(-?\d+)/);
  if (!m) {
    throw new Error(`“${name}” is not a note name`);
  }
  const [noteName, accidentals, octave] = m.slice(1);
  let pitch = NoteNames.indexOf(noteName);
  for (let c of accidentals) {
    pitch += AccidentalValues[c];
  }
  pitch += 12 * (1 + Number(octave));
  return pitch;
}

export class Pitch {
  name: string;
  midiNumber: number;
  constructor({ name, midiNumber }: { name?: string; midiNumber: number }) {
    this.name = name || toScientificNotation(midiNumber);
    this.midiNumber = midiNumber;
  }

  toString(): string {
    return this.name;
  }

  add(other: Interval): Pitch {
    return new Pitch({ midiNumber: this.midiNumber + other.semitones });
  }

  toPitch(): Pitch {
    return this;
  }

  toPitchClass(): PitchClass {
    return PitchClass.fromSemitones(pitchToPitchClass(this.midiNumber));
  }

  transposeBy(interval: Interval): Pitch {
    return new Pitch({ midiNumber: this.midiNumber + interval.semitones });
  }

  static fromMidiNumber(midiNumber: number): Pitch {
    return new Pitch({ midiNumber });
  }

  static fromString(name: string): Pitch {
    const midiNumber = (name.match(/\d/)
      ? pitchFromScientificNotation
      : pitchFromHelmholtzNotation)(name);
    return new Pitch({ midiNumber, name });
  }
}

export const Pitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
  pitch => new Pitch({ midiNumber: pitch })
);

//
// Exports
//

export {
  NoteNames,
  FlatNoteNames,
  SharpNoteNames,
  midi2name,
  name2midi,
  pitchFromScientificNotation,
  getPitchName
};
