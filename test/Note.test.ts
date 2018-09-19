import { Intervals, Note, PitchClass } from '../src';

describe('Note', () => {
  describe('fromMidiNumber', () => {
    expect(Note.fromMidiNumber(0).toString()).toBe('C-1');
    expect(Note.fromMidiNumber(12).toString()).toBe('C0');
    expect(Note.fromMidiNumber(13).toString()).toBe('C♯0');
    expect(Note.fromMidiNumber(23).toString()).toBe('B0');
    expect(Note.fromMidiNumber(24).toString()).toBe('C1');
    expect(Note.fromMidiNumber(36).toString()).toBe('C2');
    expect(Note.fromMidiNumber(127).toString()).toBe('G9');
  });

  describe('fromString', () => {
    it('should parse scientific notation', () => {
      // FIXME:
      // expect(Note.fromString('C-1').midiNumber).toBe(0);
      expect(Note.fromString('C0').midiNumber).toBe(12);
      expect(Note.fromString('C1').midiNumber).toBe(24);
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
  });

  it('toString', () => {
    expect(Note.fromMidiNumber(0).toString()).toBe('C-1');
    expect(Note.fromMidiNumber(12).toString()).toBe('C0');
    expect(Note.fromMidiNumber(13).toString()).toBe('C♯0');
    expect(Note.fromMidiNumber(23).toString()).toBe('B0');
    expect(Note.fromMidiNumber(24).toString()).toBe('C1');
    expect(Note.fromMidiNumber(36).toString()).toBe('C2');
    expect(Note.fromMidiNumber(60).toString()).toBe('C4');
    expect(Note.fromMidiNumber(72).toString()).toBe('C5');
    expect(Note.fromMidiNumber(64).toString()).toBe('E4');
    expect(Note.fromMidiNumber(79).toString()).toBe('G5');
    expect(Note.fromMidiNumber(127).toString()).toBe('G9');
  });

  it('add', () => {
    const C4 = Note.fromString('C4');
    expect(C4.add(Intervals.P1).toString()).toBe('C4');
    expect(C4.add(Intervals.M2).toString()).toBe('D4');
    expect(C4.add(Intervals.P8).toString()).toBe('C5');
  });

  it('transposeBy', () => {
    const C4 = Note.fromString('C4');
    expect(C4.transposeBy(Intervals.M2).toString()).toBe('D4');
  });

  test('asPitch', () => {
    const D4 = Note.fromString('D4');
    expect(D4.asPitch()).toBe(D4);
  });

  test('asPitchClass', () => {
    const D4 = Note.fromString('D4');
    expect(D4.asPitchClass()).toBe(PitchClass.fromSemitones(2));
  });
});
