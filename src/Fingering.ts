import * as _ from 'lodash';
import { Chord } from './Chord';
import { FretPosition, FrettedInstrument } from './Instrument';
import { Interval } from './Interval';
import { Pitch } from './Pitch';

/** These are "fingerings" and not "voicings" because they also include barre
 * information.
 */
export class Fingering {
  // Fingering positions, ascending by string number
  public readonly positions: FingeringPosition[];
  public readonly properties: { [_: string]: any };

  private _fretString: string | null = null;
  constructor(
    readonly chord: Chord<Pitch>,
    readonly instrument: FrettedInstrument,
    positions: FingeringPosition[],
    readonly barres: Barre[],
  ) {
    this.positions = [...positions].sort(
      (a: FretPosition, b: FretPosition) => a.stringNumber - b.stringNumber,
    );
    this.properties = this.createProperties();
  }

  private createProperties(): object {
    const fretString = this.fretString;
    return _.mapValues(
      propertyGetters,
      (getter) =>
        getter instanceof RegExp ? getter.test(fretString) : getter(this),
    );
  }

  /** How many fingers does the fingering require? For an un-barred fingering,
   * this is just the number of fretted strings.
   */
  get fingerCount(): number {
    let n = this.positions.filter((pos) => pos.fretNumber > 0).length;
    for (const barre of this.barres) {
      n -= barre.fingerReplacementCount - 1;
    }
    return n;
  }

  /** A string representation of open, fretted, and muted strings.  For example,
   * 'x02440'.
   */
  get fretString(): string {
    if (this._fretString) {
      return this._fretString;
    }
    const fretArray = this.instrument.stringNumbers.map((_: any) => -1);
    this.positions.forEach(({ stringNumber, fretNumber }: FretPosition) => {
      fretArray[stringNumber] = fretNumber;
    });
    this._fretString = fretArray.map((n) => (n >= 0 ? n : 'x')).join('');
    return this._fretString;
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
 * chord-fingering computation.
 */
export interface FingeringPosition extends FretPosition {
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
type Getter<T> = (_: Fingering) => T;
const propertyGetters: { [_: string]: RegExp | Getter<any> } = {
  fingers: (fingering) => fingering.fingerCount,
  bassIsRoot: ({ positions }) =>
    _.sortBy(positions, (pos) => pos.stringNumber)[0].degreeIndex === 0,
  // TODO: restore this
  // inversion(f: Fingering) => f.inversionLetter || '',

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
