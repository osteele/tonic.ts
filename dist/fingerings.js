var Fingering, FretNumbers, Instruments, bestFingeringFor, chordFingerings, collectBarreSets, computeBarreCandidateStrings, findBarres, fingerPositionsOnChord, fretboardPositionsEach, getPitchClassName, intervalClassDifference, pitchNumberForPosition, powerset, util, _, _ref,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

util = require('util');

_ = require('underscore');

_ref = require('./theory'), getPitchClassName = _ref.getPitchClassName, intervalClassDifference = _ref.intervalClassDifference;

Instruments = require('./instruments');

FretNumbers = Instruments.FretNumbers, fretboardPositionsEach = Instruments.fretboardPositionsEach, pitchNumberForPosition = Instruments.pitchNumberForPosition;

require('./utils');

Fingering = (function() {
  function Fingering(_arg) {
    this.positions = _arg.positions, this.chord = _arg.chord, this.barres = _arg.barres, this.instrument = _arg.instrument;
    this.positions.sort(function(a, b) {
      return a.string - b.string;
    });
    this.properties = {};
  }

  Fingering.cached_getter('fretstring', function() {
    var fret, fretArray, s, string, x, _i, _len, _ref1, _ref2;
    fretArray = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = this.instrument.stringNumbers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        s = _ref1[_i];
        _results.push(-1);
      }
      return _results;
    }).call(this);
    _ref1 = this.positions;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      _ref2 = _ref1[_i], string = _ref2.string, fret = _ref2.fret;
      fretArray[string] = fret;
    }
    return ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = fretArray.length; _j < _len1; _j++) {
        x = fretArray[_j];
        _results.push(x >= 0 ? x : 'x');
      }
      return _results;
    })()).join('');
  });

  Fingering.cached_getter('chordName', function() {
    var name;
    name = this.chord.name;
    if (this.inversion > 0) {
      name += " / " + (getPitchClassName(this.instrument.pitchAt(this.positions[0])));
    }
    return name;
  });

  Fingering.cached_getter('inversion', function() {
    return this.chord.pitchClasses.indexOf(intervalClassDifference(this.chord.rootPitch, this.instrument.pitchAt(this.positions[0])));
  });

  Fingering.cached_getter('inversionLetter', function() {
    if (!(this.inversion > 0)) {
      return;
    }
    return String.fromCharCode(96 + this.inversion);
  });

  return Fingering;

})();

powerset = function(array) {
  var tail, x, xs, ys;
  if (!array.length) {
    return [[]];
  }
  x = array[0], xs = 2 <= array.length ? __slice.call(array, 1) : [];
  tail = powerset(xs);
  return tail.concat((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = tail.length; _i < _len; _i++) {
      ys = tail[_i];
      _results.push([x].concat(ys));
    }
    return _results;
  })());
};

computeBarreCandidateStrings = function(instrument, fretArray) {
  var codeStrings, fret, referenceFret, _i, _len;
  codeStrings = [];
  for (_i = 0, _len = fretArray.length; _i < _len; _i++) {
    referenceFret = fretArray[_i];
    if (typeof referenceFret !== 'number') {
      continue;
    }
    codeStrings[referenceFret] || (codeStrings[referenceFret] = ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = fretArray.length; _j < _len1; _j++) {
        fret = fretArray[_j];
        if (fret < referenceFret) {
          _results.push('<');
        } else if (fret > referenceFret) {
          _results.push('>');
        } else if (fret === referenceFret) {
          _results.push('=');
        } else {
          _results.push('x');
        }
      }
      return _results;
    })()).join(''));
  }
  return codeStrings;
};

findBarres = function(instrument, fretArray) {
  var barres, codeString, fret, match, run, _i, _len, _ref1;
  barres = [];
  _ref1 = computeBarreCandidateStrings(instrument, fretArray);
  for (fret = _i = 0, _len = _ref1.length; _i < _len; fret = ++_i) {
    codeString = _ref1[fret];
    if (fret === 0) {
      continue;
    }
    if (!codeString) {
      continue;
    }
    match = codeString.match(/(=[>=]+)/);
    if (!match) {
      continue;
    }
    run = match[1];
    if (!(run.match(/\=/g).length > 1)) {
      continue;
    }
    barres.push({
      fret: fret,
      firstString: match.index,
      stringCount: run.length,
      fingerReplacementCount: run.match(/\=/g).length
    });
  }
  return barres;
};

collectBarreSets = function(instrument, fretArray) {
  var barres;
  barres = findBarres(instrument, fretArray);
  return powerset(barres);
};

