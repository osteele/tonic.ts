import { Pitch, PitchClass } from '../src';
import { asPitchLike, parsePitchLike } from '../src/pitchLike';

describe('parsePitchLike', () => {
  it('parses pitches', () => {
    expect(parsePitchLike('E4')).toBeInstanceOf(Pitch);
  });
  it('parses pitch classes', () => {
    expect(parsePitchLike('E')).toBeInstanceOf(PitchClass);
  });
  it('throws exceptions', () => {
    expect(() => expect(parsePitchLike('invalid')).toThrow());
  });
});

describe('asPitchLike', () => {
  it('parses pitches', () => {
    expect(asPitchLike('E4')).toBeInstanceOf(Pitch);
  });
  it('parses pitch classes', () => {
    expect(asPitchLike('E')).toBeInstanceOf(PitchClass);
  });
  it('throws exceptions', () => {
    expect(() => expect(asPitchLike('invalid')).toThrow());
  });
  it('is idempotent on Pitch and PitchClass', () => {
    const pitch = Pitch.fromString('E4');
    const pitchClass = Pitch.fromString('E');
    expect(asPitchLike(pitch)).toBe(pitch);
    expect(asPitchLike(pitchClass)).toBe(pitchClass);
  });
});
