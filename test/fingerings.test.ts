import { bestFingeringFor } from '../src/fingerings';
import { Chord, Interval } from '../src/index';
import { Instruments } from '../src/instruments';

describe('Fingering', () => {
  const chord = Chord.fromString('E Major') as Chord;
  const instrument = Instruments.Guitar;
  const fingering = bestFingeringFor(chord, instrument);

  // it('should have an array of barres', () =>
  //   fingering.barres.should.be.an.Array);

  it('should have a fretString', () => {
    expect(fingering.fretString).toMatch(/^[\dx]{6}$/);
  });

  // it.skip('should have an inversion');
  // it.skip('should have an inversion letter');
  // it.skip('should have a properties dictionary')

  describe('positions', () => {
    // it.skip('should be an array);
    // it.skip('should have fret and string properties');
  });
});
// fingering.positions[0].should.have.properties 'fret', 'string', 'intervalClass'

describe('bestFingeringFor', () => {
  describe('E Major', () => {
    const fingering = bestFingeringFor(
      Chord.fromString('E Major') as Chord,
      Instruments.Guitar
    );

    it('should have fingers at 022100', () => {
      expect(fingering.positions).toHaveLength(6);
      expect(fingering.positions[0].string).toBe(0); // 'finger #1 string'
      expect(fingering.positions[0].fret).toBe(0); // 'finger #1 fret'
      expect(fingering.positions[0].intervalClass).toBe(
        Interval.fromString('P1')
      );

      expect(fingering.positions[1].string).toBe(1); // 'finger #2 string'
      expect(fingering.positions[1].fret).toBe(2); // 'finger #2 fret'
      expect(fingering.positions[1].intervalClass).toBe(
        Interval.fromString('P5')
      );

      expect(fingering.positions[2].string).toBe(2); // 'finger #3 string'
      expect(fingering.positions[2].fret).toBe(2); // 'finger #3 fret'
      expect(fingering.positions[2].intervalClass).toBe(
        Interval.fromString('P1')
      );

      expect(fingering.positions[3].string).toBe(3); // 'finger #4 string'
      expect(fingering.positions[3].fret).toBe(1); // 'finger #4 fret'
      expect(fingering.positions[3].intervalClass).toBe(
        Interval.fromString('M3')
      );

      expect(fingering.positions[4].string).toBe(4); // 'finger #5 string'
      expect(fingering.positions[4].fret).toBe(0); // 'finger #5 fret'
      expect(fingering.positions[4].intervalClass).toBe(
        Interval.fromString('P5')
      );

      expect(fingering.positions[5].string).toBe(5); // 'finger #6 string'
      expect(fingering.positions[5].fret).toBe(0); // 'finger #6 fret'
      expect(fingering.positions[5].intervalClass).toBe(
        Interval.fromString('P1')
      );
    });

    it('should have no barres', () => {
      expect(fingering.barres).toHaveLength(0);
    });

    it('properties', () => {
      expect(fingering.properties.root).toBe(true); // 'root'
      expect(fingering.properties.barres).toBe(0); // 'barres'
      expect(fingering.properties.fingers).toBe(3); // 'fingers'
      expect(fingering.properties.skipping).toBe(false); // 'skipping'
      expect(fingering.properties.muting).toBe(false); // 'muting'
      expect(fingering.properties.open).toBe(true); // 'open'
      expect(fingering.properties.triad).toBe(false); // 'triad'
      expect(fingering.properties.position).toBe(0); // 'position'
      expect(fingering.properties.strings).toBe(6); // 'strings'
    });
  });
});
