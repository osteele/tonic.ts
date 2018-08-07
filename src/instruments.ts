import { Pitch } from './pitches';

export class Instrument {
  name: string;
  fretted: boolean;
  stringPitches: Pitch[];
  fretCount: number | null;
  strings: number;
  stringCount: number;
  stringNumbers: number[];
  constructor({
    name,
    fretted = false,
    stringPitches,
    fretCount
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

  forEachFingerPosition(fn: (_: FretPosition) => any) {
    return this.stringNumbers.map(string =>
      __range__(0, this.fretCount || 0, true).map(fret => fn({ string, fret }))
    );
  }

  pitchAt({ string, fret }: FretPosition) {
    return Pitch.fromMidiNumber(this.stringPitches[string].midiNumber + fret);
  }
}

export type FretPosition = { string: number; fret: number };

// Instruments, indexed by name
export const Instruments: { [_: string]: Instrument } = [
  {
    name: 'Guitar',
    stringPitches: 'E2 A2 D3 G3 B3 E4',
    fretted: true,
    fretCount: 12
  },
  {
    name: 'Violin',
    stringPitches: 'G D A E'
  },
  {
    name: 'Viola',
    stringPitches: 'C G D A'
  },
  {
    name: 'Cello',
    stringPitches: 'C G D A'
  }
]
  .map(attrs => new Instrument(attrs))
  .reduce((acc: { [_: string]: Instrument }, instr) => {
    acc[instr.name] = instr;
    return acc;
  }, {});

// TODO: make this a property of the instrument
export const FretNumbers = [0, 1, 2, 3, 4]; // includes nut
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
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
