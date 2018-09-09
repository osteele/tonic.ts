import { PitchClass } from '../src';
import { semitonesToAccidentalString } from '../src/accidentals';
import { midi2name, name2midi } from '../src/midi';
import {
  pitchFromScientificNotation,
  pitchToPitchClass,
} from '../src/PitchClass';

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

describe('PitchClass', () => {
  describe('getPitchName', () => {
    it('should return natural names', () => {
      expect(PitchClass.asNoteName(0)).toBe('C');
      expect(PitchClass.asNoteName(2)).toBe('D');
      expect(PitchClass.asNoteName(4)).toBe('E');
      expect(PitchClass.asNoteName(5)).toBe('F');
      expect(PitchClass.asNoteName(7)).toBe('G');
      expect(PitchClass.asNoteName(9)).toBe('A');
      expect(PitchClass.asNoteName(11)).toBe('B');
    });

    it('should return flat names by default', () => {
      expect(PitchClass.asNoteName(1)).toBe('D♭');
      expect(PitchClass.asNoteName(3)).toBe('E♭');
      expect(PitchClass.asNoteName(6)).toBe('G♭');
      expect(PitchClass.asNoteName(8)).toBe('A♭');
      expect(PitchClass.asNoteName(10)).toBe('B♭');
    });

    it('should return flat names with flat option', () =>
      expect(PitchClass.asNoteName(1, { flat: true })).toBe('D♭'));

    it('should return sharp names with sharp option', () => {
      expect(PitchClass.asNoteName(1, { sharp: true })).toBe('C♯');
      expect(PitchClass.asNoteName(3, { sharp: true })).toBe('D♯');
      expect(PitchClass.asNoteName(6, { sharp: true })).toBe('F♯');
      expect(PitchClass.asNoteName(8, { sharp: true })).toBe('G♯');
      expect(PitchClass.asNoteName(10, { sharp: true })).toBe('A♯');
    });

    it('should return both names with both options', () =>
      expect(PitchClass.asNoteName(1, { sharp: true, flat: true })).toBe(
        'D♭/\nC♯',
      ));
  });
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
