import {
  Pitch,
  PitchClass,
  Scale,
  ScaleDegreeNames,
  SpecificScale,
} from '../src';

describe('ScalePattern', () => {
  it('scales length', () => {
    expect(Array.from(Scale.scales)).toHaveLength(10);
  });

  describe('fromString', () => {
    it('recognizes various blues and diatonic scales', () => {
      expect(Scale.fromString('Diatonic Major')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Natural Minor')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Major Pentatonic')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Diatonic Major')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Minor Pentatonic')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Melodic Minor')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Harmonic Minor')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Blues')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Freygish')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Whole Tone')).toBeInstanceOf(Scale);
      expect(Scale.fromString('Octatonic')).toBeInstanceOf(Scale);
    });

    it('rejects unknown scale names', () => {
      expect(() => Scale.fromString('Unknown')).toThrow();
    });
  });

  describe('Diatonic Major Scale', () => {
    const scale = Scale.fromString('Diatonic Major');

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
      expect(SpecificScale.fromString('E7 Diatonic Major')).toBeInstanceOf(
        SpecificScale,
      );
      expect(SpecificScale.fromString('E♯7 Diatonic Major')).toBeInstanceOf(
        SpecificScale,
      );
      expect(SpecificScale.fromString('E7')).toBeInstanceOf(SpecificScale);

      expect(
        SpecificScale.fromString('E7 Diatonic Major').tonic,
      ).toBeInstanceOf(Pitch);
      expect(
        SpecificScale.fromString('E♯7 Diatonic Major').tonic,
      ).toBeInstanceOf(Pitch);
      expect(SpecificScale.fromString('E7').tonic).toBeInstanceOf(Pitch);

      expect(SpecificScale.fromString('E7 Diatonic Major').tonic.name).toBe(
        'E7',
      );
      expect(SpecificScale.fromString('E♯7 Diatonic Major').tonic.name).toBe(
        'E♯7',
      );
      expect(SpecificScale.fromString('E7').tonic.name).toBe('E7');
    });

    it('parses scales with PitchClass tonics', () => {
      // expect(Scale.fromString('E Diatonic Major')).toBeInstanceOf(Scale);
      // expect(Scale.fromString('E♯ Diatonic Major')).toBeInstanceOf(Scale);
      // expect(Scale.fromString('E Diatonic Major')).toBeInstanceOf(Scale);

      expect(SpecificScale.fromString('E Diatonic Major').tonic).toBeInstanceOf(
        PitchClass,
      );
      expect(
        SpecificScale.fromString('E♯ Diatonic Major').tonic,
      ).toBeInstanceOf(PitchClass);
      expect(SpecificScale.fromString('E').tonic).toBeInstanceOf(PitchClass);

      expect(SpecificScale.fromString('E Diatonic Major').tonic.name).toBe('E');
      // FIXME:
      // expect(Scale.fromString('E♯ Diatonic Major').tonic.name).toBe('E♯');
      expect(SpecificScale.fromString('E').tonic.name).toBe('E');
    });
  });

  describe('Diatonic Major Scale', () => {
    const scale = Scale.fromString('Diatonic Major');
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
