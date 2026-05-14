import { accidentalValues } from './accidentals';

/** A pitch class, represented as a number.
 *
 * See also [[PitchClass]], which represents pitch class as an class instance.
 *
 * See Wikipedia [pitch class](https://en.wikipedia.org/wiki/Pitch_class).
 */
export type PitchClassNumber = number;

// tslint:disable-next-line variable-name
export const SharpNoteNames = 'C C♯ D D♯ E F F♯ G G♯ A A♯ B'.split(/\s/);

// tslint:disable-next-line variable-name
export const FlatNoteNames = 'C D♭ D E♭ E F G♭ G A♭ A B♭ B'.split(/\s/);

// tslint:disable-next-line variable-name
export const NoteNames = SharpNoteNames;

export function asNoteName(
  pitch: string | PitchClassNumber,
  { sharp, flat }: { sharp?: boolean; flat?: boolean } = {},
): string {
  if (typeof pitch === 'string') {
    return pitch;
  }
  const pitchClass = fromNumber(pitch);
  const flatName = FlatNoteNames[pitchClass];
  const sharpName = SharpNoteNames[pitchClass];
  let name = sharp ? sharpName : flatName;
  if (flat && sharp && flatName !== sharpName) {
    name = `${flatName}/\n${sharpName}`;
  }
  return name;
}

export function accidentalsToSemitones(accidentals: string): number {
  let n = 0;
  for (const c of accidentals) {
    n += accidentalValues[c];
  }
  return n;
}

export function fromScientificNotation(
  name: string,
): { midiNumber: number; accidentals: number } {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(-?\d+)$/iu);
  if (!match) {
    throw new Error(`“${name}” is not in scientific notation`);
  }
  const [naturalName, accidentals, octave] = match.slice(1);
  return {
    accidentals: accidentalsToSemitones(accidentals),
    midiNumber:
      SharpNoteNames.indexOf(naturalName.toUpperCase()) +
      accidentalsToSemitones(accidentals) +
      12 * (1 + Number(octave)),
  };
}

export function fromHelmholtzNotation(
  name: string,
): { midiNumber: number; accidentals: number } {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(,*)('*)$/iu);
  if (!match) {
    throw new Error(`“${name}” is not in Helmholtz notation`);
  }
  const [pitchClassName, accidentals, commas, apostrophes] = match.slice(1);
  const pitchClassNumber = fromString(pitchClassName + accidentals, false);
  const octave =
    4 -
    Number(pitchClassName === pitchClassName.toUpperCase()) -
    commas.length +
    apostrophes.length;
  return {
    accidentals: accidentalsToSemitones(accidentals),
    midiNumber: 12 * octave + pitchClassNumber,
  };
}

export function toScientificNotation(midiNumber: number): string {
  const octave = Math.floor(midiNumber / 12) - 1;
  return getPitchClassName(normalize(midiNumber)) + octave;
}

export function fromString(name: string, normal = true): PitchClassNumber {
  const match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/iu);
  if (!match) {
    throw new Error(`“${name}” is not a pitch class name`);
  }
  const [naturalName, accidentals] = match.slice(1);
  let pitch = SharpNoteNames.indexOf(naturalName.toUpperCase());
  for (const c of accidentals) {
    pitch += accidentalValues[c];
  }
  if (normal) {
    pitch = normalize(pitch);
  }
  return pitch;
}

// TODO: rename or remove this
export function getPitchClassName(pitchClass: PitchClassNumber) {
  return NoteNames[pitchClass];
}

export const normalize = (pitchClass: PitchClassNumber) =>
  ((pitchClass % 12) + 12) % 12;

export const fromNumber = normalize;
