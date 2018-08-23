import { Pitch, Scale, ScaleDegreeNames } from '../src';
// import { ScaleDegreeNames } from '../src/scale';

describe('Scales', () => {
  it('should have the right number of scales', () => {
    expect(Array.from(Scale.scales)).toHaveLength(17);
  });
  it('should contains various blues and diatonic scales', () => {
    expect(Scale.fromString('Diatonic Major')).toBeTruthy();
    expect(Scale.fromString('Natural Minor')).toBeTruthy();
    expect(Scale.fromString('Major Pentatonic')).toBeTruthy();
    expect(Scale.fromString('Diatonic Major')).toBeTruthy();
    expect(Scale.fromString('Minor Pentatonic')).toBeTruthy();
    expect(Scale.fromString('Melodic Minor')).toBeTruthy();
    expect(Scale.fromString('Harmonic Minor')).toBeTruthy();
    expect(Scale.fromString('Blues')).toBeTruthy();
    expect(Scale.fromString('Freygish')).toBeTruthy();
    expect(Scale.fromString('Whole Tone')).toBeTruthy();
    expect(Scale.fromString('Octatonic')).toBeTruthy();
  });
});

// describe('Scale', () => it('#fromString should a scale'));

describe('Diatonic Major Scale', () => {
  const scale = Scale.fromString('Diatonic Major');

  it('should exist', () => expect(scale).toBeTruthy());

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

  describe('at E', () => {
    const eMajor = scale.at('E');
    const chords = eMajor.chords();

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
      expect(chords).toHaveLength(7);
    });

    it('should have the correct chord sequence', () => {
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

describe('ScaleDegreeNames', () =>
  it.skip('is an array of strings', () => {
    expect(ScaleDegreeNames).toHaveLength(10);
    expect(ScaleDegreeNames[0]).toBe('String');
  }));

// expect(chords).toEqual('E4 F♯4m G4m A'.split(/\s/).map(Chord.fromString))
