/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('coffee-errors');
const should = require('should');
const _ = require('underscore');
_(global).extend(require('../lib/pitches'));

//
// Constants
//

describe('FlatNoteNames', function() {
  it('should have 12 notes', function() {
    FlatNoteNames.should.be.an.Array;
    return FlatNoteNames.should.have.length(12);
  });
  it('should start with C', () => FlatNoteNames[0].should.equal('C'));
  return it('should have five flats', function() {
    FlatNoteNames[1].should.equal('D♭');
    FlatNoteNames[3].should.equal('E♭');
    FlatNoteNames[6].should.equal('G♭');
    FlatNoteNames[8].should.equal('A♭');
    return FlatNoteNames[10].should.equal('B♭');
  });
});

describe('SharpNoteNames', function() {
  it('should have 12 notes', function() {
    SharpNoteNames.should.be.an.Array;
    return SharpNoteNames.should.have.length(12);
  });
  it('should start with C', () => SharpNoteNames[0].should.equal('C'));
  return it('should have five flats', function() {
    SharpNoteNames[1].should.equal('C♯');
    SharpNoteNames[3].should.equal('D♯');
    SharpNoteNames[6].should.equal('F♯');
    SharpNoteNames[8].should.equal('G♯');
    return SharpNoteNames[10].should.equal('A♯');
  });
});

describe('NoteNames', () =>
  it('should equal SharpNoteNames', () =>
    NoteNames.should.equal(SharpNoteNames)));

describe('IntervalNames', function() {
  it('should have 13 intervals', function() {
    IntervalNames.should.be.an.Array;
    return IntervalNames.should.have.length(13);
  });
  it('should start with P1', () => IntervalNames[0].should.equal('P1'));
  return it('should end with P8', () => IntervalNames[12].should.equal('P8'));
});

describe('LongIntervalNames', function() {
  it('should have 13 intervals', function() {
    LongIntervalNames.should.be.an.Array;
    return LongIntervalNames.should.have.length(13);
  });
  it('should start with Unison', () =>
    LongIntervalNames[0].should.equal('Unison'));
  return it('should end with Octave', () =>
    LongIntervalNames[12].should.equal('Octave'));
});

//
// Functions
//

describe('semitonesToAccidentalString', () =>
  it('should turn semitones into strings', function() {
    semitonesToAccidentalString(0).should.equal('');
    semitonesToAccidentalString(-1).should.equal('♭');
    semitonesToAccidentalString(-2).should.equal('𝄫');
    semitonesToAccidentalString(-3).should.equal('♭𝄫');
    semitonesToAccidentalString(-4).should.equal('𝄫𝄫');
    semitonesToAccidentalString(-5).should.equal('♭𝄫𝄫');
    semitonesToAccidentalString(1).should.equal('♯');
    semitonesToAccidentalString(2).should.equal('𝄪');
    semitonesToAccidentalString(3).should.equal('♯𝄪');
    semitonesToAccidentalString(4).should.equal('𝄪𝄪');
    return semitonesToAccidentalString(5).should.equal('♯𝄪𝄪');
  }));

describe('getPitchClassName', function() {
  it('should return natural names', function() {
    getPitchClassName(0).should.equal('C');
    getPitchClassName(2).should.equal('D');
    getPitchClassName(4).should.equal('E');
    getPitchClassName(5).should.equal('F');
    getPitchClassName(7).should.equal('G');
    getPitchClassName(9).should.equal('A');
    return getPitchClassName(11).should.equal('B');
  });

  return it('should return sharp names', function() {
    getPitchClassName(1).should.equal('C♯');
    getPitchClassName(3).should.equal('D♯');
    getPitchClassName(6).should.equal('F♯');
    getPitchClassName(8).should.equal('G♯');
    return getPitchClassName(10).should.equal('A♯');
  });
});

