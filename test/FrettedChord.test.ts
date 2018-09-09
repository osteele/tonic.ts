import * as _ from 'lodash';
import { allFrettings, FrettedChord, frettingFor, Interval } from '../src';

describe('allFrettings', () => {
  const eMajor = allFrettings('E Major');
  const aMinor = allFrettings('A Major');

  it('should have the expected length', () => {
    expect(_.map(eMajor, 'ascii')).toHaveLength(22);
    expect(_.map(aMinor, 'ascii')).toHaveLength(11);
  });

  it('should include specific frettings', () => {
    expect(_.map(eMajor, 'ascii')).toContain('022100');
    expect(_.map(eMajor, 'ascii')).toContain('022104');
  });

  it('should include frettings with muted strings', () => {
    expect(_.map(eMajor, 'ascii')).toContain('xx2100');
    expect(_.map(eMajor, 'ascii')).toContain('xxx100');
  });
});

describe('FrettedChord', () => {
  const fretting = frettingFor('E Major');

  it('fromAscii', () => {
    expect(FrettedChord.fromAscii('022100').ascii).toBe('022100');
  });

  it('ascii', () => {
    expect(fretting.ascii).toMatch(/^[\dx]{6}$/);
    expect(fretting.ascii).toBe('022100');
  });

  it('barres', () => {
    expect(fretting.barres).toBeInstanceOf(Array);
    expect(fretting.barres).toHaveLength(0);
  });

  it('intervals', () => {
    expect(_.invokeMap(fretting.intervals, 'toString').join(' ')).toEqual(
      'P1 P5 P1 M3 P5 P1',
    );
  });

  it('pitches', () => {
    expect(_.invokeMap(fretting.pitches, 'toString').join(' ')).toEqual(
      'E2 B2 E3 G♯3 B3 E4',
    );
  });

  describe('positions', () => {
    it('should be an array', () => {
      expect(fretting.positions).toBeInstanceOf(Array);
    });
    it('should have properties', () => {
      expect(fretting.positions[0].fretNumber).toBe(0);
      expect(fretting.positions[0].stringNumber).toBe(0);
      expect(fretting.positions[0].intervalClass.name).toBe('P1');
      expect(fretting.positions[0].pitch.name).toBe('E2');
    });
  });

  it('should have properties', () => {
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
  it('major open chords', () => {
    expect(frettingFor('E Major').ascii).toBe('022100');
    expect(frettingFor('A Major').ascii).toBe('x02220');
    expect(frettingFor('D Major').ascii).toBe('xx0232');
    expect(frettingFor('G Major').ascii).toBe('320003');
    expect(frettingFor('C Major').ascii).toBe('x32010');
  });

  it('minor open chords', () => {
    expect(frettingFor('E Minor').ascii).toBe('022000');
    expect(frettingFor('A Minor').ascii).toBe('x02210');
    expect(frettingFor('D Minor').ascii).toBe('xx0231');
  });

  it.skip('major non-open chords', () => {
    expect(frettingFor('B Major').ascii).toBe('x24442');
    expect(frettingFor('F Major').ascii).toBe('133211');
    expect(frettingFor('F# Major').ascii).toBe('244322');
    // TODO: Nashville style G: 3×0033
  });

  it.skip('sus chords', () => {
    expect(frettingFor('A Sus2').ascii).toBe('002200');
    expect(frettingFor('B Sus2').ascii).toBe('224422');
    expect(frettingFor('C Sus2').ascii).toBe('335533');
    expect(frettingFor('D Sus2').ascii).toBe('x00230');
    expect(frettingFor('E Sus4').ascii).toBe('022200');
    expect(frettingFor('F Sus4').ascii).toBe('133311');
    expect(frettingFor('G Sus4').ascii).toBe('366633');
  });

  it('dominant 7ths', () => {
    expect(frettingFor('E7').ascii).toBe('020100');
    expect(frettingFor('G7').ascii).toBe('320001');
    expect(frettingFor('A7').ascii).toBe('x02020');
    expect(frettingFor('B7').ascii).toBe('x21202');
    expect(frettingFor('D7').ascii).toBe('xx0212');
  });

  it('minor 7ths', () => {
    expect(frettingFor('Dm7').ascii).toBe('xx0211');
    expect(frettingFor('Em7').ascii).toBe('020000');
    expect(frettingFor('Am7').ascii).toBe('x02010');
    expect(frettingFor('Bm7').ascii).toBe('x20202');
    expect(frettingFor('F♯m7').ascii).toBe('202220');
  });

  it('major 7ths', () => {
    expect(frettingFor('Cmaj7').ascii).toBe('x32000');
    expect(frettingFor('Dmaj7').ascii).toBe('xx0222');
    expect(frettingFor('Emaj7').ascii).toBe('021100');
    // FIXME: expect 103210
    expect(frettingFor('Fmaj7').ascii).toBe('102210');
    expect(frettingFor('Gmaj7').ascii).toBe('320002');
    expect(frettingFor('Amaj7').ascii).toBe('x02120');
  });

  it.skip('major 9ths', () => {
    const options = { maxFretNumber: 11 };
    expect(frettingFor('AM9', options).ascii).toBe('xx7454');
    expect(frettingFor('BM9', options).ascii).toBe('xx9676');
    expect(frettingFor('BbM9', options).ascii).toBe('xx8565');
    expect(frettingFor('CM9', options).ascii).toBe('xx(10)787');
    expect(frettingFor('C#M9', options).ascii).toBe('xx(11)898');
    expect(frettingFor('DM9', options).ascii).toBe('xx0220');
    expect(frettingFor('EM9', options).ascii).toBe('099800');
    expect(frettingFor('FM9', options).ascii).toBe('xx3010');
    expect(frettingFor('GM9', options).ascii).toBe('xx5232');
  });

  it.skip('minor 9ths', () => {
    const options = { maxFretNumber: 9 };
    expect(frettingFor('Am9', options).ascii).toBe('575557');
    expect(frettingFor('Bm9', options).ascii).toBe('797779');
    expect(frettingFor('Cm9', options).ascii).toBe('x3133x');
    expect(frettingFor('Dm9', options).ascii).toBe('x5355x');
    expect(frettingFor('Em9', options).ascii).toBe('x7577x');
    expect(frettingFor('Fm9', options).ascii).toBe('x8688x');
    expect(frettingFor('Gm9', options).ascii).toBe('353335');
  });

  // TODO: inversions, e.g. Am/E
  // A: xxx655 | A: xxx9(10)9 | A: xxx220
  // B: xxx442
  // C: xxx553
  // D: xxx775
  // E: xxx997
  // F: xxx211
  // G: xxx433

  describe('E Major', () => {
    const fingering = frettingFor('E Major');

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
