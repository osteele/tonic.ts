import * as _ from 'lodash';
import { Chord } from './Chord';
import { FrettedInstrument, Instruments, StringFret } from './Instrument';
import { Interval, Intervals } from './Interval';
import { Pitch } from './Pitch';
import { PitchLike } from './PitchLike';

/** Also known as “guitar chords”; but generalized to fretted instruments.
 *
 * See [guitar chord](https://en.wikipedia.org/wiki/Guitar_chord).
 */
export class FrettedChord {
  /** Create a FrettedChord from an ASCII chord description, e.g. 'x02440'.
   *
   * For all valid ASCII chord descriptions `desc`,
   * `FrettedChord.fromAscii(desc).ascii === desc`.
   *
   * For all FrettedChords `chord` with no barres,
   * `assert.deepStrictEqual(FrettedCord.fromAscii(chord.ascii), chord)`.
   */
  public static fromAscii(
    ascii: string,
    instrument = Instruments.Guitar,
  ): FrettedChord {
    // Parse the string into stringFrets or (for 'x') null.
    // TODO: recognize 'xxx9(10)9' notation.
    const stringFrets: StringFret[] = _.map(
      ascii,
      (fretNumber, stringNumber) =>
        fretNumber.match(/^\d+$/) && {
          fretNumber: Number(fretNumber),
          stringNumber,
        },
    ).filter(Boolean) as StringFret[];
    // Annotate stringFrets with pitches.
    const stringFretsWithPitches = stringFrets.map(
      ({ fretNumber, stringNumber }) => {
        const pitch = instrument.pitchAt({ fretNumber, stringNumber });
        return { fretNumber, stringNumber, pitch };
      },
    );
    // TODO: recognize inversions
    const pitches = stringFretsWithPitches.map(({ pitch }) => pitch);
    const pitchClasses = [...new Set(pitches.map((p) => p.asPitchClass()))];
    const chord = Chord.fromPitches(pitchClasses);
    const chordFrets = stringFretsWithPitches.map(
      ({ fretNumber, stringNumber, pitch }) => {
        const intervalClass = Interval.between(
          chord.root,
          pitch.asPitchClass(),
        );
        return {
          degreeIndex: chord.intervals.indexOf(intervalClass),
          fretNumber,
          intervalClass,
          pitch,
          stringNumber,
        };
      },
    );
    return new FrettedChord(chord, instrument, chordFrets);
  }

  // Fingering positions, ascending by string number
  public readonly positions: ChordFret[];
  public readonly properties: { [_: string]: any };

  private _fretString: string | null = null;
  constructor(
    readonly chord: Chord<PitchLike>,
    readonly instrument: FrettedInstrument,
    positions: ChordFret[],
    readonly barres: Barre[] = [],
  ) {
    this.positions = [...positions].sort(
      (a: StringFret, b: StringFret) => a.stringNumber - b.stringNumber,
    );
    this.properties = this.createProperties();
  }

  /** A string representation of open, fretted, and muted strings.  For example,
   * 'x02440'.
   *
   * This representation doesn't represent barres.
   */
  get ascii(): string {
    if (this._fretString) {
      return this._fretString;
    }
    const fretArray = this.instrument.stringNumbers.map((_: any) => -1);
    this.positions.forEach(({ stringNumber, fretNumber }: StringFret) => {
      fretArray[stringNumber] = fretNumber;
    });
    this._fretString = fretArray.map((n) => (n >= 0 ? n : 'x')).join('');
    return this._fretString;
  }

  /** How many fingers does the fretting require? For an un-barred fretting,
   * this is just the number of fretted strings.
   */
  get fingerCount(): number {
    let n = this.positions.filter((pos) => pos.fretNumber > 0).length;
    for (const barre of this.barres) {
      n -= barre.fingerReplacementCount - 1;
    }
    return n;
  }

  /** Intervals in the chord, in order by string, with duplicates. */
  get intervals(): Interval[] {
    return this.positions.map(({ intervalClass }) => intervalClass);
  }

  /** Pitches in the chord, in order by string, with duplicates. */
  get pitches(): Pitch[] {
    return this.positions.map(({ pitch }) => pitch);
  }

  private createProperties(): object {
    const fretString = this.ascii;
    return _.mapValues(
      propertyGetters,
      (getter) =>
        getter instanceof RegExp ? getter.test(fretString) : getter(this),
    );
  }

  // chordName(): string {
  //   let { name } = this.chord;
  //   if (this.inversion() > 0) {
  //     name += ` / ${this.instrument.pitchAt(this.positions[0]).toString()}`;
  //   }
  //   return name;
  // }

  // inversion():number {
  //   return this.chord.pitches.indexOf(
  //     Interval.between(
  //       this.chord.root,
  //       this.instrument.pitchAt(this.positions[0])
  //     )
  //   );
  // }

  //   inversionLetter():string {
  //   if (!(this.inversion > 0)) {
  //     return;
  //   }
  //   return String.fromCharCode(96 + this.inversion);
  // }
  // }
}

/** A ChordFret is a FretPosition, annotated with information about its role in
 * a chord.
 */
export interface ChordFret extends StringFret {
  readonly degreeIndex: number;
  readonly intervalClass: Interval;
  readonly pitch: Pitch;
}

/** A barre, or bar, uses a single finger to fret two or more consecutive
 * strings.
 */
export interface Barre {
  readonly fretNumber: number;
  /** The lowest-numbered string, that starts the barre. */
  readonly firstString: number;
  /** The number of strings that the barre includes. */
  readonly stringCount: number;
  // TODO: does this really need to be part of the interface?
  readonly fingerReplacementCount: number;
}

// tslint:disable:object-literal-sort-keys
type Getter<T> = (_: FrettedChord) => T;
const propertyGetters: { [_: string]: RegExp | Getter<any> } = {
  fingers: (fretting) => fretting.fingerCount,
  bassIsRoot: ({ positions }) =>
    _.sortBy(positions, (pos) => pos.stringNumber)[0].intervalClass ===
    Intervals.P1,
  // TODO: restore this
  // inversion(fretting: FrettedChord) => fretting.inversionLetter || '',

  bass: /^\d{3}x*$/,
  treble: /^x*\d{3}$/,
  triad: ({ positions }) => positions.length === 3,

  barres: ({ barres }) => barres.length,
  muting: /\dx/,
  open: /0/,
  skipped: /\dx+\d/,

  position: ({ positions }) =>
    // const frets = positions.map(({ fret }) => fret);
    Math.max(
      _.chain(positions)
        .map('fretNumber')
        .min()
        .value()! - 1,
      0,
    ),
  strings: ({ positions }) => positions.length,
};
// tslint:enable
