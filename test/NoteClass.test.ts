import {
  getPitchClassName,
  Interval,
  normalizePitchClass,
  NoteClass,
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

describe('NoteClass', () => {
  it('fromString', () => {
    expect(NoteClass.fromString('C').semitones).toBe(0);
    expect(NoteClass.fromString('E').semitones).toBe(4);
    expect(NoteClass.fromString('G').semitones).toBe(7);
    expect(NoteClass.fromString('C♭').semitones).toBe(11);
    expect(NoteClass.fromString('C♯').semitones).toBe(1);
  });

  it('fromSemitones', () => {
    expect(NoteClass.fromSemitones(12).toString()).toBe('C');
    expect(NoteClass.fromSemitones(14).toString()).toBe('D');
  });

  // test.skip('#enharmonicizeTo should return the enharmonic equivalent within a scale');

  it('toString', () => {
    expect(NoteClass.fromSemitones(0).toString()).toBe('C');
    expect(NoteClass.fromSemitones(2).toString()).toBe('D');
    expect(NoteClass.fromSemitones(4).toString()).toBe('E');
  });

  it('should intern instances', () => {
    const c1 = NoteClass.fromString('C');
    const c2 = NoteClass.fromString('C');
    expect(c1).toBe(c2);
    expect(c1).not.toBe(NoteClass.fromString('D'));
  });

  it('add', () => {
    const c = NoteClass.fromString('C');
    const m2 = Interval.fromString('M2');
    expect(c.add(m2).toString()).toBe('D');
  });
});
