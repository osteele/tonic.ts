import * as _ from 'lodash';
import { Chord } from './Chord';
import { Barre, FrettedChord } from './FrettedChord';
import { FretPosition, FrettedInstrument } from './Instrument';
import { Interval } from './Interval';
import { Pitch } from './Pitch';
import { powerset } from './utils';

// TODO: add options for strumming vs. fingerstyle; muting; stretch
interface FrettingOptions {
  filter: boolean;
  fingerPicking: boolean;
  maxFretNumber: number;
  maxFretSpread: number;
}

const defaultOptions: FrettingOptions = {
  filter: true,
  fingerPicking: false,
  maxFretNumber: 4,
  maxFretSpread: 3,
};

type FretNumber = number;

/** Return best fingering, sorted by default properties. */
export function frettingFor(
  chord: Chord<Pitch> | string,
  instrument: FrettedInstrument,
  options: Partial<FrettingOptions> = defaultOptions,
): FrettedChord {
  // TODO: nicer error when no fingerings available
  return allFrettings(chord, instrument, options)[0];
}

/** Return fingerings, sorted by default properties. */
export function allFrettings(
  chordOrName: Chord<Pitch> | string,
  instrument: FrettedInstrument,
  options: Partial<FrettingOptions> = defaultOptions,
): FrettedChord[] {
  const chord =
    typeof chordOrName === 'string'
      ? (Chord.fromString(chordOrName) as Chord<Pitch>)
      : chordOrName;
  const allOptions = { ...options, ...defaultOptions };
  let fingerings = generateFingerings(chord, instrument, allOptions);
  fingerings = selectFingerings(fingerings, allOptions);
  fingerings = sortFingerings(fingerings);
  return fingerings;
}

//
// Generate fingerings
//

/** Make an array of the fret positions whose pitch classes are in the chord.
 */
function fingerPositionsOnChord(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
): FretPosition[] {
  const { root, intervals } = chord;
  const positions = new Array<FretPosition>();
  instrument.forEachFingerPosition((pos) => {
    const interval = Interval.between(root, instrument.pitchAt(pos));
    if (intervals.indexOf(interval) >= 0) {
      positions.push(pos);
    }
  });
  return positions;
}

/** Make an array, indexed by string number, of fret numbers in the chord.
 */
function fretsPerString(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
  options: FrettingOptions,
): FretNumber[][] {
  const result = instrument.stringNumbers.map(() => new Array<number>());
  fingerPositionsOnChord(chord, instrument)
    .filter(
      options.maxFretNumber
        ? (pos) => pos.fretNumber <= options.maxFretNumber
        : () => true,
    )
    .forEach(({ stringNumber, fretNumber }) =>
      result[stringNumber].push(fretNumber),
    );
  return result;
}

type FretArray = Array<FretNumber | null>;

/** in: an array[stringNumber] = candidates: fretNumber[]
 * out: an array of array[stringNumber] = fret
 */
function generateFretArrays(stringFrets: FretNumber[][]): FretArray[] {
  const stringCount = stringFrets.length;
  const result = new Array<FretArray>();
  // Each call to `step` mutates `fretArray` and recurses until it has visited
  // all the strings, then appends `fretArray` to `result`.
  const fretArray = new Array<FretNumber | null>();
  function step(stringNumber: number) {
    if (stringNumber === stringCount) {
      result.push(fretArray.slice());
    } else {
      fretArray[stringNumber] = null;
      step(stringNumber + 1);
      stringFrets[stringNumber].forEach((fretNumber) => {
        fretArray[stringNumber] = fretNumber;
        step(stringNumber + 1);
      });
    }
  }
  step(0);
  return result;
}

