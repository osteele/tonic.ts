import { Interval } from './Interval';
import { Note } from './Note';
import { PitchClass } from './PitchClass';

/** [[Note]] and [[PitchClass]] implement this type. [[Chord]] and
 * [[SpecificScale]] are parameterized over it.
 */
export interface PitchLike {
  readonly name: string;
  transposeBy(interval: Interval): PitchLike;
}

/** Convert a string into a [[Note]] or [PitchClass]]. This is idempotent on instances
 * [[Note]] and [[PitchClass]].
 */
export function asPitchLike(pitch: string | PitchLike): PitchLike {
  return typeof pitch === 'string' ? parsePitchLike(pitch) : pitch;
}

/** Parse a string as a [[Note]] or [[PitchClass]]. In case of ambiguity (e.g.
 * `"E"`), prefer `PitchClass`.
 */
export function parsePitchLike(name: string): PitchLike {
  try {
    return PitchClass.fromString(name);
  } catch {
    return Note.fromString(name);
  }
}
