import {
  FlatNoteNames,
  Interval,
  NoteNames,
  Pitch,
  Pitches,
  SharpNoteNames,
} from '../src';
import { semitonesToAccidentalString } from '../src/accidentals';
import { midi2name, name2midi } from '../src/midi';
import {
  getPitchName,
  pitchFromScientificNotation,
  pitchToPitchClass,
} from '../src/names';

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
        .toString(),
    ).toBe('C4');
    expect(
      Pitch.fromString('C4')
        .add(Interval.fromString('M2'))
        .toString(),
    ).toBe('D4');
    expect(
      Pitch.fromString('C4')
        .add(Interval.fromString('P8'))
        .toString(),
    ).toBe('C5');
  });

  it('should implement transposeBy', () =>
    expect(
      Pitch.fromString('C4')
        .transposeBy(Interval.fromString('M2'))
        .toString(),
    ).toBe('D4'));

  // test.skip('#asPitch should itself');
  // test.skip('#asPitchClass should its pitch class');
});

describe('Pitches', () =>
  it('should contain 12 pitches', () => {
    expect(Pitches).toHaveLength(12);
  }));
