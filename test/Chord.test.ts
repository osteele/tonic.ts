import {
  Chord,
  ChordQuality,
  Interval,
  Intervals,
  Note,
  PitchClass,
} from '../src';

const { P1, m3, M3, P5, m7, M7 } = Intervals;
const M9 = Interval.fromString('M9');

describe('ChordQuality', () => {
  describe('fromString', () => {
    it('should convert from chord class names', () => {
      expect(ChordQuality.fromString('Major')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('Minor')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('Augmented')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('Diminished')).toBeInstanceOf(
        ChordQuality,
      );
    });

    it('should recognize abbreviations', () => {
      expect(ChordQuality.fromString('M')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('aug')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('°')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('maj7')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('min7')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('M7')).toBeInstanceOf(ChordQuality);
      expect(ChordQuality.fromString('m7')).toBeInstanceOf(ChordQuality);
    });
  });

  it('name', () => {
    expect(ChordQuality.fromString('Major').name).toBe('Major');
    expect(ChordQuality.fromString('Minor').name).toBe('Minor');
  });

  it('intervals', () => {
    expect(ChordQuality.fromString('Major').intervals).toEqual([P1, M3, P5]);
    expect(ChordQuality.fromString('Minor').intervals).toEqual([P1, m3, P5]);
    expect(ChordQuality.fromString('M7').intervals).toEqual([P1, M3, P5, M7]);
    expect(ChordQuality.fromString('m7').intervals).toEqual([P1, m3, P5, m7]);
    expect(ChordQuality.fromString('M9').intervals).toEqual([
      P1,
      M3,
      P5,
      M7,
      M9,
    ]);
    expect(ChordQuality.fromString('m9').intervals).toEqual([
      P1,
      m3,
      P5,
      m7,
      M9,
    ]);
  });
});

describe('fromIntervals', () => {
  it('should find the chord class from an array of semitones', () => {
    let chordClass = ChordQuality.fromIntervals([0, 3, 7]);
    expect(chordClass).toBeInstanceOf(ChordQuality);
    expect(chordClass.name).toBe('Minor');

    chordClass = ChordQuality.fromIntervals([0, 4, 7]);
    expect(chordClass).toBeInstanceOf(ChordQuality);
    expect(chordClass.name).toBe('Major');
  });

  it('should find the chord class from an array of intervals', () => {
    let chordClass = ChordQuality.fromIntervals([P1, M3, P5]);
    expect(chordClass.name).toBe('Major');

    chordClass = ChordQuality.fromIntervals([P1, m3, P5]);
    expect(chordClass.name).toBe('Minor');
  });

  it('should recognize inversions', () => {
    const root = ChordQuality.fromIntervals([P1, M3, P5]);
    expect(root.inversion).toBe(null);

    const first = ChordQuality.fromIntervals([M3, P1, P5]);
    expect(first.name).toBe('Major');
    expect(first.inversion).toBe(1);

    const second = ChordQuality.fromIntervals([P5, P1, M3]);
    expect(second.name).toBe('Major');
    expect(second.inversion).toBe(2);
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

  describe('fromPitches', () => {
    it('should find the chord from an array of pitch classes', () => {
      const pitches = ['A', 'C#', 'E'].map(PitchClass.fromString);
      const chord = Chord.fromPitches(pitches);
      expect(chord.name).toBe('A Major');
    });

    it('should find the chord from an array of pitches', () => {
      const pitches = ['A3', 'C♯4', 'E4'].map(Note.fromString);
      const chord = Chord.fromPitches(pitches);
      expect(chord.name).toBe('A3 Major');
    });

    it.skip('should recognize inversions', () => {
      const pitches = ['C♯', 'A', 'E'].map(PitchClass.fromString);
      const chord = Chord.fromPitches(pitches);
      expect(chord.name).toBe('A Major');
      expect(chord.inversion).toBe('a');
    });
  });

  describe('intervals', () => {
    expect(Chord.fromString('E').intervals).toEqual([P1, M3, P5]);
    expect(Chord.fromString('Em').intervals).toEqual([P1, m3, P5]);
    expect(Chord.fromString('E7').intervals).toEqual([P1, M3, P5, m7]);
  });
});

describe('Major Chord Class', () => {
  const chordClass = ChordQuality.fromString('Major');

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

    it('should have three notes', () => {
      expect(chord.notes).toHaveLength(3);
      expect(chord.notes).toEqual(['E', 'G#', 'B'].map(PitchClass.fromString));
    });

    it('invert', () => {
      expect(chord.inversion).toBe(0);
      // TODO: expect(chord.root).toBe

      const first = chord.invert('a');
      expect(first.inversion).toBe(1);
      // TODO: expect(chord.root).toBe
      // TODO: expect(first.shortName).toBe('Ea');
      expect(first.notes).toEqual(['G#', 'B', 'E'].map(PitchClass.fromString));

      const second = chord.invert('c');
      expect(second.inversion).toBe(2);
      expect(first.notes).toEqual(['G#', 'B', 'E'].map(PitchClass.fromString));

      // TODO: needs a 7th
      // const third = chord.invert('d');
      // expect(third.inversion).toBe(3);
    });
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
      expect(chord.notes).toBeInstanceOf(Array);
      expect(chord.notes).toHaveLength(3);
      expect(chord.notes).toEqual(['E4', 'G♯4', 'B4'].map(Note.fromString));
    });
  });
});

describe('Minor Chord', () => {
  const chordClass = ChordQuality.fromString('Minor');

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
