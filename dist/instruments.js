var FretCount, FretNumbers, Instrument, Instruments, intervalClassDifference, intervalPositionsFromRoot, pitchFromScientificNotation, _ref;

_ref = require('./theory'), intervalClassDifference = _ref.intervalClassDifference, pitchFromScientificNotation = _ref.pitchFromScientificNotation;

Instrument = (function() {
  Instrument.prototype.stringCount = 6;

  Instrument.prototype.strings = 6;

  Instrument.prototype.fretCount = 12;

  Instrument.prototype.stringNumbers = [0, 1, 2, 3, 4, 5];

  Instrument.prototype.stringPitches = 'E4 B3 G3 D3 A2 E2'.split(/\s/).reverse().map(pitchFromScientificNotation);

  function Instrument(_arg) {
    this.name = _arg.name, this.fretted = _arg.fretted;
  }

  Instrument.prototype.eachFingerPosition = function(fn) {
    var fret, string, _i, _len, _ref1, _results;
    _ref1 = this.stringNumbers;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      string = _ref1[_i];
      _results.push((function() {
        var _j, _ref2, _results1;
        _results1 = [];
        for (fret = _j = 0, _ref2 = this.fretCount; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; fret = 0 <= _ref2 ? ++_j : --_j) {
          _results1.push(fn({
            string: string,
            fret: fret
          }));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Instrument.prototype.pitchAt = function(_arg) {
    var fret, string;
    string = _arg.string, fret = _arg.fret;
    return this.stringPitches[string] + fret;
  };

  return Instrument;

})();

Instruments = [
  {
    name: 'Guitar',
    fretted: true
  }, {
    name: 'Violin',
    stringPitches: [7, 14, 21, 28]
  }, {
    name: 'Viola',
    stringPitches: [0, 7, 14, 21]
  }, {
    name: 'Cello',
    stringPitches: [0, 7, 14, 21]
  }
].map(function(attrs) {
  return new Instrument(attrs);
});

(function() {
  var instrument, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = Instruments.length; _i < _len; _i++) {
    instrument = Instruments[_i];
    _results.push(Instruments[instrument.name] = instrument);
  }
  return _results;
})();

FretNumbers = [0, 1, 2, 3, 4];

FretCount = FretNumbers.length - 1;

intervalPositionsFromRoot = function(instrument, rootPosition, semitones) {
  var positions, rootPitch;
  rootPitch = instrument.pitchAt(rootPosition);
  positions = [];
  fretboard_positions_each(function(fingerPosition) {
    if (intervalClassDifference(rootPitch, instrument.pitchAt(fingerPosition)) !== semitones) {
      return;
    }
    return positions.push(fingerPosition);
  });
  return positions;
};

module.exports = {
  Default: Instruments.Guitar,
  FretNumbers: FretNumbers,
  FretCount: FretCount,
  Instruments: Instruments,
  intervalPositionsFromRoot: intervalPositionsFromRoot
};

/*
//@ sourceMappingURL=instruments.js.map
*/