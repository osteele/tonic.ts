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

export function fromSemitones(n: number): IntervalQuality | null {
  return semitoneQualities[n + 2];
}

/** The signed distance in semitones from the diatonic note.
 *
 * Note that Minor, Major, and Perfect all return 0.
 */
export function toSemitones(q: IntervalQuality | null): number {
  const index = semitoneQualities.indexOf(q);
  return index >= 0 ? index - 2 : 0;
}

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

export function fromString(name: string): IntervalQuality | null {
  return abbrToQuality[name] || nameToQuality[name.toLowerCase()];
}

export function toString(q: IntervalQuality, fullName = false): string {
  return (fullName ? qualityToName : qualityToAbbr)[q];
}

const orderedPerfect = [
  IntervalQuality.DoublyDiminished,
  IntervalQuality.Diminished,
  IntervalQuality.Perfect,
  IntervalQuality.Augmented,
  IntervalQuality.DoublyAugmented,
];

const orderedImperfect = [
  IntervalQuality.DoublyDiminished,
  IntervalQuality.Diminished,
  IntervalQuality.Minor,
  IntervalQuality.Major,
  IntervalQuality.Augmented,
  IntervalQuality.DoublyAugmented,
];

function widen(
  q: IntervalQuality | null,
  perfect: boolean,
  delta: number,
): IntervalQuality | null {
  if (q === null) {
    return fromSemitones(delta);
  }
  const ordered =
    perfect || q === IntervalQuality.Perfect
      ? orderedPerfect
      : orderedImperfect;
  const index = ordered.indexOf(q);
  return ordered[index + delta] || null;
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
  const ordered =
    q === IntervalQuality.Perfect ? orderedPerfect : orderedImperfect;
  const index = ordered.indexOf(q!);
  return index >= 0 ? ordered[ordered.length - 1 - index] : null;
}

/** The closest major or minor quality. */
export function closestNatural(q: IntervalQuality): IntervalQuality | null {
  switch (q) {
    case IntervalQuality.DoublyDiminished:
    case IntervalQuality.Diminished:
    case IntervalQuality.Minor:
      return IntervalQuality.Minor;
    case IntervalQuality.DoublyAugmented:
    case IntervalQuality.Augmented:
    case IntervalQuality.Major:
      return IntervalQuality.Major;
    default:
      return null;
  }
}
