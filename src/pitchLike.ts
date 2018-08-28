import { Interval } from './Interval';
import { Pitch } from './Pitch';
import { PitchClass } from './PitchClass';

/** Pitch and PitchClass implement this type. Chord and SpecificScale are
 * parameterized over it.
 */
export interface PitchLike {
  readonly name: string;
  transposeBy(interval: Interval): PitchLike;
}

/** Convert a string into a Pitch or PitchClass. This is idempotent on instances
 * Pitch and PitchClass.
 */
export function asPitchLike(pitch: string | PitchLike): PitchLike {
  return typeof pitch === 'string' ? parsePitchLike(pitch) : pitch;
}

/** Parse a string as a Pitch or PitchClass. In case of ambiguity (e.g. `"E"`),
 * PitchClass is preferred.
 */
export function parsePitchLike(name: string): PitchLike {
  try {
    return PitchClass.fromString(name);
  } catch {
    return Pitch.fromString(name);
  }
}
