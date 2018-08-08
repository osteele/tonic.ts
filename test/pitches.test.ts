import { semitonesToAccidentalString } from '../src/accidentals';
import { FlatNoteNames, Interval, intervalClassDifference, IntervalNames, LongIntervalNames, NoteNames, Pitch, PitchClass, Pitches, SharpNoteNames } from '../src/index';
import { midi2name, name2midi } from '../src/midi';
import { getPitchClassName, getPitchName, normalizePitchClass, parsePitchClass, pitchFromScientificNotation, pitchToPitchClass } from '../src/names';

//
// Constants
//

describe('FlatNoteNames', () => {
  it('should have 12 notes', () => {
    expect(FlatNoteNames).toHaveLength(12);
  });
  it('should start with C', () => expect(FlatNoteNames[0]).toBe('C'));
  it('should have five flats', () => {
    expect(FlatNoteNames[1]).toBe('D♭');
    expect(FlatNoteNames[3]).toBe('E♭');
    expect(FlatNoteNames[6]).toBe('G♭');
    expect(FlatNoteNames[8]).toBe('A♭');
    expect(FlatNoteNames[10]).toBe('B♭');
  });
});

describe('SharpNoteNames', () => {
  it('should have 12 notes', () => {
    expect(SharpNoteNames).toHaveLength(12);
  });
  it('should start with C', () => expect(SharpNoteNames[0]).toBe('C'));
  it('should have five flats', () => {
    expect(SharpNoteNames[1]).toBe('C♯');
    expect(SharpNoteNames[3]).toBe('D♯');
    expect(SharpNoteNames[6]).toBe('F♯');
    expect(SharpNoteNames[8]).toBe('G♯');
    expect(SharpNoteNames[10]).toBe('A♯');
  });
});

describe('NoteNames', () =>
  it('should equal SharpNoteNames', () =>
    expect(NoteNames).toEqual(SharpNoteNames)));

describe('IntervalNames', () => {
  it('should have 13 intervals', () => {
    expect(IntervalNames).toHaveLength(13);
  });
  it('should start with P1', () => expect(IntervalNames[0]).toBe('P1'));
  it('should end with P8', () => expect(IntervalNames[12]).toBe('P8'));
});

describe('LongIntervalNames', () => {
  it('should have 13 intervals', () => {
    expect(LongIntervalNames).toHaveLength(13);
  });
  it('should start with Unison', () =>
    expect(LongIntervalNames[0]).toBe('Unison'));
  it('should end with Octave', () =>
    expect(LongIntervalNames[12]).toBe('Octave'));
});

//
// Functions
//

describe('semitonesToAccidentalString', () =>
  it('should turn semitones into strings', () => {
    expect(semitonesToAccidentalString(0)).toBe('');
    expect(semitonesToAccidentalString(-1)).toBe('♭');
    expect(semitonesToAccidentalString(-2)).toBe('𝄫');
    expect(semitonesToAccidentalString(-3)).toBe('♭𝄫');
    expect(semitonesToAccidentalString(-4)).toBe('𝄫𝄫');
    expect(semitonesToAccidentalString(-5)).toBe('♭𝄫𝄫');
    expect(semitonesToAccidentalString(1)).toBe('♯');
    expect(semitonesToAccidentalString(2)).toBe('𝄪');
    expect(semitonesToAccidentalString(3)).toBe('♯𝄪');
    expect(semitonesToAccidentalString(4)).toBe('𝄪𝄪');
    expect(semitonesToAccidentalString(5)).toBe('♯𝄪𝄪');
  }));

describe('getPitchClassName', () => {
  it('should return natural names', () => {
    expect(getPitchClassName(0)).toBe('C');
    expect(getPitchClassName(2)).toBe('D');
    expect(getPitchClassName(4)).toBe('E');
    expect(getPitchClassName(5)).toBe('F');
    expect(getPitchClassName(7)).toBe('G');
    expect(getPitchClassName(9)).toBe('A');
    expect(getPitchClassName(11)).toBe('B');
  });

  it('should return sharp names', () => {
    expect(getPitchClassName(1)).toBe('C♯');
    expect(getPitchClassName(3)).toBe('D♯');
    expect(getPitchClassName(6)).toBe('F♯');
    expect(getPitchClassName(8)).toBe('G♯');
    expect(getPitchClassName(10)).toBe('A♯');
  });
});

