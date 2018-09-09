import { Interval } from './Interval';
import {
  pitchFromHelmholtzNotation,
  pitchFromScientificNotation,
  pitchToPitchClass,
  pitchToScientificNotation,
} from './notation';
import { PitchClass } from './PitchClass';
import { PitchLike } from './PitchLike';

/** A `Pitch` is a named pitch such as "E4" and "F♯5".
 *
 * See [note](https://en.wikipedia.org/wiki/Musical_note). Instances of `Pitch`
 * represent only the name of the pitch (this is one sense of "note"), not the
 * duration (which is included by another).
 *
 * Pitches are [interned](https://en.wikipedia.org/wiki/String_interning). This
 * enables the use of the ECMAScript
 * [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * to implement pitch sets.
 */
export class Pitch implements PitchLike {
  public static fromMidiNumber(midiNumber: number): Pitch {
    return new Pitch(midiNumber);
  }

  /** Return a note specified in [scientific pitch
   * notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation) or
   * [Helmholtz pitch
   * notation](https://en.wikipedia.org/wiki/Helmholtz_pitch_notation).
   */
  public static fromString(name: string): Pitch {
    const midiNumber = (name.match(/\d/)
      ? pitchFromScientificNotation
      : pitchFromHelmholtzNotation)(name);
    return new Pitch(midiNumber, name);
  }

  // Indexed by name not midiNumber, in order to preserve the distinction
  // between enharmonic equivalents.
  // FIXME: this doesn't allow e.g. scientific C1 and Helmholtz C to be equal.
  private static instances = new Map<string, Pitch>();

  public readonly name: string;
  constructor(readonly midiNumber: number, name?: string) {
    this.name = name || pitchToScientificNotation(midiNumber);
    const instance = Pitch.instances.get(this.name);
    if (instance) {
      return instance;
    }
    Pitch.instances.set(this.name, this);
  }

  // FIXME: this returns the Helmholtz notation if this was created by parsing
  // such.
  public toString(): string {
    return this.name;
  }

  public add(other: Interval): Pitch {
    return new Pitch(this.midiNumber + other.semitones);
  }

  public asPitch(): Pitch {
    return this;
  }

  public asPitchClass(): PitchClass {
    return PitchClass.fromSemitones(pitchToPitchClass(this.midiNumber));
  }

  public transposeBy(interval: Interval): Pitch {
    return new Pitch(this.midiNumber + interval.semitones);
  }
}

// tslint:disable-next-line variable-name
export const Pitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
  (pitch) => new Pitch(pitch),
);
