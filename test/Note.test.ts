import { Interval, Intervals, Note, PitchClass } from '../src';

describe('Note', () => {
  describe('fromMidiNumber', () => {
    it('converts MIDI numbers to notes', () => {
      expect(Note.fromMidiNumber(0).toString()).toBe('C-1');
      expect(Note.fromMidiNumber(12).toString()).toBe('C0');
      expect(Note.fromMidiNumber(13).toString()).toBe('C♯0');
      expect(Note.fromMidiNumber(23).toString()).toBe('B0');
      expect(Note.fromMidiNumber(24).toString()).toBe('C1');
      expect(Note.fromMidiNumber(36).toString()).toBe('C2');
      expect(Note.fromMidiNumber(127).toString()).toBe('G9');
    });
  });

  describe('fromString', () => {
    it('should parse scientific notation', () => {
      expect(Note.fromString('C-1').midiNumber).toBe(0);
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
      expect(Note.fromString('C#4')).toBe(Note.fromString('C♯4'));
      expect(Note.fromString('C1')).toBe(Note.fromString('C,'));
      expect(Note.fromString('C♯4')).not.toBe(Note.fromString('Db4'));
    });
  });

  it('toString', () => {
    expect(Note.fromMidiNumber(0).toString()).toBe('C-1');
    expect(Note.fromMidiNumber(12).toString()).toBe('C0');
    expect(Note.fromMidiNumber(23).toString()).toBe('B0');
    expect(Note.fromMidiNumber(24).toString()).toBe('C1');
    expect(Note.fromMidiNumber(36).toString()).toBe('C2');
    expect(Note.fromMidiNumber(60).toString()).toBe('C4');
    expect(Note.fromMidiNumber(61).toString()).toBe('C♯4');
    expect(Note.fromMidiNumber(62).toString()).toBe('D4');
    expect(Note.fromMidiNumber(63).toString()).toBe('D♯4');
    expect(Note.fromMidiNumber(64).toString()).toBe('E4');
    expect(Note.fromMidiNumber(65).toString()).toBe('F4');
    expect(Note.fromMidiNumber(66).toString()).toBe('F♯4');
    expect(Note.fromMidiNumber(67).toString()).toBe('G4');
    expect(Note.fromMidiNumber(68).toString()).toBe('G♯4');
    expect(Note.fromMidiNumber(69).toString()).toBe('A4');
    expect(Note.fromMidiNumber(70).toString()).toBe('A♯4');
    expect(Note.fromMidiNumber(71).toString()).toBe('B4');
    expect(Note.fromMidiNumber(72).toString()).toBe('C5');
    expect(Note.fromMidiNumber(64).toString()).toBe('E4');
    expect(Note.fromMidiNumber(79).toString()).toBe('G5');
    expect(Note.fromMidiNumber(127).toString()).toBe('G9');
  });

  // describe('fromDegree', () => {
  //   expect(Note.fromDegree(1).name).toBe('C4');
  //   expect(Note.fromDegree(2).name).toBe('D4');
  //   expect(Note.fromDegree(7).name).toBe('B4');
  //   expect(Note.fromDegree(1, -3).name).toBe('C♭𝄫4');
  //   expect(Note.fromDegree(1, -2).name).toBe('C𝄫4');
  //   expect(Note.fromDegree(1, -1).name).toBe('C♭4');
  //   expect(Note.fromDegree(1, 1).name).toBe('C♯4');
  //   expect(Note.fromDegree(1, 2).name).toBe('C𝄪4');
  //   expect(Note.fromDegree(1, 3).name).toBe('C♯𝄪4');
  //   expect(Note.fromDegree(1, 0, 0).name).toBe('C0');

  //   expect(Note.fromDegree(1).midiNumber).toBe(60);
  //   expect(Note.fromDegree(1, 1).midiNumber).toBe(61);
  //   expect(Note.fromDegree(2).midiNumber).toBe(62);
  //   expect(Note.fromDegree(1, 0, 0).midiNumber).toBe(12);
  // });

  describe('degree', () => {
    it('returns the diatonic degree', () => {
      expect(Note.fromString('C4').degree).toBe(1);
      expect(Note.fromString('D4').degree).toBe(2);
      expect(Note.fromString('B4').degree).toBe(7);
      expect(Note.fromString('C0').degree).toBe(1);
    });
  });

  describe('accidentals', () => {
    it('returns the accidental offset in semitones', () => {
      expect(Note.fromString('C𝄫4').accidentals).toBe(-2);
      expect(Note.fromString('C♭4').accidentals).toBe(-1);
      expect(Note.fromString('C4').accidentals).toBe(0);
      expect(Note.fromString('C♯4').accidentals).toBe(1);
      expect(Note.fromString('C𝄪4').accidentals).toBe(2);
    });
  });

  describe('octave', () => {
    it('returns the scientific-pitch octave', () => {
      expect(Note.fromString('C4').octave).toBe(4);
      expect(Note.fromString('B4').octave).toBe(4);
      expect(Note.fromString('C5').octave).toBe(5);
      expect(Note.fromString('C0').octave).toBe(0);
    });
  });

  describe('add', () => {
    const { P1, M2, d3, m3, M3, A3, TT, P8 } = Intervals;
    const C4 = Note.fromString('C4');
    // tslint:disable-next-line:variable-name
    const Csh = Note.fromString('C♯4');

    it('adds simple intervals', () => {
      expect(C4.add(P1).toString()).toBe('C4');
      expect(C4.add(M2).toString()).toBe('D4');
      expect(C4.add(M3).toString()).toBe('E4');
      expect(C4.add(TT).toString()).toBe('F♯4');
      expect(C4.add(P8).toString()).toBe('C5');

      expect(C4.add(m3).toString()).toBe('E♭4');
      expect(C4.add(d3).toString()).toBe('E𝄫4');
      expect(C4.add(A3).toString()).toBe('E♯4');

      expect(Csh.add(P1).toString()).toBe('C♯4');
      expect(Csh.add(M2).toString()).toBe('D♯4');
      expect(Csh.add(M3).toString()).toBe('E♯4');
      expect(Csh.add(P8).toString()).toBe('C♯5');

      expect(Csh.add(m3).toString()).toBe('E4');
      expect(Csh.add(d3).toString()).toBe('E♭4');
      expect(Csh.add(A3).toString()).toBe('E𝄪4');

      expect(C4.add(Intervals.M3).name).toBe('E4');
      expect(C4.add(Intervals.A3).name).toBe('E♯4');
      expect(C4.add(Intervals.d4).name).toBe('F♭4');
      expect(C4.add(Intervals.P4).name).toBe('F4');
    });

    it('adds compound intervals', () => {
      expect(C4.add(Intervals.M9).toString()).toBe('D5');
      expect(C4.add(Intervals.m10).toString()).toBe('E♭5');
      expect(C4.add(Interval.fromString('M16')).toString()).toBe('D6');
    });
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