// aka pitchNumberToName
describe('getPitchName', () => {
  it('should return natural names', () => {
    expect(getPitchName(0)).toBe('C');
    expect(getPitchName(2)).toBe('D');
    expect(getPitchName(4)).toBe('E');
    expect(getPitchName(5)).toBe('F');
    expect(getPitchName(7)).toBe('G');
    expect(getPitchName(9)).toBe('A');
    expect(getPitchName(11)).toBe('B');
  });

  it('should return flat names by default', () => {
    expect(getPitchName(1)).toBe('D♭');
    expect(getPitchName(3)).toBe('E♭');
    expect(getPitchName(6)).toBe('G♭');
    expect(getPitchName(8)).toBe('A♭');
    expect(getPitchName(10)).toBe('B♭');
  });

  it('should return flat names with flat option', () =>
    expect(getPitchName(1, { flat: true })).toBe('D♭'));

  it('should return sharp names with sharp option', () => {
    expect(getPitchName(1, { sharp: true })).toBe('C♯');
    expect(getPitchName(3, { sharp: true })).toBe('D♯');
    expect(getPitchName(6, { sharp: true })).toBe('F♯');
    expect(getPitchName(8, { sharp: true })).toBe('G♯');
    expect(getPitchName(10, { sharp: true })).toBe('A♯');
  });

  it('should return both names with both options', () =>
    expect(getPitchName(1, { sharp: true, flat: true })).toBe('D♭/\nC♯'));
});

describe('pitchFromScientificNotation', () => {
  it('should parse the pitch class', () => {
    expect(pitchFromScientificNotation('C4')).toBe(60);
    expect(pitchFromScientificNotation('D4')).toBe(62);
    expect(pitchFromScientificNotation('E4')).toBe(64);
    expect(pitchFromScientificNotation('F4')).toBe(65);
    expect(pitchFromScientificNotation('G4')).toBe(67);
    expect(pitchFromScientificNotation('A4')).toBe(69);
    expect(pitchFromScientificNotation('B4')).toBe(71);
  });
  it('should parse the octave', () => {
    expect(pitchFromScientificNotation('C1')).toBe(24);
    expect(pitchFromScientificNotation('C2')).toBe(36);
    expect(pitchFromScientificNotation('C3')).toBe(48);
    expect(pitchFromScientificNotation('C4')).toBe(60);
    expect(pitchFromScientificNotation('C5')).toBe(72);
    expect(pitchFromScientificNotation('C6')).toBe(84);
  });
  it('should parse accidentals', () => {
    expect(pitchFromScientificNotation('Cb4')).toBe(59);
    expect(pitchFromScientificNotation('C#4')).toBe(61);
    expect(pitchFromScientificNotation('C♭4')).toBe(59);
    expect(pitchFromScientificNotation('C♯4')).toBe(61);
    expect(pitchFromScientificNotation('C♭♭4')).toBe(58);
    expect(pitchFromScientificNotation('C♯♯4')).toBe(62);
  });
  // test.skip('should parse double accidentals');
});
// expect(pitchFromScientificNotation('C𝄫4')).toBe(58);
// expect(pitchFromScientificNotation('C𝄪4')).toBe(62);

describe('normalizePitchClass', () => {
  it('should return an integer in 0..11', () => {
    expect(normalizePitchClass(0)).toBe(0);
    expect(normalizePitchClass(11)).toBe(11);
    expect(normalizePitchClass(-1)).toBe(11);
    expect(normalizePitchClass(-13)).toBe(11);
    expect(normalizePitchClass(12)).toBe(0);
    expect(normalizePitchClass(13)).toBe(1);
    expect(normalizePitchClass(25)).toBe(1);
  });
});

