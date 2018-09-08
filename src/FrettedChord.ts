import * as _ from 'lodash';
import { Chord } from './Chord';
import { FrettedInstrument, Instruments, StringFret } from './Instrument';
import { Interval } from './Interval';
import { Pitch } from './Pitch';
import { PitchLike } from './PitchLike';

/** Also known as “guitar chords”; but generalized to fretted instruments.
 *
 * See [guitar chord](https://en.wikipedia.org/wiki/Guitar_chord).
 */
export class FrettedChord {
  public static fromAscii(
    ascii: string,
    instrument = Instruments.Guitar,
  ): FrettedChord {
    const stringFrets = _.map(
      ascii,
      (fretNumber, stringNumber) =>
        fretNumber.match(/^\d+$/) && {
          fretNumber: Number(fretNumber),
          stringNumber,
        },
    ).filter(Boolean) as StringFret[];

    const fretsWithPitches = stringFrets.map(({ fretNumber, stringNumber }) => {
      const pitch = instrument.pitchAt({ fretNumber, stringNumber });
      return { fretNumber, stringNumber, pitch };
    });
    // TODO: recognize inversions
    const pitches = fretsWithPitches.map(({ pitch }) => pitch);
    const pitchClasses = [...new Set(pitches.map((p) => p.asPitchClass()))];
    const chord = Chord.fromPitches(pitchClasses);
    // TODO: identify the root, find the chord at this root, and change
    // FrettedChord.chord back to Chord<Pitch>.
    const fretsWithIntervals = fretsWithPitches.map(
      ({ fretNumber, stringNumber, pitch }) => ({
        degreeIndex: 0, // FIXME:
        fretNumber,
        intervalClass: Interval.between(chord.root, pitch.asPitchClass()),
        stringNumber,
      }),
    );
    return new FrettedChord(chord, instrument, fretsWithIntervals);
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

  /** The pitches, in order, by string, with duplicates. */
  get pitches(): Pitch[] {
    return this.positions.map(({ intervalClass }) =>
      this.chord.root.transposeBy(intervalClass),
    );
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

  // @cached_getter 'pitches', ->
  //   (@instrument.pitchAt(positions) for positions in @positions)

  // @cached_getter 'intervals', ->
  //   _.uniq(intervalClassDifference(@chord.rootPitch, pitchClass) for pitchClass in @.pitches)

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

/** A FretPosition, annotated with information that's useful during
 * fretting computation.
 */
export interface ChordFret extends StringFret {
  readonly degreeIndex: number;
  readonly intervalClass: Interval;
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
    _.sortBy(positions, (pos) => pos.stringNumber)[0].degreeIndex === 0,
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
