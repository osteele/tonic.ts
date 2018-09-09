import { Interval } from './Interval';
import { Note } from './Note';
import { NoteNames, PitchClass } from './PitchClass';
import { PitchLike } from './PitchLike';

/** `NoteClass` represents a set of notes separated by octaves. For example, the
 * note class "E" represents "E0", "E1", "E2", etc.
 *
 * Note classes are [interned](https://en.wikipedia.org/wiki/String_interning).
 * interned. This enables the use of the ECMAScript
 * [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * to implement sets of note classes.
 */
export class NoteClass implements PitchLike {
  public static fromSemitones(semitones: number): NoteClass {
    semitones = PitchClass.normalize(semitones);
    return new NoteClass(semitones);
  }

  public static fromString(name: string): NoteClass {
    return NoteClass.fromSemitones(PitchClass.fromString(name));
  }

  private static instances = new Map<string, NoteClass>();

  public readonly name: string;
  constructor(readonly semitones: number, name?: string) {
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

  // enharmonicizeTo: (scale) ->
  //   for name, semitones in scale.noteNames()
  //     return new PitchClass {name, semitones} if semitones == @semitones
  //   return this

  public asPitch(octave = 0): Note {
    return Note.fromMidiNumber(this.semitones + 12 * octave);
  }

  public asPitchClass() {
    return this;
  }
}
