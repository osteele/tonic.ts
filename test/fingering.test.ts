import { Interval } from '../src';
import { Fingering } from '../src/fingering';
import { Instruments } from '../src/instrument';

describe('Fingering', () => {
  const instrument = Instruments.Guitar;
  const fingering = Fingering.best('E Major', instrument);

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

  it('should define properties', () => {
    expect(fingering.properties.root).toBe(true);
    expect(fingering.properties.barres).toBe(0);
    expect(fingering.properties.fingers).toBe(3);
    expect(fingering.properties.skipping).toBe(false);
    expect(fingering.properties.muting).toBe(false);
    expect(fingering.properties.open).toBe(true);
    expect(fingering.properties.triad).toBe(false);
    expect(fingering.properties.position).toBe(0);
    expect(fingering.properties.strings).toBe(6);
  });
});
// fingering.positions[0].should.have.properties 'fret', 'string', 'intervalClass'

describe('bestFingeringFor', () => {
  it('should yield best fingerings for open chords', () => {
    const instrument = Instruments.Guitar;
    // FIXME: option to leave the 6 off DMaj, CMaj, Amin, Dmin
    expect(Fingering.best('E Major', instrument).fretString).toBe('022100');
    expect(Fingering.best('A Major', instrument).fretString).toBe('002220');
    expect(Fingering.best('D Major', instrument).fretString).toBe('200232');
    expect(Fingering.best('C Major', instrument).fretString).toBe('032010');
    expect(Fingering.best('G Major', instrument).fretString).toBe('320003');

    expect(Fingering.best('A Minor', instrument).fretString).toBe('002210');
    expect(Fingering.best('D Minor', instrument).fretString).toBe('100231');
    expect(Fingering.best('E Minor', instrument).fretString).toBe('022000');
  });

  describe('E Major', () => {
    const fingering = Fingering.best('E Major', Instruments.Guitar);

    it('should have fingers at 022100', () => {
      expect(fingering.positions).toHaveLength(6);
      expect(fingering.positions[0].stringNumber).toBe(0); // 'finger #1 string'
      expect(fingering.positions[0].fretNumber).toBe(0); // 'finger #1 fret'
      expect(fingering.positions[0].intervalClass).toBe(
        Interval.fromString('P1'),
      );

      expect(fingering.positions[1].stringNumber).toBe(1); // 'finger #2 string'
      expect(fingering.positions[1].fretNumber).toBe(2); // 'finger #2 fret'
      expect(fingering.positions[1].intervalClass).toBe(
        Interval.fromString('P5'),
      );

      expect(fingering.positions[2].stringNumber).toBe(2); // 'finger #3 string'
      expect(fingering.positions[2].fretNumber).toBe(2); // 'finger #3 fret'
      expect(fingering.positions[2].intervalClass).toBe(
        Interval.fromString('P1'),
      );

      expect(fingering.positions[3].stringNumber).toBe(3); // 'finger #4 string'
      expect(fingering.positions[3].fretNumber).toBe(1); // 'finger #4 fret'
      expect(fingering.positions[3].intervalClass).toBe(
        Interval.fromString('M3'),
      );

      expect(fingering.positions[4].stringNumber).toBe(4); // 'finger #5 string'
      expect(fingering.positions[4].fretNumber).toBe(0); // 'finger #5 fret'
      expect(fingering.positions[4].intervalClass).toBe(
        Interval.fromString('P5'),
      );

      expect(fingering.positions[5].stringNumber).toBe(5); // 'finger #6 string'
      expect(fingering.positions[5].fretNumber).toBe(0); // 'finger #6 fret'
      expect(fingering.positions[5].intervalClass).toBe(
        Interval.fromString('P1'),
      );
    });

    it('should have no barres', () => {
      expect(fingering.barres).toHaveLength(0);
    });
  });
});
