import { IntervalQuality } from '../IntervalQuality';

export const shortIntervalNames = 'P1 m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7 P8'.split(
  /\s/,
);

export const longIntervalNames = [
  'Unison',
  'Minor 2nd',
  'Major 2nd',
  'Minor 3rd',
  'Major 3rd',
  'Perfect 4th',
  'Tritone',
  'Perfect 5th',
  'Minor 6th',
  'Major 6th',
  'Minor 7th',
  'Major 7th',
  'Octave',
];

// ar[semitones + 2] = IntervalQuality | null.
// ar[0 + 2] = null, since this is ambiguous among Major, Minor, and Perfect,
// depending on the interval's (diatonic) number.
const accidentalsToQuality: Array<IntervalQuality | null> = [
  IntervalQuality.DoublyDiminished,
  IntervalQuality.Diminished,
  null,
  IntervalQuality.Augmented,
  IntervalQuality.DoublyAugmented,
];

const qualityAbbrList: Array<[IntervalQuality, string]> = [
  [IntervalQuality.Major, 'M'],
  [IntervalQuality.Minor, 'm'],
  [IntervalQuality.Perfect, 'P'],
  [IntervalQuality.Augmented, 'A'],
  [IntervalQuality.Diminished, 'd'],
  [IntervalQuality.DoublyAugmented, 'AA'],
  [IntervalQuality.DoublyDiminished, 'dd'],
];

const abbrevToQuality = new Map<string, IntervalQuality>(
  qualityAbbrList.map(([abbr, q]) => [q, abbr] as [string, IntervalQuality]),
);

const qualityAbbrs = new Map<IntervalQuality, string>(
  qualityAbbrList.map(([abbr, q]) => [abbr, q] as [IntervalQuality, string]),
);

// Arrays of ar[diatonicNumber] to semitone counts. `Interval.fromString` uses
// these. They're initialized below.
const majorSemitones = new Array<number>(8);
const minorSemitones = new Array<number>(8);
const perfectSemitones = new Array<number>(8);

// Initialize majorSemitones, minorSemitones, and perfectSemitones from
// ShortIntervalNames.
shortIntervalNames.forEach((name, semitones) => {
  const m = name.match(/(.)(\d)/);
  if (m) {
    const ar =
      ({ P: perfectSemitones, M: majorSemitones, m: minorSemitones } as {
        [_: string]: number[];
      })[m[1]] || [];
    const num = +m[2];
    ar[num] = semitones;
  }
});

const lowerCaseQualities: { [_: string]: number } = {
  a: 1,
  augmented: 1,
  d: -1,
  diminished: -1,
};

export function intervalQualityName(q: IntervalQuality): string {
  return qualityAbbrs.get(q)!;
}

export function accidentalToIntervalQuality(
  n: number,
  naturalSemitones: number,
): IntervalQuality | null {
  if (n === 0) {
    const m = shortIntervalNames[naturalSemitones % 12].match(/./);
    return (m && abbrevToQuality.get(m[0])) || null;
  }
  return accidentalsToQuality[n + 2];
}

export function parseInterval(
  name: string,
): { semitones: number; accidentals?: number } {
  let semitones = shortIntervalNames.indexOf(name);
  if (semitones >= 0) {
    return { semitones };
  }
  semitones = longIntervalNames.indexOf(name);
  if (semitones >= 0) {
    return { semitones };
  }
  const m =
    name.match(/^([AMPmd])(\d+)$/) ||
    name.match(/^(augmented|diminished)\s*(\d+)$/i);
  if (!m) {
    throw new Error(`No interval named ${name}`);
  }
  const qualityAbbr = m[1];
  const dn = Number(m[2]); // diatonic number
  if (dn > 8) {
    const simplex = parseInterval(`${qualityAbbr}${dn - 7}`);
    return {
      accidentals: simplex.accidentals,
      semitones: simplex.semitones + 12,
    };
  }
  const accidentals = lowerCaseQualities[qualityAbbr.toLowerCase()] || 0;
  semitones =
    (accidentals < 0 ? minorSemitones : majorSemitones)[dn] ||
    perfectSemitones[dn];
  return { semitones, accidentals };
}
