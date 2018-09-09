import { PitchClass } from '../src';
import { semitonesToAccidentalString } from '../src/accidentals';
import { midi2name, name2midi } from '../src/midi';

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
  describe('fromString', () => {
    it('should parse naturals', () => {
      expect(PitchClass.fromString('C')).toBe(0);
      expect(PitchClass.fromString('D')).toBe(2);
      expect(PitchClass.fromString('E')).toBe(4);
      expect(PitchClass.fromString('F')).toBe(5);
      expect(PitchClass.fromString('G')).toBe(7);
      expect(PitchClass.fromString('A')).toBe(9);
      expect(PitchClass.fromString('B')).toBe(11);
    });

    it('should parse sharps', () => {
      expect(PitchClass.fromString('C#')).toBe(1);
      expect(PitchClass.fromString('C♯')).toBe(1);
    });

    it('should parse flats', () => {
      expect(PitchClass.fromString('Cb')).toBe(11);
      expect(PitchClass.fromString('C♭')).toBe(11);
    });

    // test.skip('should parse double sharps and flats');
    // expect(parsePitchClass('C𝄪')).toBe(2)
    // expect(parsePitchClass('C𝄫')).toBe(10)
  });

  describe('asNoteName', () => {
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

  describe('fromScientificNotation', () => {
    it('should parse the pitch class', () => {
      expect(PitchClass.fromScientificNotation('C4')).toBe(60);
      expect(PitchClass.fromScientificNotation('D4')).toBe(62);
      expect(PitchClass.fromScientificNotation('E4')).toBe(64);
      expect(PitchClass.fromScientificNotation('F4')).toBe(65);
      expect(PitchClass.fromScientificNotation('G4')).toBe(67);
      expect(PitchClass.fromScientificNotation('A4')).toBe(69);
      expect(PitchClass.fromScientificNotation('B4')).toBe(71);
    });
    it('should parse the octave', () => {
      expect(PitchClass.fromScientificNotation('C1')).toBe(24);
      expect(PitchClass.fromScientificNotation('C2')).toBe(36);
      expect(PitchClass.fromScientificNotation('C3')).toBe(48);
      expect(PitchClass.fromScientificNotation('C4')).toBe(60);
      expect(PitchClass.fromScientificNotation('C5')).toBe(72);
      expect(PitchClass.fromScientificNotation('C6')).toBe(84);
    });
    it('should parse accidentals', () => {
      expect(PitchClass.fromScientificNotation('Cb4')).toBe(59);
      expect(PitchClass.fromScientificNotation('C#4')).toBe(61);
      expect(PitchClass.fromScientificNotation('C♭4')).toBe(59);
      expect(PitchClass.fromScientificNotation('C♯4')).toBe(61);
      expect(PitchClass.fromScientificNotation('C♭♭4')).toBe(58);
      expect(PitchClass.fromScientificNotation('C♯♯4')).toBe(62);
    });
    // test.skip('should parse double accidentals');
  });
  // expect(PitchClass.pitchFromScientificNotation('C𝄫4')).toBe(58);
  // expect(PitchClass.pitchFromScientificNotation('C𝄪4')).toBe(62);
});

describe('pitchToPitchClass', () => {
  it('should return an integer in [0...12]', () => {
    expect(PitchClass.fromNumber(0)).toBe(0);
    expect(PitchClass.fromNumber(1)).toBe(1);
    expect(PitchClass.fromNumber(12)).toBe(0);
    expect(PitchClass.fromNumber(13)).toBe(1);
    expect(PitchClass.fromNumber(-1)).toBe(11);
    expect(PitchClass.fromNumber(-13)).toBe(11);
  });

  describe('getPitchClassName', () => {
    it('should return natural names', () => {
      expect(PitchClass.getPitchClassName(0)).toBe('C');
      expect(PitchClass.getPitchClassName(2)).toBe('D');
      expect(PitchClass.getPitchClassName(4)).toBe('E');
      expect(PitchClass.getPitchClassName(5)).toBe('F');
      expect(PitchClass.getPitchClassName(7)).toBe('G');
      expect(PitchClass.getPitchClassName(9)).toBe('A');
      expect(PitchClass.getPitchClassName(11)).toBe('B');
    });

    it('should return sharp names', () => {
      expect(PitchClass.getPitchClassName(1)).toBe('C♯');
      expect(PitchClass.getPitchClassName(3)).toBe('D♯');
      expect(PitchClass.getPitchClassName(6)).toBe('F♯');
      expect(PitchClass.getPitchClassName(8)).toBe('G♯');
      expect(PitchClass.getPitchClassName(10)).toBe('A♯');
    });
  });

  describe('normalizePitchClass', () => {
    it('should return an integer in 0..11', () => {
      expect(PitchClass.normalize(0)).toBe(0);
      expect(PitchClass.normalize(11)).toBe(11);
      expect(PitchClass.normalize(-1)).toBe(11);
      expect(PitchClass.normalize(-13)).toBe(11);
      expect(PitchClass.normalize(12)).toBe(0);
      expect(PitchClass.normalize(13)).toBe(1);
      expect(PitchClass.normalize(25)).toBe(1);
    });
  });
});

describe('midi2name', () => {
  it('should return a pitch name', () => {
    expect(midi2name(0)).toBe('C-1');
    expect(midi2name(12)).toBe('C0');
    expect(midi2name(13)).toBe('C♯0');
    expect(midi2name(23)).toBe('B0');
    expect(midi2name(24)).toBe('C1');
    expect(midi2name(36)).toBe('C2');
    expect(midi2name(127)).toBe('G9');
  });
});

describe('name2midi', () => {
  it('should return a midi number', () => {
    expect(name2midi('C-1')).toBe(0);
    expect(name2midi('C0')).toBe(12);
    expect(name2midi('C♯0')).toBe(13);
    expect(name2midi('B0')).toBe(23);
    expect(name2midi('C1')).toBe(24);
    expect(name2midi('C2')).toBe(36);
    expect(name2midi('G9')).toBe(127);
  });
});
