import {
  Interval,
  intervalClassDifference,
  IntervalQuality,
  Intervals,
  Note,
  PitchClass,
} from "../src";

const { P1, m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7, P8 } = Intervals;
const { A1, A2, A3, A4, A5, A6, A7, d2, d3, d4, d5, d6, d7, d8 } = Intervals;
const { Major, Minor, Perfect, Augmented, Diminished } = IntervalQuality;

describe("Intervals", () => {
  it("should have the correct interval numbers", () => {
    expect(P1.number).toBe(1);
    expect(m2.number).toBe(2);
    expect(M2.number).toBe(2);
    expect(m3.number).toBe(3);
    expect(M3.number).toBe(3);
    expect(P4.number).toBe(4);
    expect(TT.number).toBe(null);
    expect(P5.number).toBe(5);
    expect(m6.number).toBe(6);
    expect(M6.number).toBe(6);
    expect(m7.number).toBe(7);
    expect(M7.number).toBe(7);
    expect(P8.number).toBe(8);

    expect(A1.number).toBe(1);
    expect(A2.number).toBe(2);
    expect(A3.number).toBe(3);
    expect(A4.number).toBe(4);
    expect(A5.number).toBe(5);
    expect(A6.number).toBe(6);
    expect(A7.number).toBe(7);
    expect(d2.number).toBe(2);
    expect(d3.number).toBe(3);
    expect(d4.number).toBe(4);
    expect(d5.number).toBe(5);
    expect(d6.number).toBe(6);
    expect(d7.number).toBe(7);
    expect(d8.number).toBe(8);

    // TODO: test complex intervals
  });

  it("should have the correct interval qualities", () => {
    expect(P1.quality).toBe(Perfect);
    expect(m2.quality).toBe(Minor);
    expect(M2.quality).toBe(Major);
    expect(m3.quality).toBe(Minor);
    expect(M3.quality).toBe(Major);
    expect(P4.quality).toBe(Perfect);
    expect(TT.quality).toBe(null);
    expect(P5.quality).toBe(Perfect);
    expect(m6.quality).toBe(Minor);
    expect(M6.quality).toBe(Major);
    expect(m7.quality).toBe(Minor);
    expect(M7.quality).toBe(Major);
    expect(P8.quality).toBe(Perfect);

    expect(A1.quality).toBe(Augmented);
    expect(A2.quality).toBe(Augmented);
    expect(A3.quality).toBe(Augmented);
    expect(A4.quality).toBe(Augmented);
    expect(A5.quality).toBe(Augmented);
    expect(A6.quality).toBe(Augmented);
    expect(A7.quality).toBe(Augmented);
    expect(d2.quality).toBe(Diminished);
    expect(d3.quality).toBe(Diminished);
    expect(d4.quality).toBe(Diminished);
    expect(d5.quality).toBe(Diminished);
    expect(d6.quality).toBe(Diminished);
    expect(d7.quality).toBe(Diminished);
    expect(d8.quality).toBe(Diminished);

    // TODO: test complex intervals
  });
});

