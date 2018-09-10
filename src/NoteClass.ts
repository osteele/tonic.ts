import { Interval } from './Interval';
import { Note } from './Note';
import * as PitchClassParser from './parsers/pitchClassParser';
import { NoteNames } from './parsers/pitchClassParser';
import { PitchLike } from './PitchLike';

/** `NoteClass` represents a set of notes separated by octaves. For example, the
 * note class "E" represents "E0", "E1", "E2", etc.
 *
 * Note classes are [interned](https://en.wikipedia.org/wiki/String_interning).
 * interned. This enables the use of the ECMAScript
 * [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * to implement sets of note classes.
 */
// TODO: this is currently more like a pitch class than a note class.
// Go all in on being a pitch class; or, add quality.
export class NoteClass implements PitchLike {
  public static fromSemitones(semitones: number): NoteClass {
    semitones = PitchClassParser.normalize(semitones);
    return new NoteClass(semitones);
  }

  public static fromString(name: string): NoteClass {
    return NoteClass.fromSemitones(PitchClassParser.fromString(name));
  }

  private static instances = new Map<string, NoteClass>();

  public readonly name: string;
  private constructor(readonly semitones: number, name?: string) {
    this.name = name || NoteNames[semitones];
    const instance = NoteClass.instances.get(this.name);
    if (instance) {
      return instance;
    }
    NoteClass.instances.set(this.name, this);
  }

  public toString(): string {
    return this.name;
  }

  public add(other: Interval): NoteClass {
    return NoteClass.fromSemitones(this.semitones + other.semitones);
  }

  public transposeBy(other: Interval): NoteClass {
    return this.add(other);
  }

  public asPitch(octave = 0): Note {
    return Note.fromMidiNumber(this.semitones + 12 * octave);
  }

  public asPitchClass() {
    return this;
  }
}
