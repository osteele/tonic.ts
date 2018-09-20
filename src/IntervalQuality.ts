import * as _ from 'lodash';

/** An *interval quality* distinguishes between [major and
 * minor](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords)
 * intervals, and further augments or diminishes an interval.
 *
 * See [Wikipedia: Interval
 * quality](https://en.wikipedia.org/wiki/Interval_(music)#Quality).
 */
// TODO: add triply-{augmented, diminished}, to represent A♯-E𝄫
export enum IntervalQuality {
  DoublyDiminished = 'dd',
  /** A
   * [diminished](https://en.wikipedia.org/wiki/Diminution#Diminution_of_intervals)
   * interval is narrowed by a chromatic semitone.
   */
  Diminished = 'd',
  /** A [minor](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords) interval. */
  Minor = 'm',
  Perfect = 'P',
  /** A [major](https://en.wikipedia.org/wiki/Major_and_minor#Intervals_and_chords) interval. */
  Major = 'M',
  /** An
   * [augmented](https://en.wikipedia.org/wiki/Augmentation_(music)#Augmentation_of_intervals)
   * interval is widened by a chromatic semitone.
   */
  Augmented = 'A',
  DoublyAugmented = 'AA',
}

// ar[semitones + 2] = IntervalQuality | null.
// ar[0 + 2] = null, since this is ambiguous among Major, Minor, and Perfect,
// depending on the interval's (diatonic) number.
const semitoneQualities: Array<IntervalQuality | null> = [
  IntervalQuality.DoublyDiminished,
  IntervalQuality.Diminished,
  null,
  IntervalQuality.Augmented,
  IntervalQuality.DoublyAugmented,
];

const abbrToQuality: { [_: string]: IntervalQuality } = {
  M: IntervalQuality.Major,
  m: IntervalQuality.Minor,
  // tslint:disable-next-line:object-literal-sort-keys
  P: IntervalQuality.Perfect,
  A: IntervalQuality.Augmented,
  d: IntervalQuality.Diminished,
  AA: IntervalQuality.DoublyAugmented,
  dd: IntervalQuality.DoublyDiminished,
};

// FIXME: why does auto-format keep changing this back?
// tslint:disable:quotemark
const nameToQuality: { [_: string]: IntervalQuality } = {
  "major": IntervalQuality.Major,
  "minor": IntervalQuality.Minor,
  "perfect": IntervalQuality.Perfect,
  // tslint:disable-next-line:object-literal-sort-keys
  "augmented": IntervalQuality.Augmented,
  "diminished": IntervalQuality.Diminished,
  "doubly augmented": IntervalQuality.DoublyAugmented,
  "doubly diminished": IntervalQuality.DoublyDiminished,
};
// tslint:enable:quotemark

const qualityToAbbr = _.invert(abbrToQuality);
const qualityToName = _.invert(nameToQuality);

const perfectOrder = [
  IntervalQuality.DoublyDiminished,
  IntervalQuality.Diminished,
  IntervalQuality.Perfect,
  IntervalQuality.Augmented,
  IntervalQuality.DoublyAugmented,
];

const imperfectOrder = [
  IntervalQuality.DoublyDiminished,
  IntervalQuality.Diminished,
  IntervalQuality.Minor,
  IntervalQuality.Major,
  IntervalQuality.Augmented,
  IntervalQuality.DoublyAugmented,
];

function qualityOrder(perfect: boolean) {
  return perfect ? perfectOrder : imperfectOrder;
}

function widen(
  q: IntervalQuality | null,
  perfect: boolean,
  delta: number,
): IntervalQuality | null {
  if (q === null) {
    return IntervalQuality.fromSemitones(delta);
  }
  const order = qualityOrder(perfect || q === IntervalQuality.Perfect);
  const index = order.indexOf(q);
  return order[index + delta] || null;
}

export namespace IntervalQuality {
  export function fromString(name: string): IntervalQuality | null {
    return abbrToQuality[name] || nameToQuality[name.toLowerCase()];
  }

  export function toString(q: IntervalQuality, fullName = false): string {
    return (fullName ? qualityToName : qualityToAbbr)[q];
  }

  /** If `n === 0`, the value of `natural` is returned. */
  export function fromSemitones(
    n: number,
    natural?: IntervalQuality,
  ): IntervalQuality | null {
    const q = semitoneQualities[n + 2];
    return (q === null ? natural : q) || null;
  }

  /** The signed distance in semitones from the diatonic note.
   *
   * Note that Minor, Major, and Perfect all return 0.
   */
  export function toSemitones(q: IntervalQuality | null): number {
    const index = semitoneQualities.indexOf(q);
    return index >= 0 ? index - 2 : 0;
  }

  export function add(
    a: IntervalQuality,
    b: IntervalQuality,
  ): IntervalQuality | null {
    const table: { [_: string]: IntervalQuality } = {
      MM: IntervalQuality.Augmented,
      MP: IntervalQuality.Major,
      PP: IntervalQuality.Perfect,
      Pm: IntervalQuality.Minor,
      mm: IntervalQuality.Diminished,
    };
    const key = [qualityToAbbr[a], qualityToAbbr[b]].sort().join('');
    const q = table[key];
    return q !== undefined
      ? q
      : fromSemitones(toSemitones(a) + toSemitones(b), IntervalQuality.Perfect);
  }

  export function augment(
    q: IntervalQuality | null,
    perfect = false,
  ): IntervalQuality | null {
    return widen(q, perfect, 1);
  }

  export function diminish(
    q: IntervalQuality | null,
    perfect = false,
  ): IntervalQuality | null {
    return widen(q, perfect, -1);
  }

  export function inverse(q: IntervalQuality | null): IntervalQuality | null {
    const order = qualityOrder(q === IntervalQuality.Perfect);
    const index = order.indexOf(q!);
    return index >= 0 ? order[order.length - 1 - index] : null;
  }

  /** The closest major or minor quality. */
  export function closestNatural(q: IntervalQuality, isPerfect?: boolean): IntervalQuality {
    switch (q) {
      case IntervalQuality.Perfect:
        return IntervalQuality.Perfect;
      case IntervalQuality.DoublyDiminished:
      case IntervalQuality.Diminished:
      case IntervalQuality.Minor:
        return isPerfect ? IntervalQuality.Perfect : IntervalQuality.Minor;
      case IntervalQuality.DoublyAugmented:
      case IntervalQuality.Augmented:
      case IntervalQuality.Major:
        return isPerfect ? IntervalQuality.Perfect : IntervalQuality.Major;
    }
  }
}
