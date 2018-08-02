/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from  'underscore'
// import util from 'util'
import  './utils';
import { Interval, Pitch, PitchClass } from './pitches';

// These are "fingerings" and not "voicings" because they also include barre information.
class Fingering {
  static initClass() {
    this.cached_getter('fretstring', function() {
      const fretArray = Array.from(this.instrument.stringNumbers).map(s => -1);
      for (let { string, fret } of Array.from(this.positions)) {
        fretArray[string] = fret;
      }
      return Array.from(fretArray)
        .map(x => (x >= 0 ? x : 'x'))
        .join('');
    });

    this.cached_getter('chordName', function() {
      let { name } = this.chord;
      if (this.inversion > 0) {
        name += ` / ${this.instrument.pitchAt(this.positions[0]).toString()}`;
      }
      return name;
    });

    // @cached_getter 'pitches', ->
    //   (@instrument.pitchAt(positions) for positions in @positions)

    // @cached_getter 'intervals', ->
    //   _.uniq(intervalClassDifference(@chord.rootPitch, pitchClass) for pitchClass in @.pitches)

    this.cached_getter('inversion', function() {
      return this.chord.pitches.indexOf(
        Interval.between(
          this.chord.root,
          this.instrument.pitchAt(this.positions[0])
        )
      );
    });

    this.cached_getter('inversionLetter', function() {
      if (!(this.inversion > 0)) {
        return;
      }
      return String.fromCharCode(96 + this.inversion);
    });
  }
  positions: [int];
  chord: Chord;
  barres: [int];
  instrument: Instrument;
  properties: object;
  constructor({ positions, chord, barres, instrument }) {
    this.positions = positions;
    this.chord = chord;
    this.barres = barres;
    this.instrument = instrument;
    this.positions.sort((a, b) => a.string - b.string);
    this.properties = {};
  }
}
Fingering.initClass();

//
// Barres
//

const powerset = function(array) {
  if (!array.length) {
    return [[]];
  }
  const [x, ...xs] = Array.from(array);
  const tail = powerset(xs);
  return tail.concat(Array.from(tail).map(ys => [x].concat(ys)));
};

