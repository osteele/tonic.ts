import { semitonesToAccidentalString } from '../../src/internal/accidentals';
import * as PitchClassParser from '../../src/internal/pitchClassParser';
import {
  FlatNoteNames,
  NoteNames,
  SharpNoteNames,
} from '../../src/internal/pitchClassParser';

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

describe('FlatNoteNames', () => {
  it('should have 12 notes', () => {
    expect(FlatNoteNames).toHaveLength(12);
  });

  it('should start with C', () => {
    expect(FlatNoteNames[0]).toBe('C');
  });

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
  it('should start with C', () => {
    expect(SharpNoteNames[0]).toBe('C');
  });
  it('should have five flats', () => {
    expect(SharpNoteNames[1]).toBe('C♯');
    expect(SharpNoteNames[3]).toBe('D♯');
    expect(SharpNoteNames[6]).toBe('F♯');
    expect(SharpNoteNames[8]).toBe('G♯');
    expect(SharpNoteNames[10]).toBe('A♯');
  });
});

describe('NoteNames', () => {
  it('should equal SharpNoteNames', () => {
    expect(NoteNames).toEqual(SharpNoteNames);
  });
});

describe('PitchClassParser', () => {
  describe('fromString', () => {
    it('should parse naturals', () => {
      expect(PitchClassParser.fromString('C')).toBe(0);
      expect(PitchClassParser.fromString('D')).toBe(2);
      expect(PitchClassParser.fromString('E')).toBe(4);
      expect(PitchClassParser.fromString('F')).toBe(5);
      expect(PitchClassParser.fromString('G')).toBe(7);
      expect(PitchClassParser.fromString('A')).toBe(9);
      expect(PitchClassParser.fromString('B')).toBe(11);
    });

    it('should parse sharps', () => {
      expect(PitchClassParser.fromString('C#')).toBe(1);
      expect(PitchClassParser.fromString('C♯')).toBe(1);
    });

    it('should parse flats', () => {
      expect(PitchClassParser.fromString('Cb')).toBe(11);
      expect(PitchClassParser.fromString('C♭')).toBe(11);
    });

    // test.skip('should parse double sharps and flats');
    // expect(parsePitchClass('C𝄪')).toBe(2)
    // expect(parsePitchClass('C𝄫')).toBe(10)
  });

  describe('asNoteName', () => {
    it('should return natural names', () => {
      expect(PitchClassParser.asNoteName(0)).toBe('C');
      expect(PitchClassParser.asNoteName(2)).toBe('D');
      expect(PitchClassParser.asNoteName(4)).toBe('E');
      expect(PitchClassParser.asNoteName(5)).toBe('F');
      expect(PitchClassParser.asNoteName(7)).toBe('G');
      expect(PitchClassParser.asNoteName(9)).toBe('A');
      expect(PitchClassParser.asNoteName(11)).toBe('B');
    });

    it('should return flat names by default', () => {
      expect(PitchClassParser.asNoteName(1)).toBe('D♭');
      expect(PitchClassParser.asNoteName(3)).toBe('E♭');
      expect(PitchClassParser.asNoteName(6)).toBe('G♭');
      expect(PitchClassParser.asNoteName(8)).toBe('A♭');
      expect(PitchClassParser.asNoteName(10)).toBe('B♭');
    });

    it('should return flat names with flat option', () =>
      expect(PitchClassParser.asNoteName(1, { flat: true })).toBe('D♭'));

    it('should return sharp names with sharp option', () => {
      expect(PitchClassParser.asNoteName(1, { sharp: true })).toBe('C♯');
      expect(PitchClassParser.asNoteName(3, { sharp: true })).toBe('D♯');
      expect(PitchClassParser.asNoteName(6, { sharp: true })).toBe('F♯');
      expect(PitchClassParser.asNoteName(8, { sharp: true })).toBe('G♯');
      expect(PitchClassParser.asNoteName(10, { sharp: true })).toBe('A♯');
    });

    it('should return both names with both options', () =>
      expect(PitchClassParser.asNoteName(1, { sharp: true, flat: true })).toBe(
        'D♭/\nC♯',
      ));
  });
});

describe('pitchToPitchClass', () => {
  it('should return an integer in [0...12]', () => {
    expect(PitchClassParser.fromNumber(0)).toBe(0);
    expect(PitchClassParser.fromNumber(1)).toBe(1);
    expect(PitchClassParser.fromNumber(12)).toBe(0);
    expect(PitchClassParser.fromNumber(13)).toBe(1);
    expect(PitchClassParser.fromNumber(-1)).toBe(11);
    expect(PitchClassParser.fromNumber(-13)).toBe(11);
  });

  describe('getPitchClassName', () => {
    it('should return natural names', () => {
      expect(PitchClassParser.getPitchClassName(0)).toBe('C');
      expect(PitchClassParser.getPitchClassName(2)).toBe('D');
      expect(PitchClassParser.getPitchClassName(4)).toBe('E');
      expect(PitchClassParser.getPitchClassName(5)).toBe('F');
      expect(PitchClassParser.getPitchClassName(7)).toBe('G');
      expect(PitchClassParser.getPitchClassName(9)).toBe('A');
      expect(PitchClassParser.getPitchClassName(11)).toBe('B');
    });

    it('should return sharp names', () => {
      expect(PitchClassParser.getPitchClassName(1)).toBe('C♯');
      expect(PitchClassParser.getPitchClassName(3)).toBe('D♯');
      expect(PitchClassParser.getPitchClassName(6)).toBe('F♯');
      expect(PitchClassParser.getPitchClassName(8)).toBe('G♯');
      expect(PitchClassParser.getPitchClassName(10)).toBe('A♯');
    });
  });

  describe('normalizePitchClass', () => {
    it('should return an integer in 0..11', () => {
      expect(PitchClassParser.normalize(0)).toBe(0);
      expect(PitchClassParser.normalize(11)).toBe(11);
      expect(PitchClassParser.normalize(-1)).toBe(11);
      expect(PitchClassParser.normalize(-13)).toBe(11);
      expect(PitchClassParser.normalize(12)).toBe(0);
      expect(PitchClassParser.normalize(13)).toBe(1);
      expect(PitchClassParser.normalize(25)).toBe(1);
    });
  });
});
