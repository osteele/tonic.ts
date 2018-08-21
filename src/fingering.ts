import * as _ from 'lodash';
import { Chord } from './chord';
import { FretPosition, Instrument } from './instrument';
import { Interval } from './interval';
import { powerset } from './utils';

// These are "fingerings" and not "voicings" because they also include barre information.
export class Fingering {
  get fretString(): string {
    if (!this._fretString) {
      this._fretString = this.computeFretString();
    }
    return this._fretString;
  }
  public readonly positions: FingeringPosition[];
  public readonly chord: Chord;
  public readonly barres: Barre[];
  public readonly instrument: Instrument;
  public readonly properties: { [_: string]: any };

  private _fretString: string | null;
  constructor({
    positions,
    chord,
    barres,
    instrument,
  }: {
    positions: FingeringPosition[];
    chord: Chord;
    barres: Barre[];
    instrument: Instrument;
  }) {
    this.chord = chord;
    this.instrument = instrument;
    this.positions = [...positions].sort(
      (a: FretPosition, b: FretPosition) => a.stringNumber - b.stringNumber,
    );
    this.barres = barres;
    this.properties = {};
  }

  // string representation of a fingering
  public computeFretString(): string {
    const fretArray = this.instrument.stringNumbers.map((_: any) => -1);
    this.positions.forEach(({ stringNumber, fretNumber }: FretPosition) => {
      fretArray[stringNumber] = fretNumber;
    });
    return fretArray.map((x) => (x >= 0 ? x : 'x')).join('');
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

export interface FingeringPosition {
  readonly stringNumber: number;
  readonly fretNumber: number;
  readonly degreeIndex: number;
  readonly intervalClass: Interval;
}

//
// Barres
//

export interface Barre {
  readonly fret: number;
  readonly firstString: number;
  readonly stringCount: number;
  readonly fingerReplacementCount: number;
}

// Returns an array of strings indexed by fret number. Each string
// has a character at each string position:
// '=' = fretted at this fret
// '>' = fretted at a higher fret
// '<' = fretted at a lower fret, or open
// 'x' = muted
function computeBarreCandidateStrings(fretArray: number[]): string[] {
  const codeStrings = [] as string[];
  for (const referenceFret of fretArray) {
    if (!codeStrings[referenceFret]) {
      codeStrings[referenceFret] = fretArray
        .map(
          (fret: number) =>
            fret < referenceFret
              ? '<'
              : fret > referenceFret
                ? '>'
                : fret === referenceFret
                  ? '='
                  : 'x',
        )
        .join('');
    }
  }
  return codeStrings;
}

function findBarres(fretArray: number[]): Barre[] {
  const barres = [] as Barre[];
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
    if (!(run.match(/\=/g)!.length > 1)) {
      continue;
    }
    barres.push({
      fingerReplacementCount: run.match(/\=/g)!.length,
      firstString: match.index!,
      fret,
      stringCount: run.length,
    });
  }
  return barres;
}

function collectBarreSets(fretArray: number[]) {
  const barres = findBarres(fretArray);
  return powerset(barres);
}

//
// Fingerings
//

function fingerPositionsOnChord(
  chord: Chord,
  instrument: Instrument,
): FretPosition[] {
  const { root, intervals } = chord;
  const positions = [] as FretPosition[];
  instrument.forEachFingerPosition((pos) => {
    const interval = Interval.between(root, instrument.pitchAt(pos));
    if (intervals.indexOf(interval) >= 0) {
      return positions.push(pos);
    }
  });
  return positions;
}

// TODO add options for strumming vs. fingerstyle; muting; stretch
export function chordFingerings(
  chord: Chord,
  instrument: Instrument,
  options = { filter: true, allPositions: false, fingerPicking: false },
): Fingering[] {
  const warn = false;
  if (chord.root == null) {
    throw new Error(`No root for ${chord}`);
  }
  // if (chord.root instanceof PitchClass) {
  //   chord = chord.at(chord.root.toPitch());
  // }

  //
  // Generate
  //

  // Return an array, indexed by string number, of frets in the chord
  function fretsPerString(): number[][] {
    let positions = fingerPositionsOnChord(chord, instrument);
    if (!options.allPositions) {
      positions = positions.filter((pos) => pos.fretNumber <= 4);
    }
    const strings: number[][] = instrument.stringNumbers.map((_) => []);
    positions.forEach(({ stringNumber, fretNumber }) =>
      strings[stringNumber].push(fretNumber),
    );
    return strings;
  }

  function collectFingeringPositions(
    fretCandidatesPerString: number[][],
  ): number[][] {
    const stringCount = fretCandidatesPerString.length;
    const positionSet = [] as number[][];
    const fretArray = [] as number[];
    function fill(s: number) {
      if (s === stringCount) {
        positionSet.push(fretArray.slice());
      } else {
        fretCandidatesPerString[s].forEach((fret) => {
          fretArray[s] = fret;
          fill(s + 1);
        });
      }
    }
    fill(0);
    return positionSet;
  }

  // actually tests pitch classes, not pitches
  function containsAllChordPitches(fretArray: number[]) {
    const pitchClasses = [] as number[];
    for (
      let stringNumber = 0;
      stringNumber < fretArray.length;
      stringNumber++
    ) {
      const fretNumber = fretArray[stringNumber];
      const pitchClass = instrument
        .pitchAt({ fretNumber, stringNumber })
        .toPitchClass().semitones;
      if (pitchClasses.indexOf(pitchClass) < 0) {
        pitchClasses.push(pitchClass);
      }
    }
    return pitchClasses.length === chord.pitches.length;
  }

  function maximumFretDistance(fretArray: number[]) {
    const frets = fretArray.filter((fret) => fret > 0);
    return _.max(frets)! - _.min(frets)! <= 3;
  }

  function generateFingerings(): Fingering[] {
    const fingerings = [];
    const fretArrays = collectFingeringPositions(fretsPerString())
      .filter(containsAllChordPitches)
      .filter(maximumFretDistance);
    for (const fretArray of fretArrays) {
      const positions = fretArray
        .map((fretNumber, stringNumber) => ({ fretNumber, stringNumber }))
        .map((pos) => {
          const intervalClass = Interval.between(
            chord.root,
            instrument.pitchAt(pos),
          );
          return {
            ...pos,
            degreeIndex: chord.intervals.indexOf(intervalClass),
            intervalClass,
          };
        });
      let sets = [[]] as Barre[][];
      if (positions.length > 4) {
        sets = collectBarreSets(fretArray);
      }
      for (const barres of sets) {
        fingerings.push(
          new Fingering({ positions, chord, barres, instrument }),
        );
      }
    }
    return fingerings;
  }

  // const chordNoteCount = chord.pitches.length;

  //
  // Filters
  //

  // really counts distinct pitch classes, not distinct pitches
  function countDistinctNotes(fingering: Fingering) {
    // _.chain(fingering.positions).pluck('intervalClass').uniq().value().length
    const intervalClasses = [] as Interval[];
    for (const { intervalClass } of fingering.positions) {
      if (intervalClasses.indexOf(intervalClass) < 0) {
        intervalClasses.push(intervalClass);
      }
    }
    return intervalClasses.length;
  }

  type FingeringProjection<T> = (_: Fingering) => T;
  type FingeringPredicate = FingeringProjection<boolean>;

  // const hasAllNotes: FingeringPredicate = (fingering) =>
  //   countDistinctNotes(fingering) === chordNoteCount;

  const mutedMedialStrings: FingeringPredicate = (fingering) =>
    fingering.fretString.match(/\dx+\d/) != null;

  const mutedTrebleStrings: FingeringPredicate = (fingering) =>
    fingering.fretString.match(/x$/) != null;

  const getFingerCount: FingeringProjection<number> = (fingering) => {
    let n = fingering.positions.filter((pos) => pos.fretNumber > 0).length;
    for (const barre of fingering.barres) {
      n -= barre.fingerReplacementCount - 1;
    }
    return n;
  };

  const fourFingersOrFewer: (_: Fingering) => boolean = (fingering) =>
    getFingerCount(fingering) <= 4;

  // Construct the filter set

  const filters: Array<{
    name: string;
    select?: (_: Fingering) => boolean;
    reject?: (_: Fingering) => boolean;
  }> = [];
  // filters.push name: 'has all chord notes', select: hasAllNotes

  if (options.filter) {
    filters.push({ name: 'four fingers or fewer', select: fourFingersOrFewer });
  }

  if (!options.fingerPicking) {
    filters.push({
      name: 'no muted medial strings',
      reject: mutedMedialStrings,
    });
    filters.push({
      name: 'no muted treble strings',
      reject: mutedTrebleStrings,
    });
  }

  // filter by all the filters in the list, except ignore those that wouldn't pass anything
  function filterFingerings(fingerings: Fingering[]): Fingering[] {
    for (let { name, select, reject } of filters) {
      let filtered = fingerings;
      if (reject) {
        select = (x) => !reject!(x);
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
  const highNoteCount: FingeringProjection<number> = (fingering) =>
    fingering.positions.length;

  const isRootPosition: FingeringPredicate = (fingering) =>
    _.sortBy(fingering.positions, (pos) => pos.stringNumber)[0].degreeIndex === 0;

  const reverseSortKey: (
    _: FingeringProjection<number>,
  ) => FingeringProjection<number> = (fn) => (a) => -fn(a);

  // ordered list of preferences, from most to least important
  const preferences: Array<{ name: string; key: (_: Fingering) => any }> = [
    { name: 'root position', key: isRootPosition },
    { name: 'high note count', key: highNoteCount },
    {
      key: reverseSortKey((fingering: Fingering) => fingering.barres.length),
      name: 'avoid barres',
    },
    { name: 'low finger count', key: reverseSortKey(getFingerCount) },
  ];

  function sortFingerings(fingerings: Fingering[]): Fingering[] {
    [...preferences].reverse().forEach(({ key }) => {
      _.sortBy(fingerings, key);
    });
    return fingerings;
    // .reverse()
    // .reduce(
    //   (results: Fingering[], { key }) =>
    //     _.sortBy(results, key) as Fingering[],
    //   fingerings
    // )
    // .reverse();
  }

  //
  // Generate, filter, and sort
  //

  let fingerings = generateFingerings();
  fingerings = filterFingerings(fingerings);
  fingerings = sortFingerings(fingerings);

  const properties: { [_: string]: RegExp | FingeringProjection<any> } = {
    root: isRootPosition,
    // TODO: restore this
    // inversion(f: Fingering) {
    //   return f.inversionLetter || '';
    // },

    bass: /^\d{3}x*$/,
    treble: /^x*\d{3}$/,
    triad: ({ positions }) => positions.length === 3,

    fingers: getFingerCount,
    barres(f: Fingering) {
      return f.barres.length;
    },
    muting: /\dx/,
    open: /0/,
    skipping: /\dx+\d/,

    position: ({ positions }) =>
      // const frets = positions.map(({ fret }) => fret);
      Math.max(
        _.chain(positions)
          .map('fretNumber')
          .min()
          .value()! - 1,
        0,
      ),
    strings: ({ positions }) => positions.length,
  };

  Object.keys(properties).forEach((name) => {
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
  const range = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