// aka pitchNameToNumber
describe('parsePitchClass', () => {
  it('should parse naturals', () => {
    expect(parsePitchClass('C')).toBe(0);
    expect(parsePitchClass('D')).toBe(2);
    expect(parsePitchClass('E')).toBe(4);
    expect(parsePitchClass('F')).toBe(5);
    expect(parsePitchClass('G')).toBe(7);
    expect(parsePitchClass('A')).toBe(9);
    expect(parsePitchClass('B')).toBe(11);
  });

  it('should parse sharps', () => {
    expect(parsePitchClass('C#')).toBe(1);
    expect(parsePitchClass('C♯')).toBe(1);
  });

  it('should parse flats', () => {
    expect(parsePitchClass('Cb')).toBe(11);
    expect(parsePitchClass('C♭')).toBe(11);
  });

  // test.skip('should parse double sharps and flats');
});
// expect(parsePitchClass('C𝄪')).toBe(2)
// expect(parsePitchClass('C𝄫')).toBe(10)

describe('pitchToPitchClass', () => {
  it('should return an integer in [0...12]', () => {
    expect(pitchToPitchClass(0)).toBe(0);
    expect(pitchToPitchClass(1)).toBe(1);
    expect(pitchToPitchClass(12)).toBe(0);
    expect(pitchToPitchClass(13)).toBe(1);
    expect(pitchToPitchClass(-1)).toBe(11);
    expect(pitchToPitchClass(-13)).toBe(11);
  });
});

describe('intervalClassDifference', () =>
  it('should return an integer in [0...12]', () => {
    expect(intervalClassDifference(0, 5)).toBe(5);
    expect(intervalClassDifference(5, 0)).toBe(7);
    expect(intervalClassDifference(0, 12)).toBe(0);
  }));

describe('midi2name', () =>
  it('should return a pitch name', () => {
    expect(midi2name(0)).toBe('C-1');
    expect(midi2name(12)).toBe('C0');
    expect(midi2name(13)).toBe('C♯0');
    expect(midi2name(23)).toBe('B0');
    expect(midi2name(24)).toBe('C1');
    expect(midi2name(36)).toBe('C2');
    expect(midi2name(127)).toBe('G9');
  }));

describe('name2midi', () =>
  it('should return a midi number', () => {
    expect(name2midi('C-1')).toBe(0);
    expect(name2midi('C0')).toBe(12);
    expect(name2midi('C♯0')).toBe(13);
    expect(name2midi('B0')).toBe(23);
    expect(name2midi('C1')).toBe(24);
    expect(name2midi('C2')).toBe(36);
    expect(name2midi('G9')).toBe(127);
  }));

//
// Objects
//

describe('Interval', () => {
  it('should implement fromString', () => {
    expect(Interval.fromString('P1').semitones).toBe(0);
    expect(Interval.fromString('m2').semitones).toBe(1);
    expect(Interval.fromString('M2').semitones).toBe(2);
    expect(Interval.fromString('m3').semitones).toBe(3);
    expect(Interval.fromString('M3').semitones).toBe(4);
    expect(Interval.fromString('P4').semitones).toBe(5);
    expect(Interval.fromString('TT').semitones).toBe(6);
    expect(Interval.fromString('P5').semitones).toBe(7);
    expect(Interval.fromString('m6').semitones).toBe(8);
    expect(Interval.fromString('M6').semitones).toBe(9);
    expect(Interval.fromString('m7').semitones).toBe(10);
    expect(Interval.fromString('M7').semitones).toBe(11);
    expect(Interval.fromString('P8').semitones).toBe(12);
  });

  it('should implement toString', () => {
    expect(Interval.fromSemitones(0).toString()).toBe('P1');
    expect(Interval.fromSemitones(1).toString()).toBe('m2');
    expect(Interval.fromSemitones(4).toString()).toBe('M3');
    expect(Interval.fromSemitones(12).toString()).toBe('P8');
  });

  it('should be interned', () => {
    expect(Interval.fromString('P1')).toBe(Interval.fromString('P1'));
    expect(Interval.fromString('M2')).toBe(Interval.fromString('M2'));
    expect(Interval.fromString('P1')).not.toBe(Interval.fromString('M2'));
  });

  describe('add', () =>
    it('should add to an interval', () =>
      expect(
        Interval.fromString('m2').add(Interval.fromString('M2')).semitones
      ).toBe(3)));

  describe('between', () => {
    it('should return the interval between two pitches', () => {
      expect(
        Interval.between(
          Pitch.fromString('E4'),
          Pitch.fromString('E4')
        ).toString()
      ).toBe('P1');
      expect(
        Interval.between(
          Pitch.fromString('E4'),
          Pitch.fromString('F4')
        ).toString()
      ).toBe('m2');
      expect(
        Interval.between(
          Pitch.fromString('E4'),
          Pitch.fromString('G4')
        ).toString()
      ).toBe('m3');
    });
    it('should use modular arithmetic', () =>
      expect(
        Interval.between(
          Pitch.fromString('F4'),
          Pitch.fromString('C4')
        ).toString()
      ).toBe('P5'));
  });
});

