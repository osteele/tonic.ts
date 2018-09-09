import { Interval } from './Interval';
import { normalizePitchClass, NoteNames, parsePitchClass } from './notation';
import { Pitch } from './Pitch';
import { PitchLike } from './PitchLike';

/** `PitchClass` represents a pitch class: a musical pitch modulo its octave. For
 * example, the pitch class "E" represents "E0", "E1", "E2", etc.
 */
export class PitchClass implements PitchLike {
  public static fromSemitones(semitones: number): PitchClass {
    semitones = normalizePitchClass(semitones);
    return new PitchClass(semitones);
  }

  public static fromString(name: string): PitchClass {
    return PitchClass.fromSemitones(parsePitchClass(name));
  }

  private static instances = new Map<string, PitchClass>();

  public readonly name: string;
  constructor(readonly semitones: number, name?: string) {
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

  // enharmonicizeTo: (scale) ->
  //   for name, semitones in scale.noteNames()
  //     return new PitchClass {name, semitones} if semitones == @semitones
  //   return this

  public asPitch(octave = 0): Pitch {
    return Pitch.fromMidiNumber(this.semitones + 12 * octave);
  }

  public asPitchClass() {
    return this;
  }
}
