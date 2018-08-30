import * as _ from 'lodash';
import { Chord } from './Chord';
import { FretPosition, FrettedInstrument } from './Instrument';
import { Interval } from './Interval';
import { Pitch } from './Pitch';
import { powerset } from './utils';

/** These are "fingerings" and not "voicings" because they also include barre
 * information.
 */
export class Fingering {
  /** Return best fingering, sorted by default properties. */
  public static best(
    chord: Chord<Pitch> | string,
    instrument: FrettedInstrument,
  ): Fingering {
    return Fingering.all(chord, instrument)[0];
  }

  /** Return fingerings, sorted by default properties. */
  public static all(
    _chord: Chord<Pitch> | string,
    instrument: FrettedInstrument,
  ): Fingering[] {
    const chord =
      typeof _chord === 'string'
        ? (Chord.fromString(_chord) as Chord<Pitch>)
        : _chord;
    return chordFingerings(chord, instrument);
  }

  // Fingering positions, ascending by string number
  public readonly positions: FingeringPosition[];
  public readonly properties: { [_: string]: any };

  private _fretString: string | null = null;
  constructor(
    readonly chord: Chord<Pitch>,
    readonly instrument: FrettedInstrument,
    positions: FingeringPosition[],
    readonly barres: Barre[],
  ) {
    this.positions = [...positions].sort(
      (a: FretPosition, b: FretPosition) => a.stringNumber - b.stringNumber,
    );
    this.properties = Object.create(null);
  }

