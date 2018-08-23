import { Interval } from './interval';
import { normalizePitchClass, NoteNames, parsePitchClass } from './names';
import { Pitch } from './pitch';

export class PitchClass {
  public static fromSemitones(semitones: number): PitchClass {
    semitones = normalizePitchClass(semitones);
    return new PitchClass(semitones);
  }

  public static fromString(name: string): PitchClass {
    return PitchClass.fromSemitones(parsePitchClass(name));
  }

  public readonly name: string;
  constructor(public readonly semitones: number, name?: string) {
    this.name = name || NoteNames[semitones];
  }

  public toString(): string {
    return this.name;
  }

  public add(other: Interval): PitchClass {
    return PitchClass.fromSemitones(this.semitones + other.semitones);
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