// Returns an array of strings indexed by fret number. Each string
// has a character at each string position:
// '=' = fretted at this fret
// '>' = fretted at a higher fret
// '<' = fretted at a lower fret, or open
// 'x' = muted
const computeBarreCandidateStrings = function(instrument, fretArray) {
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

const findBarres = function(instrument, fretArray) {
  const barres = [];
  const iterable = computeBarreCandidateStrings(instrument, fretArray);
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
};

const collectBarreSets = function(instrument, fretArray) {
  const barres = findBarres(instrument, fretArray);
  return powerset(barres);
};

//
// Fingerings
//

const fingerPositionsOnChord = function(chord, instrument) {
  const { root, intervals } = chord;
  const positions = [];
  instrument.eachFingerPosition(function(pos) {
    const interval = Interval.between(root, instrument.pitchAt(pos));
    if (Array.from(intervals).includes(interval)) {
      return positions.push(pos);
    }
  });
  return positions;
};

// TODO add options for strumming vs. fingerstyle; muting; stretch
const chordFingerings = function(chord, instrument, options) {
  if (options == null) {
    options = {};
  }
  options = _.extend({ filter: true, allPositions: false }, options);
  const warn = false;
  if (chord.root == null) {
    throw new Error(`No root for ${util.inspect(chord)}`);
  }
  if (chord.root instanceof PitchClass) {
    chord = chord.at(chord.root.toPitch());
  }

  //
  // Generate
  //

  const fretsPerString = function() {
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
  };

  const collectFingeringPositions = function(fretCandidatesPerString) {
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
  };

  // actually tests pitch classes, not pitches
  const containsAllChordPitches = function(fretArray) {
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
  };

  const maximumFretDistance = function(fretArray) {
    const frets = Array.from(fretArray).filter(
      fret => typeof fret === 'number'
    );
    // fretArray = (fret for fret in fretArray when fret > 0)
    return (
      Math.max(...Array.from(frets || [])) -
        Math.min(...Array.from(frets || [])) <=
      3
    );
  };

  const generateFingerings = function() {
    const fingerings = [];
    let fretArrays = collectFingeringPositions(fretsPerString());
    fretArrays = fretArrays.filter(containsAllChordPitches);
    fretArrays = fretArrays.filter(maximumFretDistance);
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
        sets = collectBarreSets(instrument, fretArray);
      }
      for (let barres of Array.from(sets)) {
        fingerings.push(
          new Fingering({ positions, chord, barres, instrument })
        );
      }
    }
    return fingerings;
  };

  const chordNoteCount = chord.pitches.length;

  //
  // Filters
  //

  // really counts distinct pitch classes, not distinct pitches
  const countDistinctNotes = function(fingering) {
    // _.chain(fingering.positions).pluck('intervalClass').uniq().value().length
    const intervalClasses = [];
    for (let { intervalClass } of Array.from(fingering.positions)) {
      if (!Array.from(intervalClasses).includes(intervalClass)) {
        intervalClasses.push(intervalClass);
      }
    }
    return intervalClasses.length;
  };

  const hasAllNotes = fingering =>
    countDistinctNotes(fingering) === chordNoteCount;

  const mutedMedialStrings = fingering => fingering.fretstring.match(/\dx+\d/);

  const mutedTrebleStrings = fingering => fingering.fretstring.match(/x$/);

  const getFingerCount = function(fingering) {
    let n = Array.from(fingering.positions).filter(pos => pos.fret > 0).length;
    for (let barre of Array.from(fingering.barres)) {
      n -= barre.fingerReplacementCount - 1;
    }
    return n;
  };

  const fourFingersOrFewer = fingering => getFingerCount(fingering) <= 4;

  // Construct the filter set

  const filters = [];
  // filters.push name: 'has all chord notes', select: hasAllNotes

  if (options.filter) {
    filters.push({ name: 'four fingers or fewer', select: fourFingersOrFewer });
  }

  if (!options.fingerpicking) {
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
  const filterFingerings = function(fingerings) {
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
  };

  //
  // Sort
  //

  // FIXME count pitch classes, not sounded strings
  const highNoteCount = fingering => fingering.positions.length;

  const isRootPosition = fingering =>
    _(fingering.positions).sortBy(pos => pos.string)[0].degreeIndex === 0;

  const reverseSortKey = fn => a => -fn(a);

  // ordered list of preferences, from most to least important
  const preferences = [
    { name: 'root position', key: isRootPosition },
    { name: 'high note count', key: highNoteCount },
    {
      name: 'avoid barres',
      key: reverseSortKey(fingering => fingering.barres.length)
    },
    { name: 'low finger count', key: reverseSortKey(getFingerCount) }
  ];

  const sortFingerings = function(fingerings) {
    for (let { key } of Array.from(preferences.slice(0).reverse())) {
      fingerings = _(fingerings).sortBy(key);
    }
    fingerings.reverse();
    return fingerings;
  };

  //
  // Generate, filter, and sort
  //

  let fingerings = generateFingerings();
  fingerings = filterFingerings(fingerings);
  fingerings = sortFingerings(fingerings);

  const properties = {
    root: isRootPosition,
    barres(f) {
      return f.barres.length;
    },
    fingers: getFingerCount,
    inversion(f) {
      return f.inversionLetter || '';
    },
    // bass: /^\d{3}x*$/
    // treble: /^x*\d{3}$/
    skipping: /\dx+\d/,
    muting: /\dx/,
    open: /0/,
    triad({ positions }) {
      return positions.length === 3;
    },
    position({ positions }) {
      return Math.max(_.min(_.pluck(positions, 'fret')) - 1, 0);
    },
    strings({ positions }) {
      return positions.length;
    }
  };
  for (let name in properties) {
    const fn = properties[name];
    for (let fingering of Array.from(fingerings)) {
      const value =
        fn instanceof RegExp ? fn.test(fingering.fretstring) : fn(fingering);
      fingering.properties[name] = value;
    }
  }

  return fingerings;
};

const bestFingeringFor = (chord, instrument) =>
  chordFingerings(chord, instrument)[0];

export {
  bestFingeringFor,
  chordFingerings
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
