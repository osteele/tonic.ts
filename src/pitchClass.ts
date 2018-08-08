import { Interval } from './interval';
import { normalizePitchClass, NoteNames, parsePitchClass } from './names';
import { Pitch } from './pitch';

export class PitchClass {
  name: string;
  semitones: number;
  constructor({ semitones, name }: { name?: string; semitones: number }) {
    this.semitones = semitones;
    this.name = name || NoteNames[semitones];
  }

  toString(): string {
    return this.name;
  }

  add(other: Interval): PitchClass {
    return PitchClass.fromSemitones(this.semitones + other.semitones);
  }

  // enharmonicizeTo: (scale) ->
  //   for name, semitones in scale.noteNames()
  //     return new PitchClass {name, semitones} if semitones == @semitones
  //   return this

  toPitch(octave = 0): Pitch {
    return Pitch.fromMidiNumber(this.semitones + 12 * octave);
  }

  toPitchClass() {
    return this;
  }

  static fromSemitones(semitones: number): PitchClass {
    semitones = normalizePitchClass(semitones);
    return new PitchClass({ semitones });
  }

  static fromString(name: string): PitchClass {
    return PitchClass.fromSemitones(parsePitchClass(name));
  }
}
