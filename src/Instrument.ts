import * as _ from 'lodash';
import { Note } from './Note';

/** A (musical) Instrument has just a name. Its subclasses are more interesting.
 */
export class Instrument {
  constructor(readonly name: string) {}
}

/** A string instrument has an array of strings, each with an (open) pitch.
 */
// TODO: split out Tuning
// TODO: add a key?
export class StringInstrument extends Instrument {
  // TODO: This should probably be a Pitch[]
  public readonly stringPitches: Note[];
  public readonly stringCount: number;
  /** An array from [0…stringCount-1]. This is useful for enumerating over. */
  public readonly stringNumbers: number[];
  constructor(name: string, _stringPitches: Note[] | string) {
    super(name);
    const stringPitches =
      typeof _stringPitches === 'string'
        ? _stringPitches.split(/\s/).map(Note.fromString)
        : _stringPitches;
    this.stringPitches = stringPitches;
    this.stringCount = this.stringPitches.length;
    this.stringNumbers = stringPitches.map((_, i) => i);
  }
}

/** A fretted instrument is a string instrument that can be fretted.
 *
 * This API assumes that all strings have the same number of frets, and that
 * each string can be independently fretted. These assumptions don't actually
 * hold for all instruments.
 *
 * Fret 0 represents the open (un-fretted) string, or nut.
 */
export class FrettedInstrument extends StringInstrument {
  /** An array from [fretCount-1]. This is useful for enumerating over. */
  public readonly fretNumbers: number[];
  constructor(
    name: string,
    stringPitches: Note[] | string,
    readonly fretCount: number,
  ) {
    super(name, stringPitches);
    this.fretNumbers = _.times(fretCount + 1, Number);
  }

  /** Applies `callback` to each fret on each string. */
  public forEachStringFret(callback: (_: StringFret) => any) {
    this.stringNumbers.forEach((stringNumber) => {
      this.fretNumbers.forEach((fretNumber) => {
        callback({ stringNumber, fretNumber });
      });
    });
  }

  public pitchAt({ stringNumber, fretNumber }: StringFret) {
    return Note.fromMidiNumber(
      this.stringPitches[stringNumber].midiNumber + fretNumber,
    );
  }
}

/** A specific fret on a specific string. 0 represents an open string, or the
 * nut.
 */
export interface StringFret {
  readonly fretNumber: number;
  readonly stringNumber: number;
}

// Instruments, indexed by name, in standard tuning.
// tslint:disable: object-literal-sort-keys
// tslint:disable-next-line variable-name
export const Instruments = {
  Guitar: new FrettedInstrument('Guitar', 'E2 A2 D3 G3 B3 E4', 12),
  Violin: new StringInstrument('Violin', 'G D A E'),
  Viola: new StringInstrument('Viola', 'C G D A'),
  Cello: new StringInstrument('Cello', 'C G D A'),
};
