import { Interval } from './interval';
import { Pitch } from './pitch';
import { PitchClass } from './pitchClass';

export interface PitchLike {
  readonly name: string;
  transposeBy(interval: Interval): PitchLike;
}

export function asPitchLike(pitch: string | PitchLike): PitchLike {
  return typeof pitch === 'string' ? parsePitchLike(pitch) : pitch;
}

export function parsePitchLike(name: string): PitchLike {
  try {
    return PitchClass.fromString(name);
  } catch {
    return Pitch.fromString(name);
  }
}
