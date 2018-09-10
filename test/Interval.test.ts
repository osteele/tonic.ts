import {
  Interval,
  intervalClassDifference,
  IntervalQuality,
  Intervals,
  Note,
  PitchClass,
} from '../src';

describe('Interval', () => {
  describe('names', () => {
    it('should have 13 intervals', () => {
      expect(Interval.names).toHaveLength(13);
    });
    it('should start with P1', () => expect(Interval.names[0]).toBe('P1'));
    it('should end with P8', () => expect(Interval.names[12]).toBe('P8'));
  });

  describe('longNames', () => {
    it('should have 13 intervals', () => {
      expect(Interval.longNames).toHaveLength(13);
    });
    it('should start with Unison', () =>
      expect(Interval.longNames[0]).toBe('Unison'));
    it('should end with Octave', () =>
      expect(Interval.longNames[12]).toBe('Octave'));
  });

  it('fromString', () => {
    expect(Interval.fromString('P1').semitones).toBe(0);
    expect(Interval.fromString('m2').semitones).toBe(1);
    expect(Interval.fromString('M2').semitones).toBe(2);
    expect(Interval.fromString('m3').semitones).toBe(3);
    expect(Interval.fromString('M3').semitones).toBe(4);
    expect(Interval.fromString('P4').semitones).toBe(5);
    expect(Interval.fromString('TT').semitones).toBe(6);
    expect(Interval.fromString('P5').semitones).toBe(7);
    expect(Interval.fromString('m6').semitones).toBe(8);
    expect(Interval.fromString('M6').semitones).toBe(9);
    expect(Interval.fromString('m7').semitones).toBe(10);
    expect(Interval.fromString('M7').semitones).toBe(11);
    expect(Interval.fromString('P8').semitones).toBe(12);

    expect(Interval.fromString('A1').semitones).toBe(1);
    expect(Interval.fromString('A2').semitones).toBe(3);
    expect(Interval.fromString('A3').semitones).toBe(5);
    expect(Interval.fromString('A4').semitones).toBe(6);
    expect(Interval.fromString('A5').semitones).toBe(8);
    expect(Interval.fromString('A6').semitones).toBe(10);
    expect(Interval.fromString('A7').semitones).toBe(12);
    expect(Interval.fromString('d2').semitones).toBe(0);
    expect(Interval.fromString('d3').semitones).toBe(2);
    expect(Interval.fromString('d4').semitones).toBe(4);
    expect(Interval.fromString('d5').semitones).toBe(6);
    expect(Interval.fromString('d6').semitones).toBe(7);
    expect(Interval.fromString('d7').semitones).toBe(9);
    expect(Interval.fromString('d8').semitones).toBe(11);

    expect(Interval.fromString('Unison').semitones).toBe(0);
    expect(Interval.fromString('Minor 2nd').semitones).toBe(1);

    // TODO: semitone, half tone, half step
    // TODO: tone, whole tone, whole step
  });

  it('name', () => {
    expect(Interval.fromString('P1').name).toBe('P1');
    expect(Interval.fromString('m2').name).toBe('m2');
    // FIXME:
    // expect(Interval.fromString('d2').name).toBe('d2');
    // expect(Interval.fromString('A2').name).toBe('A2');
    expect(Interval.fromString('TT').name).toBe('TT');
  });

  it('number', () => {
    expect(Interval.fromString('P1').number).toBe(1);
    expect(Interval.fromString('m2').number).toBe(2);
    expect(Interval.fromString('M2').number).toBe(2);
    expect(Interval.fromString('d2').number).toBe(2);
    expect(Interval.fromString('A2').number).toBe(2);
    expect(Interval.fromString('TT').number).toBe(null);
    expect(Interval.fromString('P8').number).toBe(8);
  });

  it('quality', () => {
    expect(Interval.fromString('P1').quality).toBe(IntervalQuality.Perfect);
    expect(Interval.fromString('m2').quality).toBe(IntervalQuality.Minor);
    expect(Interval.fromString('M2').quality).toBe(IntervalQuality.Major);
    expect(Interval.fromString('d2').quality).toBe(IntervalQuality.Diminished);
    expect(Interval.fromString('A2').quality).toBe(IntervalQuality.Augmented);
    expect(Interval.fromString('TT').quality).toBe(null);
  });

  it('toString', () => {
    expect(Interval.fromSemitones(0).toString()).toBe('P1');
    expect(Interval.fromSemitones(1).toString()).toBe('m2');
    expect(Interval.fromSemitones(4).toString()).toBe('M3');
    expect(Interval.fromSemitones(12).toString()).toBe('P8');

    // TODO: dim, aug
    // expect(Interval.fromString('d3').toString()).toBe('d3');
    // expect(Interval.fromString('A3').toString()).toBe('A3');
  });

  it('should be interned', () => {
    expect(Interval.fromString('P1')).toBe(Interval.fromString('P1'));
    expect(Interval.fromString('M2')).toBe(Interval.fromString('M2'));
    expect(Interval.fromString('P1')).not.toBe(Interval.fromString('M2'));
  });

  describe('add', () =>
    it('should add to an interval', () =>
      expect(
        Interval.fromString('m2').add(Interval.fromString('M2')).semitones,
      ).toBe(3)));

  describe('between', () => {
    const E4 = Note.fromString('E4');
    const F4 = Note.fromString('F4');
    const G4 = Note.fromString('G4');
    const C4 = Note.fromString('C4');
    const GA4 = Note.fromString('G#4');
    const { P1, m2, m3, M3, P5 } = Intervals;

    it('should return the interval between two notes', () => {
      expect(Interval.between(E4, E4)).toBe(P1);
      expect(Interval.between(E4, F4)).toBe(m2);
      expect(Interval.between(E4, G4)).toBe(m3);
      expect(Interval.between(E4, GA4)).toBe(M3);
    });

    it('should return the interval between two note classes', () => {
      const E = PitchClass.fromString('E');
      const F = PitchClass.fromString('F');
      const G = PitchClass.fromString('G');
      const GA = PitchClass.fromString('G#');
      expect(Interval.between(E, E)).toBe(P1);
      expect(Interval.between(E, F)).toBe(m2);
      expect(Interval.between(E, G)).toBe(m3);
      expect(Interval.between(E, GA)).toBe(M3);
    });

    it('should use modular arithmetic', () => {
      expect(Interval.between(F4, C4)).toBe(P5);
    });

    it.skip('should preserve the quality', () => {
      const d3 = Interval.fromString('d3');
      const A3 = Interval.fromString('A3');
      expect(Interval.between(C4, Note.fromString('E4'))).toBe(M3);
      expect(Interval.between(C4, Note.fromString('Eb4'))).toBe(d3);
      expect(Interval.between(C4, Note.fromString('E#4'))).toBe(A3);
    });
  });

  it('inverse', () => {
    const { P1, P5, m2, m3, M3, m6, M6, M7, P4, P8, TT } = Intervals;
    expect(P1.inverse).toBe(P8);
    expect(m2.inverse).toBe(M7);
    expect(M3.inverse).toBe(m6);
    expect(m3.inverse).toBe(M6);
    expect(P4.inverse).toBe(P5);
    expect(TT.inverse).toBe(TT);

    const d2 = Interval.fromString('d2');
    const A7 = Interval.fromString('A7');
    expect(d2.inverse).toBe(A7);
  });

  it('augment', () => {
    const { M3 } = Intervals;
    expect(M3.augment).toBe(Interval.fromString('A3'));
    // TODO: M2.augment
  });

  it('diminish', () => {
    const { m3 } = Intervals;
    expect(m3.diminish).toBe(Interval.fromString('d3'));
    // TODO: M3.diminish
  });

  it('natural', () => {
    const { M3 } = Intervals;
    expect(Interval.fromString('A3').natural).toBe(M3);
    // FIXME: expect(Interval.fromString('d3').natural).toBe(M3);
  });

  it('compound interval', () => {
    expect(Interval.fromString('m9').semitones).toBe(13);
    expect(Interval.fromString('M9').semitones).toBe(14);
    expect(Interval.fromString('m10').semitones).toBe(15);
    expect(Interval.fromString('M10').semitones).toBe(16);
    expect(Interval.fromString('P11').semitones).toBe(17);
    expect(Interval.fromString('P12').semitones).toBe(19);
    expect(Interval.fromString('m13').semitones).toBe(20);
    expect(Interval.fromString('M13').semitones).toBe(21);
    expect(Interval.fromString('m14').semitones).toBe(22);
    expect(Interval.fromString('M14').semitones).toBe(23);
    expect(Interval.fromString('P15').semitones).toBe(24);

    expect(Interval.fromString('M9').name).toBe('M9');
    expect(Interval.fromString('m9').name).toBe('m9');
    // expect(Interval.fromString('A9').name).toBe('A9');
    // expect(Interval.fromString('d9').name).toBe('d9');
    // TODO: test tritone compounds

    expect(Interval.fromString('M9').number).toBe(9);
    expect(Interval.fromString('m9').number).toBe(9);
    // FIXME:
    // expect(Interval.fromString('A9').number).toBe(9);
    // expect(Interval.fromString('d9').number).toBe(9);

    expect(Interval.fromString('M9').quality).toBe(IntervalQuality.Major);
    expect(Interval.fromString('m9').quality).toBe(IntervalQuality.Minor);
    expect(Interval.fromString('A9').quality).toBe(IntervalQuality.Augmented);
    expect(Interval.fromString('d9').quality).toBe(IntervalQuality.Diminished);
  });
});

describe('intervalClassDifference', () =>
  it('should return an integer in [0...12]', () => {
    expect(intervalClassDifference(0, 5)).toBe(5);
    expect(intervalClassDifference(5, 0)).toBe(7);
    expect(intervalClassDifference(0, 12)).toBe(0);
  }));
