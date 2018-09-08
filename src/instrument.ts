import { Pitch } from './Pitch';

/** A (musical) Instrument currently has just a name, and subclasses.
 */
export class Instrument {
  constructor(readonly name: string) {}
}

/** A string instrument has an array of strings,
 */
export class StringInstrument extends Instrument {
  public readonly stringPitches: Pitch[];
  public readonly stringCount: number;
  /** An array from [0…stringCount - 1], useful for enumerating over. */
  public readonly stringNumbers: number[];
  constructor(name: string, _stringPitches: Pitch[] | string) {
    super(name);
    const stringPitches =
      typeof _stringPitches === 'string'
        ? _stringPitches.split(/\s/).map(Pitch.fromString)
        : _stringPitches;
    this.stringPitches = stringPitches;
    this.stringCount = this.stringPitches.length;
    this.stringNumbers = stringPitches.map((_, i) => i);
  }
}

export class FrettedInstrument extends StringInstrument {
  constructor(
    name: string,
    stringPitches: Pitch[] | string,
    readonly fretCount: number,
  ) {
    super(name, stringPitches);
    // if (typeof this.stringPitches[0] === 'string') {
    //   this.stringPitches = (() => {
    //     const result = [];
    //     for (name of Array.from(this.stringPitches)) {
    //       result.push(Pitch.fromString(name));
    //     }
    //     return result;
    //   })();
    // }
  }

  public forEachStringFret(fn: (_: StringFret) => any) {
    this.stringNumbers.forEach((stringNumber) => {
      // <= instead of <, since 0 represents the nut
      for (let fretNumber = 0; fretNumber <= this.fretCount; fretNumber++) {
        fn({ stringNumber, fretNumber });
      }
    });
  }

  public pitchAt({ stringNumber, fretNumber }: StringFret) {
    return Pitch.fromMidiNumber(
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

// TODO: make this a property of the instrument
// tslint:disable-next-line variable-name
export const FretNumbers = [0, 1, 2, 3, 4]; // includes nut

// tslint:disable-next-line variable-name
export const FretCount = FretNumbers.length - 1; // doesn't include nut

// const intervalPositionsFromRoot = function(
//   instrument,
//   rootPosition,
//   semitones
// ) {
//   const rootPitch = instrument.pitchAt(rootPosition);
//   const positions = [];
//   fretboard_positions_each(function(fingerPosition) {
//     if (
//       intervalClassDifference(rootPitch, instrument.pitchAt(fingerPosition)) !==
//       semitones
//     ) {
//       return;
//     }
//     return positions.push(fingerPosition);
//   });
//   return positions;
// };
