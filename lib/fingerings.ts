// import  './utils';
import * as _ from 'lodash';
import { Chord } from './chords';
import { Instrument } from './instruments';
import { Interval } from './interval';
import { PitchClass } from './pitch_class';

type FingeringPosition = {
  string: number;
  fret: number;
  intervalClass: Interval;
};

// These are "fingerings" and not "voicings" because they also include barre information.
class Fingering {
  positions: FingeringPosition[];
  chord: Chord;
  barres: number[];
  instrument: Instrument;
  properties: { [_: string]: any };
  constructor({
    positions,
    chord,
    barres,
    instrument
  }: {
    positions: FingeringPosition[];
    chord: Chord;
    barres: number[];
    instrument: Instrument;
  }) {
    this.chord = chord;
    this.instrument = instrument;
    this.positions = [...positions];
    this.positions.sort(
      (a: { string: number }, b: { string: number }) => a.string - b.string
    );
    this.barres = barres;
    this.properties = {};
  }

  private _fretString: string | null;
  get fretString(): string {
    if (!this._fretString) {
      this._fretString = this.computeFretString();
    }
    return this._fretString;
  }

  // string representation of a fingering
  computeFretString(): string {
    const fretArray = this.instrument.stringNumbers.map((_: any) => -1);
    this.positions.forEach(
      ({ string, fret }: { string: number; fret: number }) => {
        fretArray[string] = fret;
      }
    );
    return fretArray.map(x => (x >= 0 ? x : 'x')).join('');
  }

  // chordName(): string {
  //   let { name } = this.chord;
  //   if (this.inversion() > 0) {
  //     name += ` / ${this.instrument.pitchAt(this.positions[0]).toString()}`;
  //   }
  //   return name;
  // }

  // @cached_getter 'pitches', ->
  //   (@instrument.pitchAt(positions) for positions in @positions)

  // @cached_getter 'intervals', ->
  //   _.uniq(intervalClassDifference(@chord.rootPitch, pitchClass) for pitchClass in @.pitches)

  // inversion():number {
  //   return this.chord.pitches.indexOf(
  //     Interval.between(
  //       this.chord.root,
  //       this.instrument.pitchAt(this.positions[0])
  //     )
  //   );
  // }

  //   inversionLetter():string {
  //   if (!(this.inversion > 0)) {
  //     return;
  //   }
  //   return String.fromCharCode(96 + this.inversion);
  // }
  // }
}

//
// Barres
//

function powerset<T>(array: T[]): T[][] {
  if (!array.length) {
    return [[]];
  }
  const [x, ...xs] = array;
  const tail = powerset(xs);
  return tail.concat(tail.map(ys => [x].concat(ys)));
}

// Returns an array of strings indexed by fret number. Each string
// has a character at each string position:
// '=' = fretted at this fret
// '>' = fretted at a higher fret
// '<' = fretted at a lower fret, or open
// 'x' = muted
const computeBarreCandidateStrings = function(fretArray) {
  const codeStrings = [];
  for (var referenceFret of Array.from(fretArray)) {
    if (typeof referenceFret !== 'number') {
      continue;
    }
    if (!codeStrings[referenceFret]) {
      codeStrings[referenceFret] = Array.from(fretArray)
        .map(
          fret =>
            fret < referenceFret
              ? '<'
              : fret > referenceFret
                ? '>'
                : fret === referenceFret
                  ? '='
                  : 'x'
        )
        .join('');
    }
  }
  return codeStrings;
};

function findBarres(fretArray) {
  const barres = [];
  const iterable = computeBarreCandidateStrings(fretArray);
  for (let fret = 0; fret < iterable.length; fret++) {
    const codeString = iterable[fret];
    if (fret === 0) {
      continue;
    }
    if (!codeString) {
      continue;
    }
    const match = codeString.match(/(=[>=]+)/);
    if (!match) {
      continue;
    }
    const run = match[1];
    if (!(run.match(/\=/g).length > 1)) {
      continue;
    }
    barres.push({
      fret,
      firstString: match.index,
      stringCount: run.length,
      fingerReplacementCount: run.match(/\=/g).length
    });
  }
  return barres;
}

function collectBarreSets(fretArray) {
  const barres = findBarres(fretArray);
  return powerset(barres);
}

//
// Fingerings
//

