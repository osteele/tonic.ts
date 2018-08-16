import { Interval } from './interval';
import {
  pitchFromHelmholtzNotation,
  pitchFromScientificNotation,
  pitchToPitchClass,
  pitchToScientificNotation
} from './names';
import { PitchClass } from './pitchClass';

export class Pitch {
  readonly name: string;
  readonly midiNumber: number;
  constructor({ name, midiNumber }: { name?: string; midiNumber: number }) {
    this.name = name || pitchToScientificNotation(midiNumber);
    this.midiNumber = midiNumber;
  }

  toString(): string {
    return this.name;
  }

  add(other: Interval): Pitch {
    return new Pitch({ midiNumber: this.midiNumber + other.semitones });
  }

  toPitch(): Pitch {
    return this;
  }

  toPitchClass(): PitchClass {
    return PitchClass.fromSemitones(pitchToPitchClass(this.midiNumber));
  }

  transposeBy(interval: Interval): Pitch {
    return new Pitch({ midiNumber: this.midiNumber + interval.semitones });
  }

  static fromMidiNumber(midiNumber: number): Pitch {
    return new Pitch({ midiNumber });
  }

  static fromString(name: string): Pitch {
    const midiNumber = (name.match(/\d/)
      ? pitchFromScientificNotation
      : pitchFromHelmholtzNotation)(name);
    return new Pitch({ midiNumber, name });
  }
}

export const Pitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
  pitch => new Pitch({ midiNumber: pitch })
);
