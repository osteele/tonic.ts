import * as _ from 'lodash';
import {
  allFrettings,
  FrettedChord,
  frettingFor,
  Instruments,
  Interval,
} from '../src';

describe('allFrettings', () => {
  const eMajor = allFrettings('E Major', Instruments.Guitar);
  const aMinor = allFrettings('A Major', Instruments.Guitar);

  it('should generate lots of frettings', () => {
    expect(_.map(eMajor, 'ascii')).toHaveLength(22);
    expect(_.map(aMinor, 'ascii')).toHaveLength(11);
  });

  it('should generate specific frettings', () => {
    expect(_.map(eMajor, 'ascii')).toContain('022100');
    expect(_.map(eMajor, 'ascii')).toContain('022104');
  });

  it('should generate frettings with muted strings', () => {
    expect(_.map(eMajor, 'ascii')).toContain('xx2100');
    expect(_.map(eMajor, 'ascii')).toContain('xxx100');
  });
});

describe('FrettedChord', () => {
  const fretting = frettingFor('E Major', Instruments.Guitar);

  it('fromAscii', () => {
    expect(FrettedChord.fromAscii('022100', Instruments.Guitar).ascii).toBe(
      '022100',
    );
  });

  it('ascii', () => {
    expect(fretting.ascii).toMatch(/^[\dx]{6}$/);
    expect(fretting.ascii).toBe('022100');
  });

  it('barres', () => {
    expect(fretting.barres).toBeInstanceOf(Array);
  });

  it('pitches', () => {
    expect(_.invokeMap(fretting.pitches, 'toString')).toEqual([
      'E2',
      'B2',
      'E2',
      'G♯2',
      'B2',
      'E2',
    ]);
  });

  // it.skip('should have an inversion');
  // it.skip('should have an inversion letter');

  describe('positions', () => {
    it('should be an array', () => {
      expect(fretting.positions).toBeInstanceOf(Array);
    });
    it('should have properties', () => {
      expect(fretting.positions[0].fretNumber).toBe(0);
      expect(fretting.positions[0].stringNumber).toBe(0);
      expect(fretting.positions[0].intervalClass).toBe(
        Interval.fromString('P1'),
      );
    });
  });

  it('should define properties', () => {
    expect(fretting.properties.bassIsRoot).toBe(true);
    expect(fretting.properties.barres).toBe(0);
    expect(fretting.properties.fingers).toBe(3);
    expect(fretting.properties.skipped).toBe(false);
    expect(fretting.properties.muting).toBe(false);
    expect(fretting.properties.open).toBe(true);
    expect(fretting.properties.triad).toBe(false);
    expect(fretting.properties.position).toBe(0);
    expect(fretting.properties.strings).toBe(6);
  });
});

describe('frettingFor', () => {
  const guitar = Instruments.Guitar;

  it('should yield the preferred fingerings for major open chords', () => {
    expect(frettingFor('E Major', guitar).ascii).toBe('022100');
    expect(frettingFor('A Major', guitar).ascii).toBe('x02220');
    expect(frettingFor('D Major', guitar).ascii).toBe('xx0232');
    expect(frettingFor('G Major', guitar).ascii).toBe('320003');
    expect(frettingFor('C Major', guitar).ascii).toBe('x32010');
  });

  it('should yield the preferred fingerings for minor open chords', () => {
    expect(frettingFor('E Minor', guitar).ascii).toBe('022000');
    expect(frettingFor('A Minor', guitar).ascii).toBe('x02210');
    expect(frettingFor('D Minor', guitar).ascii).toBe('xx0231');
  });

  it.skip('should yield the preferred fingerings for major non-open chords', () => {
    expect(frettingFor('B Major', guitar).ascii).toBe('x24442');
    expect(frettingFor('F Major', guitar).ascii).toBe('133211');
    expect(frettingFor('F# Major', guitar).ascii).toBe('244322');
    // TODO: Nashville style G: 3×0033
  });

  it.skip('should yield the preferred fingerings for major non-open chords', () => {
    expect(frettingFor('A Sus2', guitar).ascii).toBe('002200');
    expect(frettingFor('B Sus2', guitar).ascii).toBe('224422');
    expect(frettingFor('C Sus2', guitar).ascii).toBe('335533');
    expect(frettingFor('D Sus2', guitar).ascii).toBe('x00230');
    expect(frettingFor('E Sus4', guitar).ascii).toBe('022200');
    expect(frettingFor('F Sus4', guitar).ascii).toBe('133311');
    expect(frettingFor('G Sus4', guitar).ascii).toBe('366633');
  });

  it('should yield the preferred fingerings for dominant 7th chords', () => {
    // FIXME: should be 020100
    expect(frettingFor('E7', guitar).ascii).toBe('022100');
    expect(frettingFor('E7', guitar).ascii).toBe('022100');
    // FIXME: should be 320001
    expect(frettingFor('G7', guitar).ascii).toBe('320003');
    // FIXME: should be x02020
    expect(frettingFor('A7', guitar).ascii).toBe('x02220');
    // FIXME: should be x21202
    expect(frettingFor('B7', guitar).ascii).toBe('x21402');
    // FIXME: should be xx0212
    expect(frettingFor('D7', guitar).ascii).toBe('xx0232');
  });

  it('should yield the preferred fingerings for minor 7th chords', () => {
    expect(frettingFor('Dm7', guitar).ascii).toBe('xx0211');
    expect(frettingFor('Em7', guitar).ascii).toBe('020000');
    expect(frettingFor('Am7', guitar).ascii).toBe('x02010');
    expect(frettingFor('Bm7', guitar).ascii).toBe('x20202');
    expect(frettingFor('F♯m7', guitar).ascii).toBe('202220');
  });

  it('should yield the preferred fingerings for major 7th chords', () => {
    expect(frettingFor('Cmaj7', guitar).ascii).toBe('x32000');
    expect(frettingFor('Dmaj7', guitar).ascii).toBe('xx0222');
    expect(frettingFor('Emaj7', guitar).ascii).toBe('021100');
    // FIXME: expect 103210
    expect(frettingFor('Fmaj7', guitar).ascii).toBe('102210');
    expect(frettingFor('Gmaj7', guitar).ascii).toBe('320002');
    expect(frettingFor('Amaj7', guitar).ascii).toBe('x02120');
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
