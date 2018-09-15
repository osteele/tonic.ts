import { Interval, PitchClass } from '../src';

describe('PitchClass', () => {
  describe('all', () => {
    it('should have 12 items', () => {
      expect(PitchClass.all).toHaveLength(12);
      expect(PitchClass.all[0]).toBeInstanceOf(PitchClass);
    });
  });

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