// aka pitchNumberToName
describe('getPitchName', function() {
  it('should return natural names', function() {
    getPitchName(0).should.equal('C');
    getPitchName(2).should.equal('D');
    getPitchName(4).should.equal('E');
    getPitchName(5).should.equal('F');
    getPitchName(7).should.equal('G');
    getPitchName(9).should.equal('A');
    return getPitchName(11).should.equal('B');
  });

  it('should return flat names by default', function() {
    getPitchName(1).should.equal('D♭');
    getPitchName(3).should.equal('E♭');
    getPitchName(6).should.equal('G♭');
    getPitchName(8).should.equal('A♭');
    return getPitchName(10).should.equal('B♭');
  });

  it('should return flat names with flat option', () =>
    getPitchName(1, { flat: true }).should.equal('D♭'));

  it('should return sharp names with sharp option', function() {
    getPitchName(1, { sharp: true }).should.equal('C♯');
    getPitchName(3, { sharp: true }).should.equal('D♯');
    getPitchName(6, { sharp: true }).should.equal('F♯');
    getPitchName(8, { sharp: true }).should.equal('G♯');
    return getPitchName(10, { sharp: true }).should.equal('A♯');
  });

  return it('should return both names with both options', () =>
    getPitchName(1, { sharp: true, flat: true }).should.equal('D♭/\nC♯'));
});

describe('pitchFromScientificNotation', function() {
  it('should parse the pitch class', function() {
    pitchFromScientificNotation('C4').should.equal(60);
    pitchFromScientificNotation('D4').should.equal(62);
    pitchFromScientificNotation('E4').should.equal(64);
    pitchFromScientificNotation('F4').should.equal(65);
    pitchFromScientificNotation('G4').should.equal(67);
    pitchFromScientificNotation('A4').should.equal(69);
    return pitchFromScientificNotation('B4').should.equal(71);
  });
  it('should parse the octave', function() {
    pitchFromScientificNotation('C1').should.equal(24);
    pitchFromScientificNotation('C2').should.equal(36);
    pitchFromScientificNotation('C3').should.equal(48);
    pitchFromScientificNotation('C4').should.equal(60);
    pitchFromScientificNotation('C5').should.equal(72);
    return pitchFromScientificNotation('C6').should.equal(84);
  });
  it('should parse accidentals', function() {
    pitchFromScientificNotation('Cb4').should.equal(59);
    pitchFromScientificNotation('C#4').should.equal(61);
    pitchFromScientificNotation('C♭4').should.equal(59);
    pitchFromScientificNotation('C♯4').should.equal(61);
    pitchFromScientificNotation('C♭♭4').should.equal(58);
    return pitchFromScientificNotation('C♯♯4').should.equal(62);
  });
  return it('should parse double accidentals');
}); //, ->
// pitchFromScientificNotation('C𝄫4').should.equal 58
// pitchFromScientificNotation('C𝄪4').should.equal 62

describe('normalizePitchClass', () =>
  it('should return an integer in 0..11', function() {
    normalizePitchClass(0).should.equal(0);
    normalizePitchClass(11).should.equal(11);
    normalizePitchClass(-1).should.equal(11);
    normalizePitchClass(-13).should.equal(11);
    normalizePitchClass(12).should.equal(0);
    normalizePitchClass(13).should.equal(1);
    return normalizePitchClass(25).should.equal(1);
  }));

// aka pitchNameToNumber
describe('parsePitchClass', function() {
  it('should parse naturals', function() {
    parsePitchClass('C').should.equal(0);
    parsePitchClass('D').should.equal(2);
    parsePitchClass('E').should.equal(4);
    parsePitchClass('F').should.equal(5);
    parsePitchClass('G').should.equal(7);
    parsePitchClass('A').should.equal(9);
    return parsePitchClass('B').should.equal(11);
  });

  it('should parse sharps', function() {
    parsePitchClass('C#').should.equal(1);
    return parsePitchClass('C♯').should.equal(1);
  });

  it('should parse flats', function() {
    parsePitchClass('Cb').should.equal(11);
    return parsePitchClass('C♭').should.equal(11);
  });

  return it('should parse double sharps and flats');
});
// parsePitchClass('C𝄪').should.equal 2
// parsePitchClass('C𝄫').should.equal 10

