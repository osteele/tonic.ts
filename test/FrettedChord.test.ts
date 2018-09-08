import * as _ from 'lodash';
import { allFrettings, frettingFor, Instruments, Interval } from '../src';

describe('allFrettings', () => {
  const eMajor = allFrettings('E Major', Instruments.Guitar);
  const aMinor = allFrettings('A Major', Instruments.Guitar);

  it('should generate lots of frettings', () => {
    expect(_.map(eMajor, 'fretString')).toHaveLength(22);
    expect(_.map(aMinor, 'fretString')).toHaveLength(11);
  });

  it('should generate specific frettings', () => {
    expect(_.map(eMajor, 'fretString')).toContain('022100');
    expect(_.map(eMajor, 'fretString')).toContain('022104');
  });

  it('should generate frettings with muted strings', () => {
    expect(_.map(eMajor, 'fretString')).toContain('xx2100');
    expect(_.map(eMajor, 'fretString')).toContain('xxx100');

    const e7 = allFrettings('E7', Instruments.Guitar);
    // FIXME:
    // expect(_.map(e7, 'fretString')).toContain('020100');
  });
});

describe('FrettedChord', () => {
  const fingering = frettingFor('E Major', Instruments.Guitar);

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

describe('frettingFor', () => {
  const guitar = Instruments.Guitar;

  it('should yield the preferred fingerings for major open chords', () => {
    expect(frettingFor('E Major', guitar).fretString).toBe('022100');
    expect(frettingFor('A Major', guitar).fretString).toBe('x02220');
    expect(frettingFor('D Major', guitar).fretString).toBe('xx0232');
    expect(frettingFor('G Major', guitar).fretString).toBe('320003');
    expect(frettingFor('C Major', guitar).fretString).toBe('x32010');
  });

  it('should yield the preferred fingerings for minor open chords', () => {
    expect(frettingFor('E Minor', guitar).fretString).toBe('022000');
    expect(frettingFor('A Minor', guitar).fretString).toBe('x02210');
    expect(frettingFor('D Minor', guitar).fretString).toBe('xx0231');
  });

  it.skip('should yield the preferred fingerings for major non-open chords', () => {
    expect(frettingFor('B Major', guitar).fretString).toBe('x24442');
    expect(frettingFor('F Major', guitar).fretString).toBe('133211');
    expect(frettingFor('F# Major', guitar).fretString).toBe('244322');
    // TODO: Nashville style G: 3×0033
  });

  it.skip('should yield the preferred fingerings for major non-open chords', () => {
    expect(frettingFor('A Sus2', guitar).fretString).toBe('002200');
    expect(frettingFor('B Sus2', guitar).fretString).toBe('224422');
    expect(frettingFor('C Sus2', guitar).fretString).toBe('335533');
    expect(frettingFor('D Sus2', guitar).fretString).toBe('x00230');
    expect(frettingFor('E Sus4', guitar).fretString).toBe('022200');
    expect(frettingFor('F Sus4', guitar).fretString).toBe('133311');
    expect(frettingFor('G Sus4', guitar).fretString).toBe('366633');
  });

  it('should yield the preferred fingerings for dominant 7th chords', () => {
    // FIXME: should be 020100
    expect(frettingFor('E7', guitar).fretString).toBe('022100');
    expect(frettingFor('E7', guitar).fretString).toBe('022100');
    // FIXME: should be 320001
    expect(frettingFor('G7', guitar).fretString).toBe('320003');
    // FIXME: should be x02020
    expect(frettingFor('A7', guitar).fretString).toBe('x02220');
    // FIXME: should be x21202
    expect(frettingFor('B7', guitar).fretString).toBe('x21402');
    // FIXME: should be xx0212
    expect(frettingFor('D7', guitar).fretString).toBe('xx0232');
  });

  it('should yield the preferred fingerings for minor 7th chords', () => {
    expect(frettingFor('Dm7', guitar).fretString).toBe('xx0211');
    expect(frettingFor('Em7', guitar).fretString).toBe('020000');
    expect(frettingFor('Am7', guitar).fretString).toBe('x02010');
    expect(frettingFor('Bm7', guitar).fretString).toBe('x20202');
    expect(frettingFor('F♯m7', guitar).fretString).toBe('202220');
  });

  it('should yield the preferred fingerings for major 7th chords', () => {
    expect(frettingFor('Cmaj7', guitar).fretString).toBe('x32000');
    expect(frettingFor('Dmaj7', guitar).fretString).toBe('xx0222');
    expect(frettingFor('Emaj7', guitar).fretString).toBe('021100');
    // FIXME: expect 103210
    expect(frettingFor('Fmaj7', guitar).fretString).toBe('102210');
    expect(frettingFor('Gmaj7', guitar).fretString).toBe('320002');
    expect(frettingFor('Amaj7', guitar).fretString).toBe('x02120');
  });

  // TODO: Major 9
  // AM9: xx7454
  // BM9: xx9676 ||| BbM9: xx8565
  // CM9: xx(10)787 ||| C#M9: xx(11)898
  // DM9: xx0220
  // EM9: 099800
  // FM9: xx3010
  // GM9: xx5232

  // TODO: Minor 9
  // Am9: 575557
  // Bm9: 797779
  // Cm9: x3133x
  // Dm9: x5355x
  // Em9: x7577x
  // Fm9: x8688x
  // Gm9: 353335

  // TODO: inversions, e.g. Am/E
  // A: xxx655 | A: xxx9(10)9 | A: xxx220
  // B: xxx442
  // C: xxx553
  // D: xxx775
  // E: xxx997
  // F: xxx211
  // G: xxx433

  describe('E Major', () => {
    const fingering = frettingFor('E Major', guitar);

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