fingerPositionsOnChord = function(chord, instrument) {
  var pitchClasses, positions, rootPitch;
  rootPitch = chord.rootPitch, pitchClasses = chord.pitchClasses;
  positions = [];
  instrument.eachFingerPosition(function(pos) {
    var degreeIndex, intervalClass;
    intervalClass = intervalClassDifference(rootPitch, instrument.pitchAt(pos));
    degreeIndex = pitchClasses.indexOf(intervalClass);
    if (degreeIndex >= 0) {
      return positions.push(pos);
    }
  });
  return positions;
};

chordFingerings = function(chord, instrument, options) {
  var chordNoteCount, collectFingeringPositions, containsAllChordPitches, countDistinctNotes, filterFingerings, filters, fingering, fingerings, fn, fourFingersOrFewer, fretsPerString, generateFingerings, getFingerCount, hasAllNotes, highNoteCount, isRootPosition, maximumFretDistance, mutedMedialStrings, mutedTrebleStrings, name, preferences, properties, reverseSortKey, sortFingerings, value, warn, _i, _len;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    filter: true,
    allPositions: false
  }, options);
  warn = false;
  if (chord.rootPitch == null) {
    throw new Error("No root for " + (util.inspect(chord)));
  }
  fretsPerString = function() {
    var fret, pos, positions, s, string, strings, _i, _len, _ref1;
    positions = fingerPositionsOnChord(chord, instrument);
    if (!options.allPositions) {
      positions = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = positions.length; _i < _len; _i++) {
          pos = positions[_i];
          if (pos.fret <= 4) {
            _results.push(pos);
          }
        }
        return _results;
      })();
    }
    strings = (function() {
      var _i, _ref1, _results;
      _results = [];
      for (s = _i = 0, _ref1 = instrument.stringCount; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; s = 0 <= _ref1 ? ++_i : --_i) {
        _results.push([null]);
      }
      return _results;
    })();
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      _ref1 = positions[_i], string = _ref1.string, fret = _ref1.fret;
      strings[string].push(fret);
    }
    return strings;
  };
  collectFingeringPositions = function(fretCandidatesPerString) {
    var fill, fretArray, positionSet, stringCount;
    stringCount = fretCandidatesPerString.length;
    positionSet = [];
    fretArray = [];
    fill = function(s) {
      var fret, _i, _len, _ref1, _results;
      if (s === stringCount) {
        return positionSet.push(fretArray.slice());
      } else {
        _ref1 = fretCandidatesPerString[s];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          fret = _ref1[_i];
          fretArray[s] = fret;
          _results.push(fill(s + 1));
        }
        return _results;
      }
    };
    fill(0);
    return positionSet;
  };
  containsAllChordPitches = function(fretArray) {
    var fret, pitchClass, pitches, string, _i, _len;
    pitches = [];
    for (string = _i = 0, _len = fretArray.length; _i < _len; string = ++_i) {
      fret = fretArray[string];
      if (typeof fret !== 'number') {
        continue;
      }
      pitchClass = (instrument.pitchAt({
        fret: fret,
        string: string
      })) % 12;
      if (!(pitches.indexOf(pitchClass) >= 0)) {
        pitches.push(pitchClass);
      }
    }
    return pitches.length === chord.pitchClasses.length;
  };
  maximumFretDistance = function(fretArray) {
    var fret, frets;
    frets = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fretArray.length; _i < _len; _i++) {
        fret = fretArray[_i];
        if (typeof fret === 'number') {
          _results.push(fret);
        }
      }
      return _results;
    })();
    return Math.max.apply(Math, frets) - Math.min.apply(Math, frets) <= 3;
  };
  generateFingerings = function() {
    var barres, fingerings, fret, fretArray, fretArrays, pos, positions, sets, string, _i, _j, _k, _len, _len1, _len2;
    fingerings = [];
    fretArrays = collectFingeringPositions(fretsPerString());
    fretArrays = fretArrays.filter(containsAllChordPitches);
    fretArrays = fretArrays.filter(maximumFretDistance);
    for (_i = 0, _len = fretArrays.length; _i < _len; _i++) {
      fretArray = fretArrays[_i];
      positions = (function() {
        var _j, _len1, _results;
        _results = [];
        for (string = _j = 0, _len1 = fretArray.length; _j < _len1; string = ++_j) {
          fret = fretArray[string];
          if (typeof fret === 'number') {
            _results.push({
              fret: fret,
              string: string
            });
          }
        }
        return _results;
      })();
      for (_j = 0, _len1 = positions.length; _j < _len1; _j++) {
        pos = positions[_j];
        pos.intervalClass = intervalClassDifference(chord.rootPitch, instrument.pitchAt(pos));
        pos.degreeIndex = chord.pitchClasses.indexOf(pos.intervalClass);
      }
      sets = [[]];
      if (positions.length > 4) {
        sets = collectBarreSets(instrument, fretArray);
      }
      for (_k = 0, _len2 = sets.length; _k < _len2; _k++) {
        barres = sets[_k];
        fingerings.push(new Fingering({
          positions: positions,
          chord: chord,
          barres: barres,
          instrument: instrument
        }));
      }
    }
    return fingerings;
  };
  chordNoteCount = chord.pitchClasses.length;
  countDistinctNotes = function(fingering) {
    var intervalClass, pitches, _i, _len, _ref1;
    pitches = [];
    _ref1 = fingering.positions;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      intervalClass = _ref1[_i].intervalClass;
      if (__indexOf.call(pitches, intervalClass) < 0) {
        pitches.push(intervalClass);
      }
    }
    return pitches.length;
  };
  hasAllNotes = function(fingering) {
    return countDistinctNotes(fingering) === chordNoteCount;
  };
  mutedMedialStrings = function(fingering) {
    return fingering.fretstring.match(/\dx+\d/);
  };
  mutedTrebleStrings = function(fingering) {
    return fingering.fretstring.match(/x$/);
  };
  getFingerCount = function(fingering) {
    var barre, n, pos, _i, _len, _ref1;
    n = ((function() {
      var _i, _len, _ref1, _results;
      _ref1 = fingering.positions;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        pos = _ref1[_i];
        if (pos.fret > 0) {
          _results.push(pos);
        }
      }
      return _results;
    })()).length;
    _ref1 = fingering.barres;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      barre = _ref1[_i];
      n -= barre.fingerReplacementCount - 1;
    }
    return n;
  };
  fourFingersOrFewer = function(fingering) {
    return getFingerCount(fingering) <= 4;
  };
  filters = [];
  if (options.filter) {
    filters.push({
      name: 'four fingers or fewer',
      select: fourFingersOrFewer
    });
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
  filterFingerings = function(fingerings) {
    var filtered, name, reject, select, _i, _len, _ref1;
    for (_i = 0, _len = filters.length; _i < _len; _i++) {
      _ref1 = filters[_i], name = _ref1.name, select = _ref1.select, reject = _ref1.reject;
      filtered = fingerings;
      if (reject) {
        select = (function(x) {
          return !reject(x);
        });
      }
      if (select) {
        filtered = filtered.filter(select);
      }
      if (!filtered.length) {
        if (warn) {
          console.warn("" + chord_name + ": no fingerings pass filter \"" + name + "\"");
        }
        filtered = fingerings;
      }
      fingerings = filtered;
    }
    return fingerings;
  };
  highNoteCount = function(fingering) {
    return fingering.positions.length;
  };
  isRootPosition = function(fingering) {
    return _(fingering.positions).sortBy(function(pos) {
      return pos.string;
    })[0].degreeIndex === 0;
  };
  reverseSortKey = function(fn) {
    return function(a) {
      return -fn(a);
    };
  };
  preferences = [
    {
      name: 'root position',
      key: isRootPosition
    }, {
      name: 'high note count',
      key: highNoteCount
    }, {
      name: 'avoid barres',
      key: reverseSortKey(function(fingering) {
        return fingering.barres.length;
      })
    }, {
      name: 'low finger count',
      key: reverseSortKey(getFingerCount)
    }
  ];
  sortFingerings = function(fingerings) {
    var key, _i, _len, _ref1;
    _ref1 = preferences.slice(0).reverse();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      key = _ref1[_i].key;
      fingerings = _(fingerings).sortBy(key);
    }
    fingerings.reverse();
    return fingerings;
  };
  fingerings = generateFingerings();
  fingerings = filterFingerings(fingerings);
  fingerings = sortFingerings(fingerings);
  properties = {
    root: isRootPosition,
    barres: function(f) {
      return f.barres.length;
    },
    fingers: getFingerCount,
    inversion: function(f) {
      return f.inversionLetter || '';
    },
    skipping: /\dx+\d/,
    muting: /\dx/,
    open: /0/,
    triad: function(_arg) {
      var positions;
      positions = _arg.positions;
      return positions.length === 3;
    },
    position: function(_arg) {
      var positions;
      positions = _arg.positions;
      return Math.max(_.min(_.pluck(positions, 'fret')) - 1, 0);
    },
    strings: function(_arg) {
      var positions;
      positions = _arg.positions;
      return positions.length;
    }
  };
  for (name in properties) {
    fn = properties[name];
    for (_i = 0, _len = fingerings.length; _i < _len; _i++) {
      fingering = fingerings[_i];
      value = fn instanceof RegExp ? fn.test(fingering.fretstring) : fn(fingering);
      fingering.properties[name] = value;
    }
  }
  return fingerings;
};

bestFingeringFor = function(chord, instrument) {
  return chordFingerings(chord, instrument)[0];
};

module.exports = {
  bestFingeringFor: bestFingeringFor,
  chordFingerings: chordFingerings
};

/*
//@ sourceMappingURL=fingerings.js.map
*/