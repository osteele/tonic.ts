import * as _ from 'lodash';
import { allFingerings, fingeringFor, Instruments, Interval } from '../src';

describe.skip('allFingerings', () => {
  const fingerings = allFingerings('A Major', Instruments.Guitar);
  expect(_.map(fingerings, 'fretString')).toHaveLength(100);
});

describe('Fingering', () => {
  const fingering = fingeringFor('E Major', Instruments.Guitar);
  // const fingering = new Fingering(Chord.fromString('E Major'), Instrument.Guitar, ...)

  it('should have an array of barres', () =>
    expect(fingering.barres).toBeInstanceOf(Array));

  it('should have a fretString', () => {
    expect(fingering.fretString).toMatch(/^[\dx]{6}$/);
    expect(fingering.fretString).toBe('022100');
  });

  // it.skip('should have an inversion');
  // it.skip('should have an inversion letter');

  describe('positions', () => {
    it('should be an array', () => {
      expect(fingering.positions).toBeInstanceOf(Array);
    });
    it('should have properties', () => {
      expect(fingering.positions[0].fretNumber).toBe(0);
      expect(fingering.positions[0].stringNumber).toBe(0);
      expect(fingering.positions[0].intervalClass).toBe(
        Interval.fromString('P1'),
      );
    });
  });

  it('should define properties', () => {
    expect(fingering.properties.bassIsRoot).toBe(true);
    expect(fingering.properties.barres).toBe(0);
    expect(fingering.properties.fingers).toBe(3);
    expect(fingering.properties.skipped).toBe(false);
    expect(fingering.properties.muting).toBe(false);
    expect(fingering.properties.open).toBe(true);
    expect(fingering.properties.triad).toBe(false);
    expect(fingering.properties.position).toBe(0);
    expect(fingering.properties.strings).toBe(6);
  });
});

describe('bestFingeringFor', () => {
  it('should yield best fingerings for open chords', () => {
    const instrument = Instruments.Guitar;
    expect(fingeringFor('E Major', instrument).fretString).toBe('022100');
    // FIXME: should be x02220
    expect(fingeringFor('A Major', instrument).fretString).toBe('002220');
    // FIXME: should be xx0232
    expect(fingeringFor('D Major', instrument).fretString).toBe('200232');
    expect(fingeringFor('G Major', instrument).fretString).toBe('320003');
    // FIXME: should be x32010
    expect(fingeringFor('C Major', instrument).fretString).toBe('032010');

    expect(fingeringFor('E Minor', instrument).fretString).toBe('022000');
    // FIXME: should be xx02210
    expect(fingeringFor('A Minor', instrument).fretString).toBe('002210');
    // FIXME: should be xx0231
    expect(fingeringFor('D Minor', instrument).fretString).toBe('100231');
  });

  describe('E Major', () => {
    const fingering = fingeringFor('E Major', Instruments.Guitar);

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
