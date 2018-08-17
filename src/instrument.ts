import { Pitch } from './pitch';

export class Instrument {
  public readonly name: string;
  public readonly fretted: boolean;
  public readonly stringPitches: Pitch[];
  public readonly fretCount: number | null;
  public readonly strings: number;
  public readonly stringCount: number;
  public readonly stringNumbers: number[];
  constructor({
    name,
    fretted = false,
    stringPitches,
    fretCount,
  }: {
    name: string;
    fretted?: boolean;
    stringPitches: Pitch[] | string;
    fretCount?: number;
  }) {
    this.name = name;
    this.fretted = fretted;
    this.fretCount = fretCount || null;
    this.stringPitches =
      typeof stringPitches === 'string'
        ? stringPitches.split(/\s/).map(Pitch.fromString)
        : stringPitches;
    // if (typeof this.stringPitches[0] === 'string') {
    //   this.stringPitches = (() => {
    //     const result = [];
    //     for (name of Array.from(this.stringPitches)) {
    //       result.push(Pitch.fromString(name));
    //     }
    //     return result;
    //   })();
    // }
    this.strings = this.stringCount = this.stringPitches.length;
    this.stringNumbers = __range__(0, this.strings, false);
  }

  public forEachFingerPosition(fn: (_: FretPosition) => any) {
    return this.stringNumbers.map((stringNumber) =>
      __range__(0, this.fretCount || 0, true).map((fret) =>
        fn({ string: stringNumber, fret }),
      ),
    );
  }

  public pitchAt({ string, fret }: FretPosition) {
    return Pitch.fromMidiNumber(this.stringPitches[string].midiNumber + fret);
  }
}

export interface FretPosition {
  readonly string: number;
  readonly fret: number;
}

// Instruments, indexed by name
// tslint:disable: object-literal-sort-keys
// tslint:disable-next-line variable-name
export const Instruments: { [_: string]: Instrument } = [
  {
    name: 'Guitar',
    stringPitches: 'E2 A2 D3 G3 B3 E4',
    fretted: true,
    fretCount: 12,
  },
  {
    name: 'Violin',
    stringPitches: 'G D A E',
  },
  {
    name: 'Viola',
    stringPitches: 'C G D A',
  },
  {
    name: 'Cello',
    stringPitches: 'C G D A',
  },
]
  .map((attrs) => new Instrument(attrs))
  .reduce((acc: { [_: string]: Instrument }, instr) => {
    acc[instr.name] = instr;
    return acc;
  }, {});

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

// TODO: replace this by something more idiomatic
function __range__(left: number, right: number, inclusive: boolean) {
  const range = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
