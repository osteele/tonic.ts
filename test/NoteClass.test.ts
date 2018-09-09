import { Interval, NoteClass } from '../src';

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
