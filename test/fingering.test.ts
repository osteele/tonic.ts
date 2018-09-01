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
  const guitar = Instruments.Guitar;

  it('should yield the preferred fingerings for open chords', () => {
    expect(fingeringFor('E Major', guitar).fretString).toBe('022100');
    expect(fingeringFor('A Major', guitar).fretString).toBe('x02220');
    expect(fingeringFor('D Major', guitar).fretString).toBe('xx0232');
    expect(fingeringFor('G Major', guitar).fretString).toBe('320003');
    expect(fingeringFor('C Major', guitar).fretString).toBe('x32010');

    expect(fingeringFor('E Minor', guitar).fretString).toBe('022000');
    expect(fingeringFor('A Minor', guitar).fretString).toBe('x02210');
    expect(fingeringFor('D Minor', guitar).fretString).toBe('xx0231');
  });

  it('should yield the preferred fingerings for dominant 7th chords', () => {
    // TODO: should be 020100
    expect(fingeringFor('E7', guitar).fretString).toBe('022100');
    // TODO: should be 320001
    expect(fingeringFor('G7', guitar).fretString).toBe('320003');
    // TODO: should be x02020
    expect(fingeringFor('A7', guitar).fretString).toBe('x02220');
    // TODO: should be x21202
    expect(fingeringFor('B7', guitar).fretString).toBe('x21402');
    // TODO: should be xx0212
    expect(fingeringFor('D7', guitar).fretString).toBe('xx0232');
  });

  it.skip('should yield the preferred fingerings for minor 7th chords', () => {
    expect(fingeringFor('Dm7', guitar).fretString).toBe('xx0211')
    expect(fingeringFor('Em7', guitar).fretString).toBe('020000')
    expect(fingeringFor('Am7', guitar).fretString).toBe('x02010')
    expect(fingeringFor('Bm7', guitar).fretString).toBe('x20202')
    expect(fingeringFor('F♯m7', guitar).fretString).toBe('202220')
  });

  it.skip('should yield the preferred fingerings for major 7th chords', () => {
    expect(fingeringFor('Cmaj7').fretString).toBe('X32000');
    expect(fingeringFor('Dmaj7').fretString).toBe('XX0222');
    expect(fingeringFor('Emaj7').fretString).toBe('021100');
    expect(fingeringFor('Fmaj7').fretString).toBe('103210');
    expect(fingeringFor('Gmaj7').fretString).toBe('320002');
    expect(fingeringFor('Amaj7').fretString).toBe('X02120');
  });

  describe('E Major', () => {
    const fingering = fingeringFor('E Major', guitar);

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