describe('pitchToPitchClass', () =>
  it('should return an integer in [0...12]', function() {
    pitchToPitchClass(0).should.equal(0);
    pitchToPitchClass(1).should.equal(1);
    pitchToPitchClass(12).should.equal(0);
    pitchToPitchClass(13).should.equal(1);
    pitchToPitchClass(-1).should.equal(11);
    return pitchToPitchClass(-13).should.equal(11);
  }));

describe('intervalClassDifference', () =>
  it('should return an integer in [0...12]', function() {
    intervalClassDifference(0, 5).should.equal(5);
    intervalClassDifference(5, 0).should.equal(7);
    return intervalClassDifference(0, 12).should.equal(0);
  }));

describe('midi2name', () =>
  it('should return a pitch name', function() {
    midi2name(0).should.equal('C-1');
    midi2name(12).should.equal('C0');
    midi2name(13).should.equal('C♯0');
    midi2name(23).should.equal('B0');
    midi2name(24).should.equal('C1');
    midi2name(36).should.equal('C2');
    return midi2name(127).should.equal('G9');
  }));

describe('name2midi', () =>
  it('should return a midi number', function() {
    name2midi('C-1').should.equal(0);
    name2midi('C0').should.equal(12);
    name2midi('C♯0').should.equal(13);
    name2midi('B0').should.equal(23);
    name2midi('C1').should.equal(24);
    name2midi('C2').should.equal(36);
    return name2midi('G9').should.equal(127);
  }));

//
// Objects
//

describe('Interval', function() {
  it('should implement fromString', function() {
    Interval.fromString('P1').semitones.should.equal(0);
    Interval.fromString('m2').semitones.should.equal(1);
    Interval.fromString('M2').semitones.should.equal(2);
    Interval.fromString('m3').semitones.should.equal(3);
    Interval.fromString('M3').semitones.should.equal(4);
    Interval.fromString('P4').semitones.should.equal(5);
    Interval.fromString('TT').semitones.should.equal(6);
    Interval.fromString('P5').semitones.should.equal(7);
    Interval.fromString('m6').semitones.should.equal(8);
    Interval.fromString('M6').semitones.should.equal(9);
    Interval.fromString('m7').semitones.should.equal(10);
    Interval.fromString('M7').semitones.should.equal(11);
    return Interval.fromString('P8').semitones.should.equal(12);
  });

  it('should implement toString', function() {
    Interval.fromSemitones(0)
      .toString()
      .should.equal('P1');
    Interval.fromSemitones(1)
      .toString()
      .should.equal('m2');
    Interval.fromSemitones(4)
      .toString()
      .should.equal('M3');
    return Interval.fromSemitones(12)
      .toString()
      .should.equal('P8');
  });

  it('should be interned', function() {
    Interval.fromString('P1').should.equal(Interval.fromString('P1'));
    Interval.fromString('M2').should.equal(Interval.fromString('M2'));
    return Interval.fromString('P1').should.not.equal(
      Interval.fromString('M2')
    );
  });

  describe('add', () =>
    it('should add to an interval', () =>
      Interval.fromString('m2').add(Interval.fromString('M2')).semitones
        .should === 3));

  return describe('between', function() {
    it('should return the interval between two pitches', function() {
      Interval.between(Pitch.fromString('E4'), Pitch.fromString('E4'))
        .toString()
        .should.equal('P1');
      Interval.between(Pitch.fromString('E4'), Pitch.fromString('F4'))
        .toString()
        .should.equal('m2');
      return Interval.between(Pitch.fromString('E4'), Pitch.fromString('G4'))
        .toString()
        .should.equal('m3');
    });
    return it('should use modular arithmetic', () =>
      Interval.between(Pitch.fromString('F4'), Pitch.fromString('C4'))
        .toString()
        .should.equal('P5'));
  });
});