function generateFingerings(
  chord: Chord<Pitch>,
  instrument: FrettedInstrument,
  options: FrettingOptions,
): FrettedChord[] {
  // Generate candidate fingerings. Do some preliminary filtering, to avoid
  // creating computing barres and instantiating Fingering for fingering
  // combinations that can be easily eliminated.
  const pitchClassCount = chord.pitches.length;
  const fretArrays = generateFretArrays(
    fretsPerString(chord, instrument, options),
  )
    .filter(
      (fretArray) => countPitchClasses(instrument, fretArray) === pitchClassCount,
    )
    .filter((fretArray) => computeFretSpread(fretArray) <= options.maxFretSpread);
  // Transform the candidates into FretPositions, find barres, and create a
  // Fingering for each combination.
  const fingerings = [];
  for (const fretArray of fretArrays) {
    const positions = fretArray
      .map((fretNumber, stringNumber) => ({ fretNumber, stringNumber }))
      .filter(({ fretNumber }) => fretNumber !== null)
      .map((_pos) => {
        const pos = _pos as FretPosition;
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
    const barreSets = positions.length < 4 ? [[]] : collectBarreSets(fretArray);
    fingerings.push(
      ...barreSets.map(
        (barres) => new FrettedChord(chord, instrument, positions, barres),
      ),
    );
  }
  return fingerings;
}

/** Count the number of distinct pitch classes. */
function countPitchClasses(
  instrument: FrettedInstrument,
  fretArray: FretArray,
): number {
  const pitchClasses = new Array<number>();
  fretArray.forEach((fretNumber, stringNumber) => {
    if (fretNumber !== null) {
      const pitchClass = instrument
        .pitchAt({ fretNumber, stringNumber })
        .asPitchClass().semitones;
      if (pitchClasses.indexOf(pitchClass) < 0) {
        pitchClasses.push(pitchClass);
      }
    }
  });
  return pitchClasses.length;
}

/** Return the spread between the lowest- and highest-numbered frets, excluding
 * the nut and muted strings.
 */
function computeFretSpread(fretArray: FretArray) {
  const frets = fretArray.filter((fret) => fret !== null && fret > 0);
  return _.max(frets)! - _.min(frets)!;
}

//
// Predicates and other projections
//

type FingeringProjection<T> = (_: FrettedChord) => T;
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
const fingerCount: FingeringProjection<number> = (fingering) =>
  fingering.fingerCount;

/// Does the fingering require four fingers or fewer?
const fourFingersOrFewer: (_: FrettedChord) => boolean = (fingering) =>
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
  | { reject?: null; select: (_: FrettedChord) => boolean }
  | { reject: (_: FrettedChord) => boolean; select?: null };

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
  fingerings: FrettedChord[],
  options = { filter: false, fingerPicking: false },
): FrettedChord[] {
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

// ordered list of preferences, from most to least important
// TODO: move this to options
const sortingPreferences: Array<{
  key: FingeringProjection<boolean | number>;
  descending?: true | null;
}> = [
  { key: isRootPosition },
  { key: noteCount, descending: true },
  { key: barreCount },
  { key: fingerCount },
];

const makeSortFunction = (
  key: FingeringProjection<any>,
  descending: boolean,
) => (fingering: FrettedChord): number | boolean => {
  const k = key(fingering);
  return descending !== (typeof k === 'boolean') ? -Number(k) : k;
};

/** Sort fingerings lexicographically by the projections `preferences`. Mutates
 * `fingerings`.
 */
function sortFingerings(fingerings: FrettedChord[]): FrettedChord[] {
  // sort true before false, 0 before 1, unless descending
  const fs = _.reduceRight(
    sortingPreferences,
    (fs, { key, descending }) =>
      fs.sortBy(makeSortFunction(key, descending || false)),
    _.chain(fingerings),
  ).value();
  return fs;
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
function computeBarreCandidateStrings(fretArray: FretArray): string[] {
  const codeStrings = new Array<string>();
  for (const referenceFret of fretArray) {
    if (referenceFret !== null && !codeStrings[referenceFret]) {
      codeStrings[referenceFret] = fretArray
        .map(
          (fretNumber) =>
            fretNumber === null
              ? 'x'
              : fretNumber < referenceFret
                ? '<'
                : fretNumber > referenceFret
                  ? '>'
                  : '=',
        )
        .join('');
    }
  }
  return codeStrings;
}

function findBarres(fretArray: FretArray): Barre[] {
  const barres = new Array<Barre>();
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

function collectBarreSets(fretArray: FretArray) {
  const barres = findBarres(fretArray);
  return powerset(barres);
}
