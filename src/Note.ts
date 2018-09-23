import { semitonesToAccidentalString } from './internal/accidentals';
import * as PitchClassParser from './internal/pitchClassParser';
import { accidentalsToSemitones } from './internal/pitchClassParser';
import { Interval } from './Interval';
import { PitchClass } from './PitchClass';
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

  public static fromDegree(degree: number, accidentals = 0, octave = 4): Note {
    const d0 = degree - 1;
    const midiNumber = 12 * (octave + 1) + Note.noteSemitones[d0] + accidentals;
    const name =
      'CDEFGAB'[d0] + semitonesToAccidentalString(accidentals) + octave;
    return new Note(midiNumber, name);
  }

  /** Return a note specified in [scientific pitch
   * notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation) or
   * [Helmholtz pitch
   * notation](https://en.wikipedia.org/wiki/Helmholtz_pitch_notation).
   */
  public static fromString(name: string): Note {
    const midiNumber = (name.match(/\d/)
      ? PitchClassParser.fromScientificNotation
      : PitchClassParser.fromHelmholtzNotation)(name);
    return new Note(midiNumber, name);
  }

  // Indexed by name not midiNumber, in order to preserve the distinction
  // between enharmonic equivalents.
  // FIXME: this doesn't allow e.g. scientific C1 and Helmholtz C to be equal.
  private static readonly instances = new Map<string, Note>();

  private static noteSemitones = [0, 2, 4, 5, 7, 9, 11];

  public readonly name: string;
  private constructor(readonly midiNumber: number, name?: string) {
    this.name = name || PitchClassParser.toScientificNotation(midiNumber);
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

  get degree(): number {
    const letter = this.name.slice(0, 1).toUpperCase();
    return 'CDEFGAB'.indexOf(letter) + 1;
  }

  get accidentals(): number {
    const m = this.name.toUpperCase().match(/^([A-G])([#b♯♭𝄪𝄫]*)(-?\d+)/)!;
    return accidentalsToSemitones(m[2]);
  }

  get octave(): number {
    return Math.floor(this.midiNumber / 12) - 1;
  }

  public add(interval: Interval): Note {
    const semitones = this.midiNumber + interval.semitones;
    const d0 = this.degree - 1 + interval.number! - 1;
    if (d0 < 0) {
      return Note.fromMidiNumber(semitones);
    }
    const letter = 'CDEFGAB'[d0 % 7];
    const octave = Math.floor(semitones / 12) - 1;
    const naturalSemitones = 12 * (octave + 1) + Note.noteSemitones[d0 % 7];
    // return [semitones, d0, letter, octave, naturalSemitones];
    const acc = semitonesToAccidentalString(semitones - naturalSemitones);
    return new Note(semitones, `${letter}${acc}${octave}`);
  }

  public asPitch(): Note {
    return this;
  }

  public asPitchClass(): PitchClass {
    return PitchClass.fromSemitones(
      PitchClassParser.fromNumber(this.midiNumber),
    );
  }

  public transposeBy(interval: Interval): Note {
    return new Note(this.midiNumber + interval.semitones);
  }
}
