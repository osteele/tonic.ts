import { AccidentalValues } from './accidentals';

export type PitchClassName = string;
export type PitchClass = number;

// tslint:disable-next-line variable-name
export const SharpNoteNames = 'C C♯ D D♯ E F F♯ G G♯ A A♯ B'.split(/\s/);

// tslint:disable-next-line variable-name
export const FlatNoteNames = 'C D♭ D E♭ E F G♭ G A♭ A B♭ B'.split(/\s/);

// tslint:disable-next-line variable-name
export const NoteNames = SharpNoteNames;

export namespace PitchClass {
  export function asNoteName(
    pitch: PitchClassName | PitchClass,
    { sharp, flat }: { sharp?: boolean; flat?: boolean } = {},
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

  export function fromScientificNotation(name: string): PitchClass {
    const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(\d+)$/i);
    if (!match) {
      throw new Error(`“${name}” is not in scientific notation`);
    }
    const [naturalName, accidentals, octave] = match.slice(1);
    let pitch =
      SharpNoteNames.indexOf(naturalName.toUpperCase()) +
      12 * (1 + Number(octave));
    for (const c of accidentals) {
      pitch += AccidentalValues[c];
    }
    return pitch;
  }

  export function fromHelmholtzNotation(name: string): PitchClass {
    const match = name.match(/^([A-G][#♯b♭𝄪𝄫]*)(,*)('*)$/i);
    if (!match) {
      throw new Error(`“${name}” is not in Helmholtz notation`);
    }
    const [pitchClassName, commas, apostrophes] = match.slice(1);
    const pitchClassNumber = fromString(pitchClassName, false);
    const octave =
      4 -
      Number(pitchClassName === pitchClassName.toUpperCase()) -
      commas.length +
      apostrophes.length;
    return 12 * octave + pitchClassNumber;
  }

  export function toScientificNotation(midiNumber: number): string {
    const octave = Math.floor(midiNumber / 12) - 1;
    return getPitchClassName(normalizePitchClass(midiNumber)) + octave;
  }

  export function fromString(name: PitchClassName, normal = true): PitchClass {
    const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i);
    if (!match) {
      throw new Error(`“${name}” is not a pitch class name`);
    }
    const [naturalName, accidentals] = match.slice(1);
    let pitch = SharpNoteNames.indexOf(naturalName.toUpperCase());
    for (const c of accidentals) {
      pitch += AccidentalValues[c];
    }
    if (normal) {
      pitch = normalizePitchClass(pitch);
    }
    return pitch;
  }
}

export function getPitchClassName(pitchClass: PitchClass) {
  return NoteNames[pitchClass];
}

export const normalizePitchClass = (pitchClass: PitchClass) =>
  ((pitchClass % 12) + 12) % 12;

export const pitchToPitchClass = normalizePitchClass;