describe("Interval", () => {
  describe("names", () => {
    it("should have 13 intervals", () => {
      expect(Interval.names).toHaveLength(13);
    });
    it("should start with P1", () => expect(Interval.names[0]).toBe("P1"));
    it("should end with P8", () => expect(Interval.names[12]).toBe("P8"));
  });

  describe("longNames", () => {
    it("should have 13 intervals", () => {
      expect(Interval.longNames).toHaveLength(13);
    });
    it("should start with Unison", () =>
      expect(Interval.longNames[0]).toBe("Unison"));
    it("should end with Octave", () =>
      expect(Interval.longNames[12]).toBe("Octave"));
  });

  describe("fromNumber", () => {
    it("handles simple intervals", () => {
      expect(Interval.fromNumber(1, Perfect)).toBe(P1);
      expect(Interval.fromNumber(2, Minor)).toBe(m2);
      expect(Interval.fromNumber(2, Major)).toBe(M2);
      expect(Interval.fromNumber(3, Minor)).toBe(m3);
      expect(Interval.fromNumber(3, Major)).toBe(M3);
      expect(Interval.fromNumber(4, Perfect)).toBe(P4);
      expect(Interval.fromNumber(5, Perfect)).toBe(P5);
    });

    it("handles simple intervals", () => {});

    it("rejects non-positive numbers", () => {
      expect(() => Interval.fromNumber(0, Perfect)).toThrow();
      expect(() => Interval.fromNumber(0, Major)).toThrow();
      expect(() => Interval.fromNumber(-1, Perfect)).toThrow();
      expect(() => Interval.fromNumber(-1, Major)).toThrow();
    });

    it("rejects number/quality mismatches", () => {
      expect(() => Interval.fromNumber(1, Major)).toThrow();
      expect(() => Interval.fromNumber(1, Minor)).toThrow();
      expect(() => Interval.fromNumber(2, Perfect)).toThrow();
      expect(() => Interval.fromNumber(3, Perfect)).toThrow();
      expect(() => Interval.fromNumber(4, Minor)).toThrow();
      expect(() => Interval.fromNumber(5, Minor)).toThrow();
      expect(() => Interval.fromNumber(6, Perfect)).toThrow();
    });
  });

  describe("fromString", () => {
    it("should handle diatonic intervals", () => {
      expect(Interval.fromString("P1")).toBe(P1);
      expect(Interval.fromString("m2")).toBe(m2);
      expect(Interval.fromString("M2")).toBe(M2);
      expect(Interval.fromString("m3")).toBe(m3);
      expect(Interval.fromString("M3")).toBe(M3);
      expect(Interval.fromString("P4")).toBe(P4);
      expect(Interval.fromString("TT")).toBe(TT);
      expect(Interval.fromString("P5")).toBe(P5);
      expect(Interval.fromString("m6")).toBe(m6);
      expect(Interval.fromString("M6")).toBe(M6);
      expect(Interval.fromString("m7")).toBe(m7);
      expect(Interval.fromString("M7")).toBe(M7);
      expect(Interval.fromString("P8")).toBe(P8);
    });

    it("should handle augmented and diminished intervals", () => {
      expect(Interval.fromString("A1")).toBe(A1);
      expect(Interval.fromString("A2")).toBe(A2);
      expect(Interval.fromString("A3")).toBe(A3);
      expect(Interval.fromString("A4")).toBe(A4);
      expect(Interval.fromString("A5")).toBe(A5);
      expect(Interval.fromString("A6")).toBe(A6);
      expect(Interval.fromString("A7")).toBe(A7);
      expect(Interval.fromString("d2")).toBe(d2);
      expect(Interval.fromString("d3")).toBe(d3);
      expect(Interval.fromString("d4")).toBe(d4);
      expect(Interval.fromString("d5")).toBe(d5);
      expect(Interval.fromString("d6")).toBe(d6);
      expect(Interval.fromString("d7")).toBe(d7);
      expect(Interval.fromString("d8")).toBe(d8);
    });

    it("should handle long interval names", () => {
      expect(Interval.fromString("Unison")).toBe(P1);
      expect(Interval.fromString("Minor 2nd")).toBe(m2);
      expect(Interval.fromString("Tritone")).toBe(TT);
      expect(Interval.fromString("Perfect 5th")).toBe(P5);
      expect(Interval.fromString("Octave")).toBe(P8);
    });

    it("should reject invalid number/quality combinations", () => {
      expect(() => Interval.fromString("M1")).toThrow();
      expect(() => Interval.fromString("m1")).toThrow();
      expect(() => Interval.fromString("P2")).toThrow();
      expect(() => Interval.fromString("m4")).toThrow();
      expect(() => Interval.fromString("M5")).toThrow();
      expect(() => Interval.fromString("M8")).toThrow();
      expect(() => Interval.fromString("P9")).toThrow();
      expect(() => Interval.fromString("P10")).toThrow();
      expect(() => Interval.fromString("m11")).toThrow();
      expect(() => Interval.fromString("M12")).toThrow();
    });

    // TODO: semitone, half tone, half step
    // TODO: tone, whole tone, whole step
  });

  it("name", () => {
    expect(Intervals.P1.name).toBe("P1");
    expect(Intervals.m2.name).toBe("m2");
    expect(Intervals.M2.name).toBe("M2");
    expect(Intervals.d2.name).toBe("d2");
    expect(Intervals.A2.name).toBe("A2");
    expect(Intervals.TT.name).toBe("TT");
    expect(Intervals.P8.name).toBe("P8");
    expect(Intervals.m10.name).toBe("m10");
    expect(Intervals.M13.name).toBe("M13");
    expect(Interval.fromSemitones(6).name).toBe("TT");
    expect(Interval.fromSemitones(12).name).toBe("P8");
    expect(Interval.fromSemitones(18).name).toBe("P8+TT");
    expect(Interval.fromSemitones(30).name).toBe("P8+P8+TT");
  });

  it("number", () => {
    expect(Intervals.P1.number).toBe(1);
    expect(Intervals.m2.number).toBe(2);
    expect(Intervals.M2.number).toBe(2);
    expect(Intervals.d2.number).toBe(2);
    expect(Intervals.A2.number).toBe(2);
    expect(Intervals.TT.number).toBe(null);
    expect(Intervals.P8.number).toBe(8);
    expect(Intervals.m9.number).toBe(9);
    expect(Intervals.M9.number).toBe(9);
    expect(Intervals.M10.number).toBe(10);
    expect(Intervals.P11.number).toBe(11);
    expect(Intervals.P12.number).toBe(12);
    expect(Intervals.M13.number).toBe(13);
    expect(Intervals.M14.number).toBe(14);
    expect(Intervals.P15.number).toBe(15);
  });

  it("quality", () => {
    expect(Intervals.P1.quality).toBe(IntervalQuality.Perfect);
    expect(Intervals.m2.quality).toBe(IntervalQuality.Minor);
    expect(Intervals.M2.quality).toBe(IntervalQuality.Major);
    expect(Intervals.d2.quality).toBe(IntervalQuality.Diminished);
    expect(Intervals.A2.quality).toBe(IntervalQuality.Augmented);
    expect(Intervals.TT.quality).toBe(null);
  });

  it("semitones", () => {
    // toString tests simple intervals
    expect(Intervals.m9.semitones).toBe(13);
    expect(Intervals.M9.semitones).toBe(14);
    expect(Intervals.m10.semitones).toBe(15);
    expect(Intervals.M10.semitones).toBe(16);
    expect(Intervals.P11.semitones).toBe(17);
    expect(Intervals.P12.semitones).toBe(19);
    expect(Intervals.m13.semitones).toBe(20);
    expect(Intervals.M13.semitones).toBe(21);
    expect(Intervals.m14.semitones).toBe(22);
    expect(Intervals.M14.semitones).toBe(23);
    expect(Intervals.P15.semitones).toBe(24);

    expect(Intervals.d9.semitones).toBe(12);
    expect(Intervals.A8.semitones).toBe(13);
    expect(Intervals.d10.semitones).toBe(14);
    expect(Intervals.A9.semitones).toBe(15);
    expect(Intervals.d11.semitones).toBe(16);
    expect(Intervals.A10.semitones).toBe(17);
    expect(Intervals.d12.semitones).toBe(18);
    expect(Intervals.A11.semitones).toBe(18);
  });

  it("simple & complex", () => {
    expect(Intervals.P5.isSimple).toBe(true);
    expect(Intervals.P8.isSimple).toBe(true);
    expect(Intervals.A8.isSimple).toBe(true);
    expect(Intervals.d9.isSimple).toBe(false);
    expect(Intervals.m9.isSimple).toBe(false);
    expect(Intervals.P15.isSimple).toBe(false);

    expect(Intervals.P5.isComplex).toBe(false);
    expect(Intervals.P8.isComplex).toBe(false);
    expect(Intervals.A8.isComplex).toBe(false);
    expect(Intervals.d9.isComplex).toBe(true);
    expect(Intervals.m9.isComplex).toBe(true);
    expect(Intervals.P15.isComplex).toBe(true);
  });

  it("toString", () => {
    expect(Interval.fromSemitones(0).toString()).toBe("P1");
    expect(Interval.fromSemitones(1).toString()).toBe("m2");
    expect(Interval.fromSemitones(4).toString()).toBe("M3");
    expect(Interval.fromSemitones(12).toString()).toBe("P8");
    expect(Intervals.d3.toString()).toBe("d3");
    expect(Intervals.A3.toString()).toBe("A3");
  });

  it("should be interned", () => {
    expect(Interval.fromString("P1")).toBe(Intervals.P1);
    expect(Interval.fromString("M2")).toBe(Intervals.M2);
    expect(Interval.fromString("P1")).not.toBe(Intervals.M2);
  });

  describe("add", () => {
    it("should add two intervals", () => {
      expect(m2.add(m2)).toBe(d3);
      expect(m2.add(M2)).toBe(M3);
      expect(M2.add(m2)).toBe(M3);
      expect(M2.add(M2)).toBe(A3);

      expect(m3.add(m3)).toBe(d5);
      expect(m3.add(M3)).toBe(P5);
      expect(M3.add(m3)).toBe(P5);
      expect(M3.add(M3)).toBe(A5);
    });
  });

  describe("between", () => {
    // tslint:disable:variable-name
    const C4 = Note.fromString("C4");
    const Csh4 = Note.fromString("C♯4");
    const D4 = Note.fromString("D4");
    const Df4 = Note.fromString("D♭4");
    const E4 = Note.fromString("E4");
    const Ef4 = Note.fromString("E♭4");
    const F4 = Note.fromString("F4");
    const Ff4 = Note.fromString("F♭4");
    const G4 = Note.fromString("G4");
    const Gsh4 = Note.fromString("G♯4");
    const An4 = Note.fromString("A4");
    const B4 = Note.fromString("B4");
    const C5 = Note.fromString("C5");
    // tslint:enable:variable-name

    it("should return the interval between two notes", () => {
      expect(Interval.between(C4, C4)).toBe(P1);
      expect(Interval.between(C4, Csh4)).toBe(A1);
      expect(Interval.between(C4, D4)).toBe(M2);
      expect(Interval.between(C4, Df4)).toBe(m2);
      expect(Interval.between(C4, Ef4)).toBe(m3);
      expect(Interval.between(C4, E4)).toBe(M3);
      expect(Interval.between(C4, Ff4)).toBe(d4);
      expect(Interval.between(C4, F4)).toBe(P4);
      expect(Interval.between(C4, G4)).toBe(P5);
      expect(Interval.between(C4, An4)).toBe(M6);
      expect(Interval.between(C4, B4)).toBe(M7);
      expect(Interval.between(C4, C5)).toBe(P8);

      expect(Interval.between(E4, E4)).toBe(P1);
      expect(Interval.between(E4, F4)).toBe(m2);
      expect(Interval.between(E4, G4)).toBe(m3);
      expect(Interval.between(E4, Gsh4)).toBe(M3);
    });

    // TODO: test for reversed intervals

    it("should return the interval between two pitch numbers", () => {
      expect(Interval.between(E4.midiNumber, F4.midiNumber)).toBe(m2);
    });

    it("should return the interval between two pitch classes", () => {
      const E = PitchClass.fromString("E");
      const F = PitchClass.fromString("F");
      const G = PitchClass.fromString("G");
      const GA = PitchClass.fromString("G#");
      expect(Interval.between(E, E)).toBe(P1);
      expect(Interval.between(E, F)).toBe(m2);
      expect(Interval.between(E, G)).toBe(m3);
      expect(Interval.between(E, GA)).toBe(M3);
    });

    it("should find the shortest distance between notes or pitches", () => {
      expect(Interval.between(F4, C4)).toBe(P4);
      expect(Interval.between(F4.midiNumber, C4.midiNumber)).toBe(P4);
    });

    it("should use modular arithmetic on pitch classes", () => {
      expect(Interval.between(F4.asPitchClass(), C4.asPitchClass())).toBe(P5);
    });

    it("should return compound intervals", () => {
      const C4 = Note.fromString("C4");
      const D5 = Note.fromString("D5");
      const D6 = Note.fromString("D6");
      expect(Interval.between(C4, D5)).toBe(Intervals.M9);
      expect(Interval.between(C4, D6)).toBe(Interval.fromString("M16"));

      expect(Interval.between(D5, C4)).toBe(Intervals.M9);
      expect(Interval.between(D6, C4)).toBe(Interval.fromString("M16"));
    });

    it("should preserve the quality", () => {
      const A3 = Interval.fromString("A3");
      expect(Interval.between(C4, Note.fromString("E4"))).toBe(M3);
      expect(Interval.between(C4, Note.fromString("Eb4"))).toBe(m3);
      expect(Interval.between(C4, Note.fromString("E♯4"))).toBe(A3);
    });
  });

  it("inverse", () => {
    expect(P1.inverse).toBe(P8);
    expect(m2.inverse).toBe(M7);
    expect(M3.inverse).toBe(m6);
    expect(m3.inverse).toBe(M6);
    expect(P4.inverse).toBe(P5);
    expect(TT.inverse).toBe(TT);
    expect(d2.inverse).toBe(A7);
  });

  it("augment", () => {
    expect(d3.augment).toBe(m3);
    // expect(m3.augment).toBe(M3); // FIXME
    expect(M3.augment).toBe(A3);

    expect(d5.augment).toBe(P5);
    expect(P5.augment).toBe(A5);
  });

  it("diminish", () => {
    expect(m3.diminish).toBe(d3);
    // expect(M3.diminish).toBe(m3); // FIXME
    expect(A3.diminish).toBe(M3);

    expect(P5.diminish).toBe(d5);
    expect(A5.diminish).toBe(P5);
  });

  it("natural", () => {
    expect(m3.natural).toBe(m3);
    expect(M3.natural).toBe(M3);
    // expect(d3.natural).toBe(M3); // FIXME
    expect(A3.natural).toBe(M3);
  });

  it("compound interval", () => {
    expect(Interval.fromString("m9").semitones).toBe(13);
    expect(Interval.fromString("M9").semitones).toBe(14);
    expect(Interval.fromString("m10").semitones).toBe(15);
    expect(Interval.fromString("M10").semitones).toBe(16);
    expect(Interval.fromString("P11").semitones).toBe(17);
    expect(Interval.fromString("P12").semitones).toBe(19);
    expect(Interval.fromString("m13").semitones).toBe(20);
    expect(Interval.fromString("M13").semitones).toBe(21);
    expect(Interval.fromString("m14").semitones).toBe(22);
    expect(Interval.fromString("M14").semitones).toBe(23);
    expect(Interval.fromString("P15").semitones).toBe(24);

    expect(Interval.fromString("M9").name).toBe("M9");
    expect(Interval.fromString("m9").name).toBe("m9");
    expect(Interval.fromString("A9").name).toBe("A9");
    expect(Interval.fromString("d9").name).toBe("d9");

    expect(Interval.fromString("M9").number).toBe(9);
    expect(Interval.fromString("m9").number).toBe(9);
    expect(Interval.fromString("A9").number).toBe(9);
    expect(Interval.fromString("d9").number).toBe(9);

    expect(Interval.fromString("M9").quality).toBe(IntervalQuality.Major);
    expect(Interval.fromString("m9").quality).toBe(IntervalQuality.Minor);
    expect(Interval.fromString("A9").quality).toBe(IntervalQuality.Augmented);
    expect(Interval.fromString("d9").quality).toBe(IntervalQuality.Diminished);
  });
});

describe("intervalClassDifference", () =>
  it("should return an integer in [0...12]", () => {
    expect(intervalClassDifference(0, 5)).toBe(5);
    expect(intervalClassDifference(5, 0)).toBe(7);
    expect(intervalClassDifference(0, 12)).toBe(0);
  }));
