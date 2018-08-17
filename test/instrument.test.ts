import { Instruments } from '../src/instrument';

describe('Instruments', () => {
  it('should define a guitar', () => {
    expect(Instruments.Guitar).toBeTruthy();
  });
});

describe('Instrument', () => {
  const guitar = Instruments.Guitar;

  it('should have a string count', () => {
    expect(guitar.stringCount).toBe(6);
  });

  it('should have an array of strings', () => {
    expect(guitar.strings).toBe(6);
  });

  it('should have a fret count', () => {
    expect(guitar.fretCount).toBe(12);
  });

  it('should have an array of strings', () => {
    expect(guitar.stringNumbers).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should have an array of string pitches', () => {
    expect(guitar.stringPitches).toHaveLength(6);
    expect(guitar.stringPitches[0].toString()).toBe('E2');
    expect(guitar.stringPitches[5].toString()).toBe('E4');
  });

  it('should define the pitch at each string and fret', () => {
    expect(guitar.pitchAt({ string: 0, fret: 0 }).toString()).toBe('E2');
    expect(guitar.pitchAt({ string: 0, fret: 1 }).toString()).toBe('F2');
    expect(guitar.pitchAt({ string: 5, fret: 3 }).toString()).toBe('G4');
  });

  describe('eachFingerPosition', () =>
    it('should iterate over each finger position', () => {
      let count = 0;
      let found = false;
      const strings: { [_: number]: boolean } = {};
      const frets: { [_: number]: boolean } = {};
      guitar.forEachFingerPosition(({ string, fret }) => {
        expect(string).toBeWithin(0, 5);
        expect(fret).toBeWithin(0, 12);
        strings[string] = true;
        frets[fret] = true;
        count += 1;
        found = found || (string === 2 && fret === 3);
      });
      expect(count).toBe(6 * 13);
      expect(Object.keys(strings)).toHaveLength(6);
      expect(Object.keys(frets)).toHaveLength(13);
      expect(frets[0]).toBe(true);
      expect(frets[12]).toBe(true);
      expect(frets[13]).toBeUndefined();
      expect(found).toBe(true);
    }));
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithin: (min: number, max: number) => R;
    }
  }
}

function toBeWithin(
  // this: jest.MatcherUtils,
  received: number,
  a: number,
  b: number,
) {
  return {
    message: () => `expected ${received} to be within ${a}…${b}`,
    pass: a <= received && received <= b,
  };
}

expect.extend({
  toBeWithin,
});
