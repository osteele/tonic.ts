import { AccidentalValues } from './accidentals';
import { Interval } from './interval';
import { NoteNames, SharpNoteNames } from './notes';
import { Pitch } from './pitches';

export type PitchClassName = string;
export type PitchClassNumber = number;

export class PitchClass {
  name: string;
  semitones: number;
  constructor({ semitones, name }: { name?: string; semitones: number }) {
    this.semitones = semitones;
    this.name = name || NoteNames[semitones];
  }

  toString(): string {
    return this.name;
  }

  add(other: Interval): PitchClass {
    return PitchClass.fromSemitones(this.semitones + other.semitones);
  }

  // enharmonicizeTo: (scale) ->
  //   for name, semitones in scale.noteNames()
  //     return new PitchClass {name, semitones} if semitones == @semitones
  //   return this

  toPitch(octave = 0): Pitch {
    return Pitch.fromMidiNumber(this.semitones + 12 * octave);
  }

  toPitchClass() {
    return this;
  }

  static fromSemitones(semitones: number): PitchClass {
    semitones = normalizePitchClass(semitones);
    return new PitchClass({ semitones });
  }

  static fromString(name: string): PitchClass {
    return PitchClass.fromSemitones(parsePitchClass(name));
  }
}

export function parsePitchClass(
  name: PitchClassName,
  normal = true
): PitchClassNumber {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i);
  if (!match) {
    throw new Error(`“${name}” is not a pitch class name`);
  }
  const [naturalName, accidentals] = match.slice(1);
  let pitch = SharpNoteNames.indexOf(naturalName.toUpperCase());
  for (let c of accidentals) {
    pitch += AccidentalValues[c];
  }
  if (normal) {
    pitch = normalizePitchClass(pitch);
  }
  return pitch;
}

export function getPitchClassName(pitchClass: PitchClassNumber) {
  return NoteNames[pitchClass];
}

export const normalizePitchClass = (pitchClass: PitchClassNumber) =>
  ((pitchClass % 12) + 12) % 12;

export const pitchToPitchClass = normalizePitchClass;
