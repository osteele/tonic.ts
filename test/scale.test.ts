import {
  Pitch,
  PitchClass,
  Scale,
  ScaleDegreeNames,
  ScalePattern,
} from '../src';
// import { ScaleDegreeNames } from '../src/scale';

describe('ScalePattern', () => {
  it('scales length', () => {
    expect(Array.from(ScalePattern.scales)).toHaveLength(10);
  });

  describe('fromString', () => {
    it('recognizes various blues and diatonic scales', () => {
      expect(ScalePattern.fromString('Diatonic Major')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Natural Minor')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Major Pentatonic')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Diatonic Major')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Minor Pentatonic')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Melodic Minor')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Harmonic Minor')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Blues')).toBeInstanceOf(ScalePattern);
      expect(ScalePattern.fromString('Freygish')).toBeInstanceOf(ScalePattern);
      expect(ScalePattern.fromString('Whole Tone')).toBeInstanceOf(
        ScalePattern,
      );
      expect(ScalePattern.fromString('Octatonic')).toBeInstanceOf(ScalePattern);
    });

    it('rejects unknown scale names', () => {
      expect(() => ScalePattern.fromString('Unknown')).toThrow();
    });
  });

  describe('Diatonic Major Scale', () => {
    const scale = ScalePattern.fromString('Diatonic Major');

    it('should have seven pitch classes', () => {
      expect(scale.pitchClasses).toHaveLength(7);
      expect(scale.pitchClasses).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have seven intervals', () => {
      expect(scale.intervals).toHaveLength(7);
      expect(scale.intervals.map((interval) => interval.semitones)).toEqual([
        0,
        2,
        4,
        5,
        7,
        9,
        11,
      ]);
    });

    it('should have seven modes', () => {
      expect(scale.modes).toHaveLength(7);
    });
  });
});

describe('Scale', () => {
  describe('fromString', () => {
    it('parses scales with Pitch tonics', () => {
      expect(Scale.fromString('E7 Diatonic Major')).toBeInstanceOf(Scale);
      expect(Scale.fromString('E♯7 Diatonic Major')).toBeInstanceOf(Scale);
      expect(Scale.fromString('E7')).toBeInstanceOf(Scale);

      expect(Scale.fromString('E7 Diatonic Major').tonic).toBeInstanceOf(Pitch);
      expect(Scale.fromString('E♯7 Diatonic Major').tonic).toBeInstanceOf(
        Pitch,
      );
      expect(Scale.fromString('E7').tonic).toBeInstanceOf(Pitch);

      expect(Scale.fromString('E7 Diatonic Major').tonic.name).toBe('E7');
      expect(Scale.fromString('E♯7 Diatonic Major').tonic.name).toBe('E♯7');
      expect(Scale.fromString('E7').tonic.name).toBe('E7');
    });

    it('parses scales with PitchClass tonics', () => {
      // expect(Scale.fromString('E Diatonic Major')).toBeInstanceOf(Scale);
      // expect(Scale.fromString('E♯ Diatonic Major')).toBeInstanceOf(Scale);
      // expect(Scale.fromString('E Diatonic Major')).toBeInstanceOf(Scale);

      expect(Scale.fromString('E Diatonic Major').tonic).toBeInstanceOf(
        PitchClass,
      );
      expect(Scale.fromString('E♯ Diatonic Major').tonic).toBeInstanceOf(
        PitchClass,
      );
      expect(Scale.fromString('E').tonic).toBeInstanceOf(PitchClass);

      expect(Scale.fromString('E Diatonic Major').tonic.name).toBe('E');
      // FIXME:
      // expect(Scale.fromString('E♯ Diatonic Major').tonic.name).toBe('E♯');
      expect(Scale.fromString('E').tonic.name).toBe('E');
    });
  });

  describe('Diatonic Major Scale', () => {
    const scale = ScalePattern.fromString('Diatonic Major');
    describe('at E', () => {
      const eMajor = scale.at('E');

      it('should have a tonic pitch', () => {
        expect(eMajor.tonic!.toString()).toBe('E');
      });

      it('should have seven pitches', () => {
        expect(eMajor.pitches).toHaveLength(7);
        const pitches = eMajor.pitches! as Pitch[];
        const pitchNames = pitches.map((pitch) => pitch.toString());
        expect(pitchNames).toEqual('E F♯ G♯ A B C♯ D♯'.split(/\s/));
      });

      it('should have seven chords', () => {
        const chords = eMajor.chords();
        expect(chords).toHaveLength(7);
      });

      it('should have the correct chord sequence', () => {
        const chords = eMajor.chords();
        expect(chords[0].name).toBe('E Major');
        expect(chords[1].name).toBe('F♯ Minor');
        expect(chords[2].name).toBe('G♯ Minor');
        expect(chords[3].name).toBe('A Major');
        expect(chords[4].name).toBe('B Major');
        expect(chords[5].name).toBe('C♯ Minor');
        expect(chords[6].name).toBe('D♯ Dim');
      });
    });
  });
});

describe('ScaleDegreeNames', () =>
  it.skip('is an array of strings', () => {
    expect(ScaleDegreeNames).toHaveLength(10);
    expect(ScaleDegreeNames[0]).toBe('String');
  }));

// expect(chords).toEqual('E4 F♯4m G4m A'.split(/\s/).map(Chord.fromString))
