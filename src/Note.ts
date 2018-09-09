import { Interval } from './Interval';
import {
  pitchFromHelmholtzNotation,
  pitchFromScientificNotation,
  pitchToPitchClass,
  pitchToScientificNotation,
} from './notation';
import { NoteClass } from './NoteClass';
import { PitchLike } from './PitchLike';

/** A `Note` is a named pitch such as "E4" and "F♯5".
 *
 * See [note](https://en.wikipedia.org/wiki/Musical_note). Instances of `Pitch`
 * represent only the name of the note (this is one sense of "note"), not the
 * duration (which is included by another).
 *
 * Notes are [interned](https://en.wikipedia.org/wiki/String_interning). This
 * enables the use of the ECMAScript
 * [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * to implement sets of notes.
 */
export class Note implements PitchLike {
  public static fromMidiNumber(midiNumber: number): Note {
    return new Note(midiNumber);
  }

  /** Return a note specified in [scientific pitch
   * notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation) or
   * [Helmholtz pitch
   * notation](https://en.wikipedia.org/wiki/Helmholtz_pitch_notation).
   */
  public static fromString(name: string): Note {
    const midiNumber = (name.match(/\d/)
      ? pitchFromScientificNotation
      : pitchFromHelmholtzNotation)(name);
    return new Note(midiNumber, name);
  }

  // Indexed by name not midiNumber, in order to preserve the distinction
  // between enharmonic equivalents.
  // FIXME: this doesn't allow e.g. scientific C1 and Helmholtz C to be equal.
  private static instances = new Map<string, Note>();

  public readonly name: string;
  constructor(readonly midiNumber: number, name?: string) {
    this.name = name || pitchToScientificNotation(midiNumber);
    const instance = Note.instances.get(this.name);
    if (instance) {
      return instance;
    }
    Note.instances.set(this.name, this);
  }

  // FIXME: this returns the Helmholtz notation if this was created by parsing
  // such.
  public toString(): string {
    return this.name;
  }

  public add(other: Interval): Note {
    return new Note(this.midiNumber + other.semitones);
  }

  public asPitch(): Note {
    return this;
  }

  public asPitchClass(): NoteClass {
    return NoteClass.fromSemitones(pitchToPitchClass(this.midiNumber));
  }

  public transposeBy(interval: Interval): Note {
    return new Note(this.midiNumber + interval.semitones);
  }
}

// tslint:disable-next-line variable-name
export const Notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
  (pitch) => new Note(pitch),
);
