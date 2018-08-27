import { Intervals, Pitch } from '../src';
import { Chord, ChordClass } from '../src/chord';

const { P1, m3, M3, P5 } = Intervals;

describe('fromString', () => {
  it('should convert from chord class names', () => {
    expect(ChordClass.fromString('Major')).toBeTruthy();
    expect(ChordClass.fromString('Minor')).toBeTruthy();
    expect(ChordClass.fromString('Augmented')).toBeTruthy();
    expect(ChordClass.fromString('Diminished')).toBeTruthy();

    let chordClass = ChordClass.fromString('Major');
    expect(chordClass).toBeInstanceOf(ChordClass);
    expect(chordClass.name).toBe('Major');

    chordClass = ChordClass.fromString('Minor');
    expect(chordClass).toBeInstanceOf(ChordClass);
    expect(chordClass.name).toBe('Minor');
  });

  it('fromString should recognize abbreviations', () => {
    expect(ChordClass.fromString('M')).toBeTruthy();
    expect(ChordClass.fromString('aug')).toBeTruthy();
    expect(ChordClass.fromString('°')).toBeTruthy();
  });
});

describe('fromIntervals', () => {
  it('should find the chord class from an array of semitones', () => {
    let chordClass = ChordClass.fromIntervals([0, 3, 7]);
    expect(chordClass).toBeInstanceOf(ChordClass);
    expect(chordClass.name).toBe('Minor');

    chordClass = ChordClass.fromIntervals([0, 4, 7]);
    expect(chordClass).toBeInstanceOf(ChordClass);
    expect(chordClass.name).toBe('Major');
  });

  it('should find the chord class from an array of intervals', () => {
    let chordClass = ChordClass.fromIntervals([P1, M3, P5]);
    expect(chordClass.name).toBe('Major');

    chordClass = ChordClass.fromIntervals([P1, m3, P5]);
    expect(chordClass.name).toBe('Minor');
  });

  it('should recognize inversions', () => {
    const chordClass = ChordClass.fromIntervals([M3, P1, P5]);
    expect(chordClass.name).toBe('Major');
  });
});

describe('Chord', () => {
  describe('fromString', () => {
    it('should convert from scientific pitch chord names', () => {
      expect(Chord.fromString('E4')).toBeInstanceOf(Chord);
      expect(Chord.fromString('E4Major')).toBeInstanceOf(Chord);
      expect(Chord.fromString('E4 Major')).toBeInstanceOf(Chord);
    });

    it('should recognize Helmoltz pitch names', () => {
      expect(Chord.fromString('E')).toBeInstanceOf(Chord);
      expect(Chord.fromString('EMajor')).toBeInstanceOf(Chord);
      expect(Chord.fromString('E Major')).toBeInstanceOf(Chord);
      expect(Chord.fromString('E Minor')).toBeInstanceOf(Chord);
      expect(Chord.fromString("E'")).toBeInstanceOf(Chord);
      expect(Chord.fromString("E' Major")).toBeInstanceOf(Chord);
      expect(Chord.fromString("E'  Major")).toBeInstanceOf(Chord);
    });
  });

  describe('fromPitches', () =>
    it('should find the chord from an array of pitches', () => {
      const pitches = 'A3 C#4 E4'
        .split(/\s/)
        .map((name) => Pitch.fromString(name));
      const chord = Chord.fromPitches(pitches);
      expect(chord.name).toBe('A3 Major');
    }));
});

describe('Major Chord Class', () => {
  const chordClass = ChordClass.fromString('Major');

  it('should exist', () => expect(chordClass).toBeTruthy());

  it('should have a name', () => {
    expect(chordClass.name).toBe('Major');
  });

  it('should have a fullName', () => {
    expect(chordClass.fullName).toBe('Major');
  });

  it('should have a list of abbreviations', () => {
    expect(chordClass.abbrs).toEqual(['', 'M']);
  });

  it('should have a default abbreviation', () => {
    expect(chordClass.abbr).toBe('');
  });

  it('should contain three intervals', () => {
    expect(chordClass.intervals).toHaveLength(3);
  });

  describe('at E', () => {
    const chord = chordClass.at('E');

    it('should have a root', () => expect(chord.root.toString()).toBe('E'));

    it('should have a name', () => {
      expect(chord.name).toBe('E Major');
    });

    it('should have a fullName', () => {
      expect(chord.fullName).toBe('E Major');
    });

    it('should have an abbreviated name', () => {
      expect(chord.abbr).toBe('E');
    });

    it('should contain three intervals', () => {
      expect(chord.intervals).toHaveLength(3);
    });

    it('should have three pitches', () =>
      expect(chord.pitches).toHaveLength(3));
    // eql [0, 4, 7]

    // it.skip('#invert');
    // it.skip('#fromPitches');
  });

  describe('at C', () => {
    const chord = chordClass.at('C');

    it('should have a name', () => {
      expect(chord.name).toBe('C Major');
    });

    it('should have a fullName', () => {
      expect(chord.fullName).toBe('C Major');
    });
  });

  describe('at E4', () => {
    const chord = chordClass.at('E4');

    it('should have a name', () => {
      expect(chord.name).toBe('E4 Major');
    });

    it('should have an array of pitches', () => {
      expect(chord.pitches).toBeInstanceOf(Array);
      expect(chord.pitches).toHaveLength(3);
      expect(chord.pitches).toEqual(['E4', 'G♯4', 'B4'].map(Pitch.fromString));
    });
  });
});

describe('Minor Chord', () => {
  const chordClass = ChordClass.fromString('Minor');

  describe('at C', () => {
    const chord = chordClass.at('C');

    it('should have a name', () => {
      expect(chord.name).toBe('C Minor');
    });

    it('should have a fullName', () => {
      expect(chord.fullName).toBe('C Minor');
    });
  });
});