describe('Intervals', () => it('should be an array of Interval'));

describe('Pitch', function() {
  it('should parse scientific notation', function() {
    Pitch.fromString('C4').midiNumber.should.equal(60);
    Pitch.fromString('C5').midiNumber.should.equal(72);
    Pitch.fromString('E4').midiNumber.should.equal(64);
    return Pitch.fromString('G5').midiNumber.should.equal(79);
  });

  it('should parse Helmholtz notation', function() {
    Pitch.fromString('C,').midiNumber.should.equal(24);
    Pitch.fromString('D,').midiNumber.should.equal(26);
    Pitch.fromString('C').midiNumber.should.equal(36);
    Pitch.fromString('c').midiNumber.should.equal(48);
    Pitch.fromString('c♯').midiNumber.should.equal(49);
    Pitch.fromString('c♭').midiNumber.should.equal(47);
    Pitch.fromString("c'").midiNumber.should.equal(60);
    Pitch.fromString("c'''").midiNumber.should.equal(84);
    return Pitch.fromString("d'''").midiNumber.should.equal(86);
  });

  it('should implement toString', function() {
    Pitch.fromMidiNumber(60)
      .toString()
      .should.equal('C4');
    Pitch.fromMidiNumber(72)
      .toString()
      .should.equal('C5');
    Pitch.fromMidiNumber(64)
      .toString()
      .should.equal('E4');
    return Pitch.fromMidiNumber(79)
      .toString()
      .should.equal('G5');
  });

  it('should add to an interval', function() {
    Pitch.fromString('C4')
      .add(Interval.fromString('P1'))
      .toString()
      .should.equal('C4');
    Pitch.fromString('C4')
      .add(Interval.fromString('M2'))
      .toString()
      .should.equal('D4');
    return Pitch.fromString('C4')
      .add(Interval.fromString('P8'))
      .toString()
      .should.equal('C5');
  });

  it('should implement transposeBy', () =>
    Pitch.fromString('C4')
      .transposeBy(Interval.fromString('M2'))
      .toString()
      .should.equal('D4'));

  it('#toPitch should return itself');
  return it('#toPitchClass should return its pitch class');
});

describe('PitchClass', function() {
  it('#fromString should construct a pitch class', function() {
    PitchClass.fromString('C').semitones.should.equal(0);
    PitchClass.fromString('E').semitones.should.equal(4);
    PitchClass.fromString('G').semitones.should.equal(7);
    PitchClass.fromString('C♭').semitones.should.equal(11);
    return PitchClass.fromString('C♯').semitones.should.equal(1);
  });

  it('#fromSemitones should construct a pitch class');

  it('#enharmonicizeTo should return the enharmonic equivalent within a scale');

  it('#toString should return the name of the pitch class', function() {
    PitchClass.fromSemitones(0)
      .toString()
      .should.equal('C');
    PitchClass.fromSemitones(2)
      .toString()
      .should.equal('D');
    return PitchClass.fromSemitones(4)
      .toString()
      .should.equal('E');
  });

  it('should normalize its input', function() {
    PitchClass.fromSemitones(12)
      .toString()
      .should.equal('C');
    return PitchClass.fromSemitones(14)
      .toString()
      .should.equal('D');
  });

  it('should add to an interval', () =>
    PitchClass.fromString('C')
      .add(Interval.fromString('M2'))
      .toString()
      .should.equal('D'));

  it('#toPitch should return a pitch within the specified octave');
  return it('#toPitchClass should return itself');
});

describe('Pitches', () =>
  it('should contain 12 pitches', function() {
    Pitches.should.be.an.Array;
    Pitches.should.have.length(12);
    return Pitches[0].should.be.an.instanceOf(Pitch);
  }));