  /** A string representation of open, fretted, and muted strings.  For example,
   * 'x02440'.
   */
  get fretString(): string {
    if (this._fretString) {
      return this._fretString;
    }
    const fretArray = this.instrument.stringNumbers.map((_: any) => -1);
    this.positions.forEach(({ stringNumber, fretNumber }: FretPosition) => {
      fretArray[stringNumber] = fretNumber;
    });
    this._fretString = fretArray.map((n) => (n >= 0 ? n : 'x')).join('');
    return this._fretString;
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

/** An FretPosition, annotated with information that's useful during
 * chord-fingering computation.
 */
export interface FingeringPosition extends FretPosition {
  readonly degreeIndex: number;
  readonly intervalClass: Interval;
}

/** A barre, or bar, uses a single finger to fret two or more consecutive
 * strings.
 */
export interface Barre {
  readonly fretNumber: number;
  /** The lowest-numbered string, that starts the barre. */
  readonly firstString: number;
  /** The number of strings that the barre includes. */
  readonly stringCount: number;
  // TODO: does this really need to be part of the interface?
  readonly fingerReplacementCount: number;
}

//
// Barre computation
//

/** Returns an array of strings, indexed by each fret number in `fretArray`.
 * (Indices that don't correspond to a fret number are false-y.) Each string has
 * a character at each string position:
 * * '=' = fretted at this fret
 * * '>' = fretted at a higher fret
 * * '<' = fretted at a lower fret, or open
 * * 'x' = muted
 */
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
  for (let fretNumber = 0; fretNumber < iterable.length; fretNumber++) {
    const codeString = iterable[fretNumber];
    if (fretNumber === 0) {
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
      fretNumber,
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
// Generate fingerings
//

/** Generate an array of all the fret positions that are on the chord. */
function fingerPositionsOnChord(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
): FretPosition[] {
  const { root, intervals } = chord;
  const positions = [] as FretPosition[];
  instrument.forEachFingerPosition((pos) => {
    const interval = Interval.between(root, instrument.pitchAt(pos));
    if (intervals.indexOf(interval) >= 0) {
      positions.push(pos);
    }
  });
  return positions;
}

function generateFingerings(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
  options: { allPositions: boolean },
): Fingering[] {
  const fretArrays = collectFingeringPositions(
    fretsPerString(chord, instrument, options),
  )
    .filter((fretArray) => containsAllChordPitches(chord, instrument, fretArray))
    .filter(maximumFretDistance);
  const fingerings = [];
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
      fingerings.push(new Fingering(chord, instrument, positions, barres));
    }
  }
  return fingerings;
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

// Return an array, indexed by string number, of frets in the chord
function fretsPerString(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
  options: { allPositions: boolean },
): number[][] {
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

// actually tests pitch classes, not pitches
function containsAllChordPitches(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
  fretArray: number[],
) {
  const pitchClasses = [] as number[];
  for (let stringNumber = 0; stringNumber < fretArray.length; stringNumber++) {
    const fretNumber = fretArray[stringNumber];
    const pitchClass = instrument
      .pitchAt({ fretNumber, stringNumber })
      .asPitchClass().semitones;
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

// TODO add options for strumming vs. fingerstyle; muting; stretch
function chordFingerings(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
  options = { filter: true, allPositions: false, fingerPicking: false },
): Fingering[] {
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

  //
  // Generate, filter, and sort
  //

  let fingerings = generateFingerings(chord, instrument, options);
  fingerings = selectFingerings(fingerings, options);
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

    fingers: fingerCount,
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

//
// Predicates and other projections
//

type FingeringProjection<T> = (_: Fingering) => T;
type FingeringPredicate = FingeringProjection<boolean>;

// const hasAllNotes: FingeringPredicate = (fingering) =>
//   countDistinctNotes(fingering) === chordNoteCount;

/// Is there a muted string between two voiced strings?
const mutedMedialStrings: FingeringPredicate = (fingering) =>
  fingering.fretString.match(/\dx+\d/) != null;

/// Is there a muted treble string?
const mutedTrebleStrings: FingeringPredicate = (fingering) =>
  fingering.fretString.match(/x$/) != null;

/// How many fingers does the fingering require? For an un-barred fingering,
/// this is just the number of fretted strings.
const fingerCount: FingeringProjection<number> = (fingering) => {
  let n = fingering.positions.filter((pos) => pos.fretNumber > 0).length;
  for (const barre of fingering.barres) {
    n -= barre.fingerReplacementCount - 1;
  }
  return n;
};

/// Does the fingering require four fingers or fewer?
const fourFingersOrFewer: (_: Fingering) => boolean = (fingering) =>
  fingerCount(fingering) <= 4;

// FIXME count pitch classes, not sounded strings
const noteCount: FingeringProjection<number> = (fingering) =>
  fingering.positions.length;

const isRootPosition: FingeringPredicate = (fingering) =>
  _.sortBy(fingering.positions, (pos) => pos.stringNumber)[0].degreeIndex === 0;

const barreCount: FingeringProjection<number> = (fingering) =>
  fingering.barres.length;

//
// Filter
//

type Filter =
  | { reject?: null; select: (_: Fingering) => boolean }
  | { reject: (_: Fingering) => boolean; select?: null };

interface FilterOptions {
  filter: boolean;
  fingerPicking: boolean;
}

// Build a list of filters for these options
function getFilters(options: FilterOptions): Filter[] {
  const filters = new Array<Filter>();
  // filters.push name: 'has all chord notes', select: hasAllNotes
  if (options.filter) {
    filters.push({ select: fourFingersOrFewer });
  }
  if (!options.fingerPicking) {
    filters.push({ reject: mutedMedialStrings });
    filters.push({ reject: mutedTrebleStrings });
  }
  return filters;
}

/**Filter by all the filters in the list, except ignore filters that would
 * eliminate remaining fingers.
 */
function selectFingerings(
  fingerings: Fingering[],
  options = { filter: false, fingerPicking: false },
): Fingering[] {
  const filters = getFilters(options);
  for (const filter of filters) {
    const select = filter.select || ((x) => !filter.reject!(x));
    const filtered = fingerings.filter(select);
    // skip filters that reject everything
    if (filtered.length) {
      fingerings = filtered;
    }
  }
  return fingerings;
}

//
// Sort
//

const makeSortFunction = (
  key: FingeringProjection<any>,
  descending: boolean,
) => (fingering: Fingering): number | boolean => {
  const k = key(fingering);
  return descending !== (typeof k === 'boolean') ? -Number(k) : k;
};

// ordered list of preferences, from most to least important
const sortingPreferences: Array<{
  key: FingeringProjection<boolean | number>;
  descending?: true | null;
}> = [
  { key: isRootPosition },
  { key: noteCount, descending: true },
  { key: barreCount },
  { key: fingerCount },
];

/** Sort fingerings lexicographically by the projections `preferences`. Mutates
 * `fingerings`.
 */
function sortFingerings(fingerings: Fingering[]): Fingering[] {
  // sort true before false, 0 before 1, unless descending
  const fs = _.reduceRight(
    sortingPreferences,
    (fs, { key, descending }) =>
      fs.sortBy(makeSortFunction(key, descending || false)),
    _.chain(fingerings),
  ).value();
  return fs;
}
