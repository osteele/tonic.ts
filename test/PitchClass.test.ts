import {
  getPitchClassName,
  Interval,
  normalizePitchClass,
  parsePitchClass,
  PitchClass,
} from '../src';

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

describe('PitchClass', () => {
  it('fromString', () => {
    expect(PitchClass.fromString('C').semitones).toBe(0);
    expect(PitchClass.fromString('E').semitones).toBe(4);
    expect(PitchClass.fromString('G').semitones).toBe(7);
    expect(PitchClass.fromString('C♭').semitones).toBe(11);
    expect(PitchClass.fromString('C♯').semitones).toBe(1);
  });

  it('fromSemitones', () => {
    expect(PitchClass.fromSemitones(12).toString()).toBe('C');
    expect(PitchClass.fromSemitones(14).toString()).toBe('D');
  });

  // test.skip('#enharmonicizeTo should return the enharmonic equivalent within a scale');

  it('toString', () => {
    expect(PitchClass.fromSemitones(0).toString()).toBe('C');
    expect(PitchClass.fromSemitones(2).toString()).toBe('D');
    expect(PitchClass.fromSemitones(4).toString()).toBe('E');
  });

  it('should intern instances', () => {
    const c1 = PitchClass.fromString('C');
    const c2 = PitchClass.fromString('C');
    expect(c1).toBe(c2);
    expect(c1).not.toBe(PitchClass.fromString('D'));
  });

  it('add', () => {
    const c = PitchClass.fromString('C');
    const m2 = Interval.fromString('M2');
    expect(c.add(m2).toString()).toBe('D');
  });
});
