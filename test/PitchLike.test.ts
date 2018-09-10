import { asPitchLike, Note, parsePitchLike, PitchClass } from '../src';

describe('parsePitchLike', () => {
  it('parses note names', () => {
    expect(parsePitchLike('E4')).toBeInstanceOf(Note);
  });

  it('parses note class names', () => {
    expect(parsePitchLike('E')).toBeInstanceOf(PitchClass);
  });

  it('throws exceptions', () => {
    expect(() => expect(parsePitchLike('invalid')).toThrow());
  });
});

describe('asPitchLike', () => {
  it('parses note names', () => {
    expect(asPitchLike('E4')).toBeInstanceOf(Note);
  });

  it('parses note class names', () => {
    expect(asPitchLike('E')).toBeInstanceOf(PitchClass);
  });

  it('throws exceptions', () => {
    expect(() => expect(asPitchLike('invalid')).toThrow());
  });

  it('is idempotent on Note and PitchClass', () => {
    const note = Note.fromString('E4');
    const pitchClass = Note.fromString('E');
    expect(asPitchLike(note)).toBe(note);
    expect(asPitchLike(pitchClass)).toBe(pitchClass);
  });
});
