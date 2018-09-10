import * as _ from 'lodash';
import { Interval } from './Interval';
import { Note } from './Note';
import * as PitchClassParser from './parsers/pitchClassParser';
import { NoteNames } from './parsers/pitchClassParser';
import { PitchLike } from './PitchLike';

/** A pitch class represents a set of pitches separated by octaves. For example,
 * the pitch class "E" represents "E0", "E1", "E2", etc.
 *
 * Pitch classes are [interned](https://en.wikipedia.org/wiki/String_interning).
 * interned. This enables the use of the ECMAScript
 * [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * to implement sets of note classes.
 *
 * See Wikipedia [pitch class](https://en.wikipedia.org/wiki/Pitch_class).
 */
export class PitchClass implements PitchLike {
  public static fromMidiNumber(midiNumber: number): PitchClass {
    return this.fromSemitones(midiNumber);
  }

  public static fromSemitones(semitones: number): PitchClass {
    semitones = PitchClassParser.normalize(semitones);
    return new PitchClass(semitones);
  }

  public static fromString(name: string): PitchClass {
    return PitchClass.fromSemitones(PitchClassParser.fromString(name));
  }

  private static readonly instances = new Map<string, PitchClass>();

  // tslint:disable-next-line:member-ordering
  public static readonly all: ReadonlyArray<PitchClass> = _.times(12).map(
    (pitch) => PitchClass.fromSemitones(pitch),
  );

  public readonly name: string;
  private constructor(readonly semitones: number, name?: string) {
    this.name = name || NoteNames[semitones];
    const instance = PitchClass.instances.get(this.name);
    if (instance) {
      return instance;
    }
    PitchClass.instances.set(this.name, this);
  }

  public toString(): string {
    return this.name;
  }

  public add(other: Interval): PitchClass {
    return PitchClass.fromSemitones(this.semitones + other.semitones);
  }

  public transposeBy(other: Interval): PitchClass {
    return this.add(other);
  }

  public asPitch(octave = 0): Note {
    return Note.fromMidiNumber(this.semitones + 12 * octave);
  }

  public asPitchClass() {
    return this;
  }
}
