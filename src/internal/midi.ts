import { accidentalValues } from './accidentals';
import { NoteNames } from './pitchClassParser';

export type MidiNumber = number;

export const midi2name = (n: MidiNumber) =>
  `${NoteNames[(n + 12) % 12]}${Math.floor((n - 12) / 12)}`;

export function name2midi(name: string): MidiNumber {
  const m = name.match(/^([A-Ga-g])([♯#♭b𝄪𝄫]*)(-?\d+)/u);
  if (!m) {
    throw new Error(`“${name}” is not a note name`);
  }
  const [noteName, accidentals, octave] = m.slice(1);
  let pitch = NoteNames.indexOf(noteName);
  for (const c of accidentals) {
    pitch += accidentalValues[c];
  }
  pitch += 12 * (1 + Number(octave));
  return pitch;
}
