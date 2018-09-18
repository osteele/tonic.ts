import { Chord } from './Chord';
import { ChordQuality } from './ChordQuality';
import { PitchLike } from './PitchLike';
import { Key } from './Scale';

const chordRomanNumerals = 'I II III IV V VI VII'.split(/\s+/);

// tslint:disable object-literal-sort-keys quotemark
const romanNumeralModifiers: { [_: string]: string } = {
  "+": "aug",
  "°": "dim",
  "6": "maj6",
  "7": "dom7",
  "+7": "+7",
  "°7": "°7",
  "ø7": "ø7",
};
// tslint:enable

export function chordFromRomanNumeral<T extends PitchLike>(
  name: string,
  scale: Key<T>,
): Chord<T> {
  const match = name.match(/^(♭?)(i+v?|vi*)(.*?)([acd]?)$/i);
  if (!match) {
    throw new Error(`“${name}” is not a chord roman numeral`);
  }
  if (scale.tonic == null) {
    throw new Error('requires a scale with a tonic');
  }
  // FIXME: use `accidental`
  // tslint:disable-next-line no-dead-store
  const [accidental, romanNumeral, modifiers, inversion] = match.slice(1);
  const degree = chordRomanNumerals.indexOf(romanNumeral.toUpperCase());
  if (!(degree >= 0)) {
    throw new Error('Not a chord name');
  }
  let chordType = chordTypeFromCapitalization(romanNumeral);
  if (modifiers) {
    // throw new Error("Unimplemented: mixing minor chords with chord modifiers") unless chordType == 'Major'
    chordType = romanNumeralModifiers[modifiers];
    if (!chordType) {
      throw new Error(`unknown chord modifier “${modifiers}”`);
    }
  }
  // TODO: 9, 13, sharp, natural
  // FIXME: remove the cast
  const chord = ChordQuality.fromString(chordType).at(scale.notes[degree]);
  return inversion ? chord.invert(inversion) : chord;
}

function chordTypeFromCapitalization(romanNumeral: string): string {
  if (romanNumeral === romanNumeral.toUpperCase()) {
    return 'Major';
  }
  if (romanNumeral === romanNumeral.toLowerCase()) {
    return 'Minor';
  }
  throw new Error(
    `Roman numeral chords can't be mixed case in “${romanNumeral}”`,
  );
}
