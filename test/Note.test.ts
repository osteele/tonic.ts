import {
  FlatNoteNames,
  Interval,
  Note,
  NoteNames,
  Notes,
  SharpNoteNames,
} from '../src';

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

describe('Note', () => {
  it('should parse scientific notation', () => {
    expect(Note.fromString('C4').midiNumber).toBe(60);
    expect(Note.fromString('C5').midiNumber).toBe(72);
    expect(Note.fromString('E4').midiNumber).toBe(64);
    expect(Note.fromString('G5').midiNumber).toBe(79);
  });

  it('should parse Helmholtz notation', () => {
    expect(Note.fromString('C,').midiNumber).toBe(24);
    expect(Note.fromString('D,').midiNumber).toBe(26);
    expect(Note.fromString('C').midiNumber).toBe(36);
    expect(Note.fromString('c').midiNumber).toBe(48);
    expect(Note.fromString('c♯').midiNumber).toBe(49);
    expect(Note.fromString('c♭').midiNumber).toBe(47);
    expect(Note.fromString("c'").midiNumber).toBe(60);
    expect(Note.fromString("c'''").midiNumber).toBe(84);
    expect(Note.fromString("d'''").midiNumber).toBe(86);
  });

  it('should intern instances', () => {
    expect(Note.fromString('C4')).toBe(Note.fromString('C4'));
    expect(Note.fromString('C4')).not.toBe(Note.fromString('D4'));
    // FIXME:
    // expect(Note.fromString('C1')).toBe(Note.fromString('C,'));
    expect(Note.fromString('C#4')).not.toBe(Note.fromString('Db4'));
  });

  it('should implement toString', () => {
    expect(Note.fromMidiNumber(60).toString()).toBe('C4');
    expect(Note.fromMidiNumber(72).toString()).toBe('C5');
    expect(Note.fromMidiNumber(64).toString()).toBe('E4');
    expect(Note.fromMidiNumber(79).toString()).toBe('G5');
  });

  it('should add to an interval', () => {
    const C4 = Note.fromString('C4');
    expect(C4.add(Interval.fromString('P1')).toString()).toBe('C4');
    expect(C4.add(Interval.fromString('M2')).toString()).toBe('D4');
    expect(C4.add(Interval.fromString('P8')).toString()).toBe('C5');
  });

  it('should implement transposeBy', () => {
    const C4 = Note.fromString('C4');
    expect(C4.transposeBy(Interval.fromString('M2')).toString()).toBe('D4');
  });

  // test.skip('#asPitch should itself');
  // test.skip('#asPitchClass should its pitch class');
});

describe('Notes', () =>
  it('should contain 12 notes', () => {
    expect(Notes).toHaveLength(12);
  }));
