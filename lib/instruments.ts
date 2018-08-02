/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { intervalClassDifference, Pitch } from './pitches';

//
// Fretboard
//

class Instrument {
  name: string;
  fretted: boolean;
  stringPitches: [Pitch];
  fretCount: number;
  strings: number;
  stringCount: number;
  stringNumbers: [number];
  constructor({ name1, fretted, stringPitches: string, fretCount }) {
    let name;
    this.name = name1;
    this.fretted = fretted;
    this.stringPitches = stringPitches;
    this.fretCount = fretCount;
    if (typeof this.stringPitches === 'string') {
      this.stringPitches = this.stringPitches.split(/\s/);
    }
    if (typeof this.stringPitches[0] === 'string') {
      this.stringPitches = (() => {
        const result = [];
        for (name of Array.from(this.stringPitches)) {
          result.push(Pitch.fromString(name));
        }
        return result;
      })();
    }
    this.strings = this.stringCount = this.stringPitches.length;
    this.stringNumbers = __range__(0, this.strings, false);
  }

  eachFingerPosition(fn) {
    return Array.from(this.stringNumbers).map(string =>
      __range__(0, this.fretCount, true).map(fret => fn({ string, fret }))
    );
  }

  pitchAt({ string, fret }) {
    return Pitch.fromMidiNumber(this.stringPitches[string].midiNumber + fret);
  }
}

const Instruments = [
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
].map(attrs => new Instrument(attrs));

(() =>
  Array.from(Instruments).map(
    instrument => (Instruments[instrument.name] = instrument)
  ))();

const FretNumbers = [0, 1, 2, 3, 4]; // includes nut
const FretCount = FretNumbers.length - 1; // doesn't include nut

const intervalPositionsFromRoot = function(
  instrument,
  rootPosition,
  semitones
) {
  const rootPitch = instrument.pitchAt(rootPosition);
  const positions = [];
  fretboard_positions_each(function(fingerPosition) {
    if (
      intervalClassDifference(rootPitch, instrument.pitchAt(fingerPosition)) !==
      semitones
    ) {
      return;
    }
    return positions.push(fingerPosition);
  });
  return positions;
};

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

export const Default = Instruments.Guitar;
export {
  FretNumbers,
  FretCount,
  Instrument,
  Instruments,
  intervalPositionsFromRoot
};