describe('Intervals', () => {
  // test.skip('should be an array of Interval')
});

describe('Pitch', () => {
  it('should parse scientific notation', () => {
    expect(Pitch.fromString('C4').midiNumber).toBe(60);
    expect(Pitch.fromString('C5').midiNumber).toBe(72);
    expect(Pitch.fromString('E4').midiNumber).toBe(64);
    expect(Pitch.fromString('G5').midiNumber).toBe(79);
  });

  it('should parse Helmholtz notation', () => {
    expect(Pitch.fromString('C,').midiNumber).toBe(24);
    expect(Pitch.fromString('D,').midiNumber).toBe(26);
    expect(Pitch.fromString('C').midiNumber).toBe(36);
    expect(Pitch.fromString('c').midiNumber).toBe(48);
    expect(Pitch.fromString('c♯').midiNumber).toBe(49);
    expect(Pitch.fromString('c♭').midiNumber).toBe(47);
    expect(Pitch.fromString("c'").midiNumber).toBe(60);
    expect(Pitch.fromString("c'''").midiNumber).toBe(84);
    expect(Pitch.fromString("d'''").midiNumber).toBe(86);
  });

  it('should implement toString', () => {
    expect(Pitch.fromMidiNumber(60).toString()).toBe('C4');
    expect(Pitch.fromMidiNumber(72).toString()).toBe('C5');
    expect(Pitch.fromMidiNumber(64).toString()).toBe('E4');
    expect(Pitch.fromMidiNumber(79).toString()).toBe('G5');
  });

  it('should add to an interval', () => {
    expect(
      Pitch.fromString('C4')
        .add(Interval.fromString('P1'))
        .toString()
    ).toBe('C4');
    expect(
      Pitch.fromString('C4')
        .add(Interval.fromString('M2'))
        .toString()
    ).toBe('D4');
    expect(
      Pitch.fromString('C4')
        .add(Interval.fromString('P8'))
        .toString()
    ).toBe('C5');
  });

  it('should implement transposeBy', () =>
    expect(
      Pitch.fromString('C4')
        .transposeBy(Interval.fromString('M2'))
        .toString()
    ).toBe('D4'));

  // test.skip('#toPitch should itself');
  // test.skip('#toPitchClass should its pitch class');
});

describe('PitchClass', () => {
  it('#fromString should construct a pitch class', () => {
    expect(PitchClass.fromString('C').semitones).toBe(0);
    expect(PitchClass.fromString('E').semitones).toBe(4);
    expect(PitchClass.fromString('G').semitones).toBe(7);
    expect(PitchClass.fromString('C♭').semitones).toBe(11);
    expect(PitchClass.fromString('C♯').semitones).toBe(1);
  });

  // test.skip('#fromSemitones should construct a pitch class');

  // test.skip('#enharmonicizeTo should return the enharmonic equivalent within a scale');

  it('#toString should return the name of the pitch class', () => {
    expect(PitchClass.fromSemitones(0).toString()).toBe('C');
    expect(PitchClass.fromSemitones(2).toString()).toBe('D');
    expect(PitchClass.fromSemitones(4).toString()).toBe('E');
  });

  it('should normalize its input', () => {
    expect(PitchClass.fromSemitones(12).toString()).toBe('C');
    expect(PitchClass.fromSemitones(14).toString()).toBe('D');
  });

  it('should add to an interval', () =>
    expect(
      PitchClass.fromString('C')
        .add(Interval.fromString('M2'))
        .toString()
    ).toBe('D'));

  // test.skip('#toPitch should return a pitch within the specified octave');
  // test.skip('#toPitchClass should itself');
});

describe('Pitches', () =>
  it('should contain 12 pitches', function() {
    expect(Pitches).toHaveLength(12);
  }));
