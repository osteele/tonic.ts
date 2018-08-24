import { Chord, ScalePattern } from '../src';

describe('Scale.fromRomanNumeral', () => {
  const scale = ScalePattern.fromString('Diatonic Major').at('E4');

  it('should create major chords', () => {
    expect(scale.fromRomanNumeral('I')).toEqual(Chord.fromString('E4 Major'));
    expect(scale.fromRomanNumeral('II')).toEqual(Chord.fromString('F♯4 Major'));
    expect(scale.fromRomanNumeral('IV')).toEqual(Chord.fromString('A4 Major'));
    expect(scale.fromRomanNumeral('V')).toEqual(Chord.fromString('B4 Major'));
    expect(scale.fromRomanNumeral('VI')).toEqual(Chord.fromString('C♯5 Major'));
  });

  it('should create minor chords', () => {
    expect(scale.fromRomanNumeral('i')).toEqual(Chord.fromString('E4 Minor'));
    expect(scale.fromRomanNumeral('ii')).toEqual(Chord.fromString('F♯4 Minor'));
    expect(scale.fromRomanNumeral('vi')).toEqual(Chord.fromString('C♯5 Minor'));
  });

  it('should create diminished chords', () => {
    expect(scale.fromRomanNumeral('vii°')).toEqual(Chord.fromString('D♯5°'));
    expect(scale.fromRomanNumeral('iv°')).toEqual(Chord.fromString('A4°'));
  });

  it.skip('should create inversions', () => {
    expect(scale.fromRomanNumeral('ib')).toEqual(Chord.fromString('E4 Minor'));
    expect(scale.fromRomanNumeral('ic')).toEqual(Chord.fromString('F♯4 Minor'));
    expect(scale.fromRomanNumeral('id')).toEqual(Chord.fromString('C♯5 Minor'));
  });

  it.skip('should accept pitch classes', () => {
    const scale = ScalePattern.fromString('Diatonic Major').at('E');
    expect(scale.fromRomanNumeral('I')).toEqual(Chord.fromString('E Major'));
    expect(scale.fromRomanNumeral('II')).toEqual(Chord.fromString('F♯ Major'));
    expect(scale.fromRomanNumeral('IV')).toEqual(Chord.fromString('A Major'));
  });
});

describe('Scale.progression', () =>
  it('should produce a sequence of chords', () => {
    const scale = ScalePattern.fromString('Diatonic Major').at('E4');
    const chords = scale.progression('I ii iii IV');
    expect(chords).toHaveLength(4);
  }));
