import {
  Interval,
  intervalClassDifference,
  IntervalNames,
  Intervals,
  LongIntervalNames,
  Pitch,
} from '../src';

describe('Interval', () => {
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

    // TODO: augmented and diminished
  });

  it('toString', () => {
    expect(Interval.fromSemitones(0).toString()).toBe('P1');
    expect(Interval.fromSemitones(1).toString()).toBe('m2');
    expect(Interval.fromSemitones(4).toString()).toBe('M3');
    expect(Interval.fromSemitones(12).toString()).toBe('P8');
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
    const E4 = Pitch.fromString('E4');
    const F4 = Pitch.fromString('F4');
    const G4 = Pitch.fromString('G4');
    const C4 = Pitch.fromString('C4');
    const { P1, P5, m2, m3 } = Intervals;

    it('should return the interval between two pitches', () => {
      expect(Interval.between(E4, E4)).toBe(P1);
      expect(Interval.between(E4, F4)).toBe(m2);
      expect(Interval.between(E4, G4)).toBe(m3);
    });
    it('should use modular arithmetic', () =>
      expect(Interval.between(F4, C4)).toBe(P5));
  });

  it.skip('invert', () => {
    const { P1, P5, m2, m3, M3, P4 } = Intervals;
    expect(M3.inversion).toBe(m3);
    expect(m3.inversion).toBe(M3);
    expect(P4.inversion).toBe(P5);
    expect(TT.inversion).toBe(TT);
    // TODO: augmented and diminished
  });
});

describe('IntervalNames', () => {
  it('should have 13 intervals', () => {
    expect(IntervalNames).toHaveLength(13);
  });
  it('should start with P1', () => expect(IntervalNames[0]).toBe('P1'));
  it('should end with P8', () => expect(IntervalNames[12]).toBe('P8'));
});

describe('LongIntervalNames', () => {
  it('should have 13 intervals', () => {
    expect(LongIntervalNames).toHaveLength(13);
  });
  it('should start with Unison', () =>
    expect(LongIntervalNames[0]).toBe('Unison'));
  it('should end with Octave', () =>
    expect(LongIntervalNames[12]).toBe('Octave'));
});

describe('intervalClassDifference', () =>
  it('should return an integer in [0...12]', () => {
    expect(intervalClassDifference(0, 5)).toBe(5);
    expect(intervalClassDifference(5, 0)).toBe(7);
    expect(intervalClassDifference(0, 12)).toBe(0);
  }));
