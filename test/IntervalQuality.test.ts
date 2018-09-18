import { IntervalQuality as IQ } from '../src';

describe('IntervalQuality', () => {
  it('fromSemitones', () => {
    expect(IQ.fromSemitones(-2)).toBe(IQ.DoublyDiminished);
    expect(IQ.fromSemitones(-1)).toBe(IQ.Diminished);
    expect(IQ.fromSemitones(0)).toBe(null);
    expect(IQ.fromSemitones(1)).toBe(IQ.Augmented);
    expect(IQ.fromSemitones(2)).toBe(IQ.DoublyAugmented);
  });

  it('toSemitones', () => {
    expect(IQ.toSemitones(IQ.Major)).toBe(0);
    expect(IQ.toSemitones(IQ.Minor)).toBe(0);
    expect(IQ.toSemitones(IQ.Perfect)).toBe(0);
    expect(IQ.toSemitones(IQ.Augmented)).toBe(1);
    expect(IQ.toSemitones(IQ.Diminished)).toBe(-1);
    expect(IQ.toSemitones(IQ.DoublyAugmented)).toBe(2);
    expect(IQ.toSemitones(IQ.DoublyDiminished)).toBe(-2);
    expect(IQ.toSemitones(null)).toBe(0);
  });

  it('inverse', () => {
    expect(IQ.inverse(IQ.Major)).toBe(IQ.Minor);
    expect(IQ.inverse(IQ.Minor)).toBe(IQ.Major);
    expect(IQ.inverse(IQ.Perfect)).toBe(IQ.Perfect);
    expect(IQ.inverse(IQ.Augmented)).toBe(IQ.Diminished);
    expect(IQ.inverse(IQ.Diminished)).toBe(IQ.Augmented);
    expect(IQ.inverse(IQ.DoublyAugmented)).toBe(IQ.DoublyDiminished);
    expect(IQ.inverse(IQ.DoublyDiminished)).toBe(IQ.DoublyAugmented);
    expect(IQ.inverse(null)).toBe(null);
  });

  it('augment', () => {
    expect(IQ.augment(IQ.DoublyDiminished)).toBe(IQ.Diminished);
    expect(IQ.augment(IQ.Diminished)).toBe(IQ.Minor);
    expect(IQ.augment(IQ.Minor)).toBe(IQ.Major);
    expect(IQ.augment(IQ.Major)).toBe(IQ.Augmented);
    expect(IQ.augment(IQ.Augmented)).toBe(IQ.DoublyAugmented);
    expect(IQ.augment(IQ.DoublyAugmented)).toBe(null);

    expect(IQ.augment(IQ.Diminished, true)).toBe(IQ.Perfect);
    expect(IQ.augment(IQ.Perfect)).toBe(IQ.Augmented);
    expect(IQ.augment(null)).toBe(IQ.Augmented);
  });

  it('diminish', () => {
    expect(IQ.diminish(IQ.DoublyDiminished)).toBe(null);
    expect(IQ.diminish(IQ.Diminished)).toBe(IQ.DoublyDiminished);
    expect(IQ.diminish(IQ.Minor)).toBe(IQ.Diminished);
    expect(IQ.diminish(IQ.Major)).toBe(IQ.Minor);
    expect(IQ.diminish(IQ.Augmented)).toBe(IQ.Major);
    expect(IQ.diminish(IQ.DoublyAugmented)).toBe(IQ.Augmented);

    expect(IQ.diminish(IQ.Augmented, true)).toBe(IQ.Perfect);
    expect(IQ.diminish(IQ.Perfect)).toBe(IQ.Diminished);
    expect(IQ.diminish(null)).toBe(IQ.Diminished);
  });
});
