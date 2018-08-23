import { Pitch } from '../src/pitch';
import { ScaleDegreeNames, Scales } from '../src/scale';

describe('Scales', () => {
  it('should have the right number of scales', () => {
    expect(Scales.size).toBe(17);
  });
  it('should contains various blues and diatonic scales', () => {
    expect(Scales.get('Diatonic Major')).toBeTruthy();
    expect(Scales.get('Natural Minor')).toBeTruthy();
    expect(Scales.get('Major Pentatonic')).toBeTruthy();
    expect(Scales.get('Diatonic Major')).toBeTruthy();
    expect(Scales.get('Minor Pentatonic')).toBeTruthy();
    expect(Scales.get('Melodic Minor')).toBeTruthy();
    expect(Scales.get('Harmonic Minor')).toBeTruthy();
    expect(Scales.get('Blues')).toBeTruthy();
    expect(Scales.get('Freygish')).toBeTruthy();
    expect(Scales.get('Whole Tone')).toBeTruthy();
    expect(Scales.get('Octatonic')).toBeTruthy();
  });
});

// describe('Scale', () => it('#fromString should a scale'));

describe('Diatonic Major Scale', () => {
  const scale = Scales.get('Diatonic Major');

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
