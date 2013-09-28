var FretCount, FretNumbers, Instrument, intervalClassDifference, intervalPositionsFromRoot, pitchFromScientificNotation, _ref;

_ref = require('./theory'), intervalClassDifference = _ref.intervalClassDifference, pitchFromScientificNotation = _ref.pitchFromScientificNotation;

Instrument = (function() {
  function Instrument() {}

  Instrument.prototype.stringCount = 6;

  Instrument.prototype.strings = 6;

  Instrument.prototype.fretCount = 12;

  Instrument.prototype.stringNumbers = [0, 1, 2, 3, 4, 5];

  Instrument.prototype.stringPitches = 'E4 B3 G3 D3 A2 E2'.split(/\s/).reverse().map(pitchFromScientificNotation);

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
  Default: new Instrument,
  FretNumbers: FretNumbers,
  FretCount: FretCount,
  intervalPositionsFromRoot: intervalPositionsFromRoot
};

/*
//@ sourceMappingURL=instruments.js.map
*/