function fingerPositionsOnChord(chord: Chord, instrument: Instrument) {
  const { root, intervals } = chord;
  const positions = [];
  instrument.eachFingerPosition(function(pos) {
    const interval = Interval.between(root, instrument.pitchAt(pos));
    if (Array.from(intervals).includes(interval)) {
      return positions.push(pos);
    }
  });
  return positions;
}

// TODO add options for strumming vs. fingerstyle; muting; stretch
export function chordFingerings(
  chord: Chord,
  instrument: Instrument,
  options = { filter: true, allPositions: false, fingerPicking: false }
) {
  const warn = false;
  if (chord.root == null) {
    throw new Error(`No root for ${chord}`);
  }
  if (chord.root instanceof PitchClass) {
    chord = chord.at(chord.root.toPitch());
  }

  //
  // Generate
  //

  function fretsPerString() {
    let positions = fingerPositionsOnChord(chord, instrument);
    if (!options.allPositions) {
      positions = Array.from(positions).filter(pos => pos.fret <= 4);
    }
    const strings = __range__(0, instrument.stringCount, false).map(s => [
      null
    ]);
    for (let { string, fret } of Array.from(positions)) {
      strings[string].push(fret);
    }
    return strings;
  }

  function collectFingeringPositions(fretCandidatesPerString) {
    const stringCount = fretCandidatesPerString.length;
    const positionSet = [];
    const fretArray = [];
    var fill = function(s) {
      if (s === stringCount) {
        return positionSet.push(fretArray.slice());
      } else {
        return (() => {
          const result = [];
          for (let fret of Array.from(fretCandidatesPerString[s])) {
            fretArray[s] = fret;
            result.push(fill(s + 1));
          }
          return result;
        })();
      }
    };
    fill(0);
    return positionSet;
  }

  // actually tests pitch classes, not pitches
  function containsAllChordPitches(fretArray) {
    const trace = fretArray.join('') === '022100';
    const pitchClasses = [];
    for (let string = 0; string < fretArray.length; string++) {
      const fret = fretArray[string];
      if (typeof fret !== 'number') {
        continue;
      }
      const pitchClass = instrument.pitchAt({ fret, string }).toPitchClass()
        .semitones;
      if (!Array.from(pitchClasses).includes(pitchClass)) {
        pitchClasses.push(pitchClass);
      }
    }
    return pitchClasses.length === chord.pitches.length;
  }

  function maximumFretDistance(fretArray) {
    const frets = Array.from(fretArray).filter(
      fret => typeof fret === 'number'
    );
    // fretArray = (fret for fret in fretArray when fret > 0)
    return (
      Math.max(...Array.from(frets || [])) -
        Math.min(...Array.from(frets || [])) <=
      3
    );
  }

  function generateFingerings() {
    const fingerings = [];
    const fretArrays = collectFingeringPositions(fretsPerString())
      .filter(containsAllChordPitches)
      .filter(maximumFretDistance);
    for (var fretArray of Array.from(fretArrays)) {
      const positions = (() => {
        const result = [];
        for (let string = 0; string < fretArray.length; string++) {
          const fret = fretArray[string];
          if (typeof fret === 'number') {
            result.push({ fret, string });
          }
        }
        return result;
      })();
      for (let pos of Array.from(positions)) {
        pos.intervalClass = Interval.between(
          chord.root,
          instrument.pitchAt(pos)
        );
        pos.degreeIndex = chord.intervals.indexOf(pos.intervalClass);
      }
      let sets = [[]];
      if (positions.length > 4) {
        sets = collectBarreSets(fretArray);
      }
      for (let barres of Array.from(sets)) {
        fingerings.push(
          new Fingering({ positions, chord, barres, instrument })
        );
      }
    }
    return fingerings;
  }

  const chordNoteCount = chord.pitches.length;

  //
  // Filters
  //

  // really counts distinct pitch classes, not distinct pitches
  function countDistinctNotes(fingering) {
    // _.chain(fingering.positions).pluck('intervalClass').uniq().value().length
    const intervalClasses = [];
    for (let { intervalClass } of Array.from(fingering.positions)) {
      if (!Array.from(intervalClasses).includes(intervalClass)) {
        intervalClasses.push(intervalClass);
      }
    }
    return intervalClasses.length;
  }

  const hasAllNotes = fingering =>
    countDistinctNotes(fingering) === chordNoteCount;

  const mutedMedialStrings = fingering => fingering.fretString.match(/\dx+\d/);

  const mutedTrebleStrings = fingering => fingering.fretString.match(/x$/);

  const getFingerCount = function(fingering) {
    let n = Array.from(fingering.positions).filter(pos => pos.fret > 0).length;
    for (let barre of Array.from(fingering.barres)) {
      n -= barre.fingerReplacementCount - 1;
    }
    return n;
  };

  const fourFingersOrFewer: (_: Fingering) => boolean = fingering =>
    getFingerCount(fingering) <= 4;

  // Construct the filter set

  const filters: {
    name: string;
    select?: (_: Fingering) => boolean;
    reject?: (_: Fingering) => boolean;
  }[] = [];
  // filters.push name: 'has all chord notes', select: hasAllNotes

  if (options.filter) {
    filters.push({ name: 'four fingers or fewer', select: fourFingersOrFewer });
  }

  if (!options.fingerPicking) {
    filters.push({
      name: 'no muted medial strings',
      reject: mutedMedialStrings
    });
    filters.push({
      name: 'no muted treble strings',
      reject: mutedTrebleStrings
    });
  }

  // filter by all the filters in the list, except ignore those that wouldn't pass anything
  function filterFingerings(fingerings: Fingering[]): Fingering[] {
    for (var { name, select, reject } of Array.from(filters)) {
      let filtered = fingerings;
      if (reject) {
        select = x => !reject(x);
      }
      if (select) {
        filtered = filtered.filter(select);
      }
      if (!filtered.length) {
        if (warn) {
          console.warn(`${chord.name}: no fingerings pass filter \"${name}\"`);
        }
        filtered = fingerings;
      }
      fingerings = filtered;
    }
    return fingerings;
  }

  //
  // Sort
  //

  // FIXME count pitch classes, not sounded strings
  const highNoteCount: (_: Fingering) => number = fingering =>
    fingering.positions.length;

  const isRootPosition: (_: Fingering) => boolean = fingering =>
    _.sortBy(fingering.positions, pos => pos.string)[0].degreeIndex === 0;

  function reverseSortKey(
    fn: (_: Fingering) => number
  ): (_: Fingering) => number {
    return a => -fn(a);
  }

  // ordered list of preferences, from most to least important
  const preferences: { name: string; key: (_: Fingering) => any }[] = [
    { name: 'root position', key: isRootPosition },
    { name: 'high note count', key: highNoteCount },
    {
      name: 'avoid barres',
      key: reverseSortKey((fingering: Fingering) => fingering.barres.length)
    },
    { name: 'low finger count', key: reverseSortKey(getFingerCount) }
  ];

  function sortFingerings(fingerings: Fingering[]): Fingering[] {
    return [...preferences]
      .reverse()
      .reduce(
        (results: Fingering[], { key }) =>
          _.sortBy(results, key) as Fingering[],
        fingerings
      )
      .reverse();
  }

  //
  // Generate, filter, and sort
  //

  let fingerings = generateFingerings();
  fingerings = filterFingerings(fingerings);
  fingerings = sortFingerings(fingerings);

  const properties: { [_: string]: RegExp | ((_: Fingering) => any) } = {
    root: isRootPosition,
    barres(f: Fingering) {
      return f.barres.length;
    },
    fingers: getFingerCount,
    // inversion(f: Fingering) {
    //   return f.inversionLetter || '';
    // },
    // bass: /^\d{3}x*$/
    // treble: /^x*\d{3}$/
    skipping: /\dx+\d/,
    muting: /\dx/,
    open: /0/,
    triad({ positions }: Fingering) {
      return positions.length === 3;
    },
    position({ positions }: Fingering) {
      // const frets = positions.map(({ fret }) => fret);
      return Math.max(
        _
          .chain(positions)
          .map('fret')
          .min()
          .value()! - 1,
        0
      );
    },
    strings({ positions }: Fingering) {
      return positions.length;
    }
  };
  // console.info('fingerings', fingerings);
  Object.keys(properties).forEach(name => {
    const fn = properties[name];
    fingerings.forEach((fingering: Fingering) => {
      const value =
        fn instanceof RegExp ? fn.test(fingering.fretString) : fn(fingering);
      fingering.properties[name] = value;
    });
  });

  return fingerings;
}

export function bestFingeringFor(chord: Chord, instrument: Instrument) {
  return chordFingerings(chord, instrument)[0];
}

function __range__(left: number, right: number, inclusive: boolean) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
