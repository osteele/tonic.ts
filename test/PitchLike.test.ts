import { asPitchLike, Note, NoteClass, parsePitchLike } from '../src';

describe('parsePitchLike', () => {
  it('parses note names', () => {
    expect(parsePitchLike('E4')).toBeInstanceOf(Note);
  });

  it('parses note class names', () => {
    expect(parsePitchLike('E')).toBeInstanceOf(NoteClass);
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
    expect(asPitchLike('E')).toBeInstanceOf(NoteClass);
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
