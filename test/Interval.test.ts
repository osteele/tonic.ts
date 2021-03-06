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

  describe('fromString', () => {
    it('should handle diatonic intervals', () => {
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
    });

    it('should handle augmented and diminished intervals', () => {
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
    });

    it('should handle long interval names', () => {
      expect(Interval.fromString('Unison').semitones).toBe(0);
      expect(Interval.fromString('Minor 2nd').semitones).toBe(1);
      expect(Interval.fromString('Tritone').semitones).toBe(6);
      expect(Interval.fromString('Perfect 5th').semitones).toBe(7);
      expect(Interval.fromString('Octave').semitones).toBe(12);
    });

    it('should reject invalid number/quality combinations', () => {
      expect(() => Interval.fromString('M1')).toThrow();
      expect(() => Interval.fromString('m1')).toThrow();
      expect(() => Interval.fromString('P2')).toThrow();
      expect(() => Interval.fromString('m4')).toThrow();
      expect(() => Interval.fromString('M5')).toThrow();
      expect(() => Interval.fromString('M8')).toThrow();
      expect(() => Interval.fromString('P9')).toThrow();
      expect(() => Interval.fromString('P10')).toThrow();
      expect(() => Interval.fromString('m11')).toThrow();
      expect(() => Interval.fromString('M12')).toThrow();
    });

    // TODO: semitone, half tone, half step
    // TODO: tone, whole tone, whole step
  });

  it('name', () => {
    expect(Intervals.P1.name).toBe('P1');
    expect(Intervals.m2.name).toBe('m2');
    expect(Intervals.M2.name).toBe('M2');
    expect(Intervals.d2.name).toBe('d2');
    expect(Intervals.A2.name).toBe('A2');
    expect(Intervals.TT.name).toBe('TT');
    expect(Intervals.P8.name).toBe('P8');
    expect(Intervals.m10.name).toBe('m10');
    expect(Intervals.M13.name).toBe('M13');
    expect(Interval.fromSemitones(6).name).toBe('TT');
    expect(Interval.fromSemitones(12).name).toBe('P8');
    expect(Interval.fromSemitones(18).name).toBe('P8+TT');
    expect(Interval.fromSemitones(30).name).toBe('P8+P8+TT');
  });

  it('number', () => {
    expect(Intervals.P1.number).toBe(1);
    expect(Intervals.m2.number).toBe(2);
    expect(Intervals.M2.number).toBe(2);
    expect(Intervals.d2.number).toBe(2);
    expect(Intervals.A2.number).toBe(2);
    expect(Intervals.TT.number).toBe(null);
    expect(Intervals.P8.number).toBe(8);
    expect(Intervals.m9.number).toBe(9);
    expect(Intervals.M9.number).toBe(9);
    expect(Intervals.M10.number).toBe(10);
    expect(Intervals.P11.number).toBe(11);
    expect(Intervals.P12.number).toBe(12);
    expect(Intervals.M13.number).toBe(13);
    expect(Intervals.M14.number).toBe(14);
    expect(Intervals.P15.number).toBe(15);
  });

  it('quality', () => {
    expect(Intervals.P1.quality).toBe(IntervalQuality.Perfect);
    expect(Intervals.m2.quality).toBe(IntervalQuality.Minor);
    expect(Intervals.M2.quality).toBe(IntervalQuality.Major);
    expect(Intervals.d2.quality).toBe(IntervalQuality.Diminished);
    expect(Intervals.A2.quality).toBe(IntervalQuality.Augmented);
    expect(Intervals.TT.quality).toBe(null);
  });

  it('semitones', () => {
    // toString tests simple intervals
    expect(Intervals.m9.semitones).toBe(13);
    expect(Intervals.M9.semitones).toBe(14);
    expect(Intervals.m10.semitones).toBe(15);
    expect(Intervals.M10.semitones).toBe(16);
    expect(Intervals.P11.semitones).toBe(17);
    expect(Intervals.P12.semitones).toBe(19);
    expect(Intervals.m13.semitones).toBe(20);
    expect(Intervals.M13.semitones).toBe(21);
    expect(Intervals.m14.semitones).toBe(22);
    expect(Intervals.M14.semitones).toBe(23);
    expect(Intervals.P15.semitones).toBe(24);

    expect(Intervals.d9.semitones).toBe(12);
    expect(Intervals.A8.semitones).toBe(13);
    expect(Intervals.d10.semitones).toBe(14);
    expect(Intervals.A9.semitones).toBe(15);
    expect(Intervals.d11.semitones).toBe(16);
    expect(Intervals.A10.semitones).toBe(17);
    expect(Intervals.d12.semitones).toBe(18);
    expect(Intervals.A11.semitones).toBe(18);
  });

  it('simple & complex', () => {
    expect(Intervals.P5.isSimple).toBe(true);
    expect(Intervals.P8.isSimple).toBe(true);
    expect(Intervals.A8.isSimple).toBe(true);
    expect(Intervals.d9.isSimple).toBe(false);
    expect(Intervals.m9.isSimple).toBe(false);
    expect(Intervals.P15.isSimple).toBe(false);

    expect(Intervals.P5.isComplex).toBe(false);
    expect(Intervals.P8.isComplex).toBe(false);
    expect(Intervals.A8.isComplex).toBe(false);
    expect(Intervals.d9.isComplex).toBe(true);
    expect(Intervals.m9.isComplex).toBe(true);
    expect(Intervals.P15.isComplex).toBe(true);
  });

  it('toString', () => {
    expect(Interval.fromSemitones(0).toString()).toBe('P1');
    expect(Interval.fromSemitones(1).toString()).toBe('m2');
    expect(Interval.fromSemitones(4).toString()).toBe('M3');
    expect(Interval.fromSemitones(12).toString()).toBe('P8');
    expect(Intervals.d3.toString()).toBe('d3');
    expect(Intervals.A3.toString()).toBe('A3');
  });

  it('should be interned', () => {
    expect(Interval.fromString('P1')).toBe(Intervals.P1);
    expect(Interval.fromString('M2')).toBe(Intervals.M2);
    expect(Interval.fromString('P1')).not.toBe(Intervals.M2);
  });

  describe('add', () => {
    it('should add an interval', () => {
      const { m2, M2, d3, m3, M3, A3, P4, d5, P5, A5, TT } = Intervals;

      expect(m2.add(m2)).toBe(d3);
      expect(m2.add(M2)).toBe(M3);
      expect(M2.add(m2)).toBe(M3);
      expect(M2.add(M2)).toBe(A3);

      expect(m3.add(m3)).toBe(d5);
      expect(m3.add(M3)).toBe(P5);
      expect(M3.add(m3)).toBe(P5);
      expect(M3.add(M3)).toBe(A5);
    });
  });

  describe('between', () => {
    const E4 = Note.fromString('E4');
    const F4 = Note.fromString('F4');
    const G4 = Note.fromString('G4');
    const C4 = Note.fromString('C4');
    const GA4 = Note.fromString('G#4');
    const { P1, m2, m3, M3, P4, P5 } = Intervals;

    it('should return the interval between two notes', () => {
      expect(Interval.between(E4, E4)).toBe(P1);
      expect(Interval.between(E4, F4)).toBe(m2);
      expect(Interval.between(E4, G4)).toBe(m3);
      expect(Interval.between(E4, GA4)).toBe(M3);
    });

    it('should return the interval between two pitch numbers', () => {
      expect(Interval.between(E4.midiNumber, F4.midiNumber)).toBe(m2);
    });

    it('should return the interval between two pitch classes', () => {
      const E = PitchClass.fromString('E');
      const F = PitchClass.fromString('F');
      const G = PitchClass.fromString('G');
      const GA = PitchClass.fromString('G#');
      expect(Interval.between(E, E)).toBe(P1);
      expect(Interval.between(E, F)).toBe(m2);
      expect(Interval.between(E, G)).toBe(m3);
      expect(Interval.between(E, GA)).toBe(M3);
    });

    it('should find the shortest distance between notes or pitches', () => {
      expect(Interval.between(F4, C4)).toBe(P4);
      expect(Interval.between(F4.midiNumber, C4.midiNumber)).toBe(P4);
    });

    it('should use modular arithmetic on pitch classes', () => {
      expect(Interval.between(F4.asPitchClass(), C4.asPitchClass())).toBe(P5);
    });

    it('should return compound intervals', () => {
      const C4 = Note.fromString('C4');
      const D5 = Note.fromString('D5');
      const D6 = Note.fromString('D6');
      expect(Interval.between(C4, D5)).toBe(Intervals.M9);
      expect(Interval.between(C4, D6)).toBe(Interval.fromString('M16'));

      expect(Interval.between(D5, C4)).toBe(Intervals.M9);
      expect(Interval.between(D6, C4)).toBe(Interval.fromString('M16'));
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
    const { P1, m2, d2, m3, M3, P4, TT, P5, m6, M6, M7, A7, P8 } = Intervals;
    expect(P1.inverse).toBe(P8);
    expect(m2.inverse).toBe(M7);
    expect(M3.inverse).toBe(m6);
    expect(m3.inverse).toBe(M6);
    expect(P4.inverse).toBe(P5);
    expect(TT.inverse).toBe(TT);
    expect(d2.inverse).toBe(A7);
  });

  it('augment', () => {
    const { d3, m3, M3, A3, d5, P5, A5 } = Intervals;

    expect(d3.augment).toBe(m3);
    // FIXME: m3.augment
    // expect(m3.augment).toBe(M3);
    expect(M3.augment).toBe(A3);

    expect(d5.augment).toBe(P5);
    expect(P5.augment).toBe(A5);
  });

  it('diminish', () => {
    const { d3, m3, M3, A3, d5, P5, A5 } = Intervals;

    expect(m3.diminish).toBe(d3);
    // FIXME: M3.diminish
    // expect(M3.diminish).toBe(m3);
    expect(A3.diminish).toBe(M3);

    expect(P5.diminish).toBe(d5);
    expect(A5.diminish).toBe(P5);
  });

  it('natural', () => {
    const { d3, m3, M3, A3 } = Intervals;
    expect(m3.natural).toBe(m3);
    expect(M3.natural).toBe(M3);
    // FIXME: d3.natural
    // expect(d3.natural).toBe(M3);
    expect(A3.natural).toBe(M3);
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
    expect(Interval.fromString('A9').name).toBe('A9');
    expect(Interval.fromString('d9').name).toBe('d9');

    expect(Interval.fromString('M9').number).toBe(9);
    expect(Interval.fromString('m9').number).toBe(9);
    expect(Interval.fromString('A9').number).toBe(9);
    expect(Interval.fromString('d9').number).toBe(9);

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
