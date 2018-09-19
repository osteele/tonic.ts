# Tonic.ts

[![Build Status](https://travis-ci.org/osteele/tonic.ts.svg?branch=master)](https://travis-ci.org/osteele/tonic.ts)
[![Docs](./docs/docs-badge.svg)](http://osteele.github.io/tonic.ts/)

Tonic.ts is a TypeScript library that provides APIs for music theory, drawing
pitch constellation diagrams, and calculating guitar chord fingerings.

The API makes use of TypeScript enums, generics, and other TypeScript features. Although it can be used from straight
JavaScript, there’s other alternatives (link TBD) for that.

## Features

* **Music theory types**: Note, Interval, Chord, Scale, PitchClass. See the [API documentation](http://osteele.github.io/tonic.ts/).
* **Guitar chord calculator** computes fingerings for guitar chords (and chords on other fretted instruments).
* **Graphics package** draw chord diagrams and [pitch
constellations](https://en.wikipedia.org/wiki/Chromatic_circle#Pitch_constellation).
  You can see the latter at
[Fingerboard](http://osteele.github.io/fingerboard/).

## Examples

(The commented-out lines don't yet work.)

```typescript
import { Chord, ChordQuality, Interval, Intervals, Key, Note, Scale } from 'tonic';
import { frettingFor } from 'tonic';

// Hemholtz and Scientific pitch notation
Note.fromString('C4') instanceof Note; // => true
Note.fromString('C♯4') instanceof Note; // => true
Note.fromString('C♭4') instanceof Note; // => true

// Unicode and ASCII sharps and flats
Note.fromString('C#4') === Note.fromString('C#4'); // => true
Note.fromString('Cb4') === Note.fromString('Cb4'); // => true

// Enharmonic equivalents
Note.fromString('E♯4').midiNumber === Note.fromString('F4').midiNumber; // => true
Note.fromString('E4').midiNumber === Note.fromString('F♭4').midiNumber; // => true
Note.fromString('E♯4') === Note.fromString('F4'); // => false
Note.fromString('E4') === Note.fromString('F♭4'); // => false
// Note.fromString('C4').octave; // => 5
Note.fromString('C4').midiNumber; // => 60
Note.fromMidiNumber(60); // ~> C4

// Intervals
Interval.fromString('M3');
Intervals.m3.semitones; // => 3
Intervals.M3.semitones; // => 4
Intervals.A3.semitones; // => 5
Intervals.d4.semitones; // => 4
Intervals.P4.semitones; // => 5
Intervals.A4.semitones; // => 6
Intervals.M3.number; // => 3
Intervals.M3.quality; // => 'M'

// Interval arithmetic
Intervals.M3.add(Intervals.m3); // ~> P5
Intervals.m3.add(Intervals.M3); // ~> P5
// Intervals.m3.add(Intervals.m3); // ~> d5
// Intervals.M3.add(Intervals.M3); // ~> A5

Note.fromString('C4').add(Intervals.M3); // ~> E4
// Note.fromString('C4').add(Intervals.A3); // ~> E♯4
// Note.fromString('C4').add(Intervals.d4); // ~> F♭4
Note.fromString('C4').add(Intervals.P4); // ~> F4

Interval.between(Note.fromString('C4'), Note.fromString('C4')); // ~> P1
Interval.between(Note.fromString('D4'), Note.fromString('C4')); // ~> M2
Interval.between(Note.fromString('E4'), Note.fromString('C4')); // ~> M3
// Interval.between(Note.fromString('E♯4'), Note.fromString('C4')); // ~> A3
// Interval.between(Note.fromString('F♭4'), Note.fromString('C4')); // ~> d4
Interval.between(Note.fromString('F4'), Note.fromString('C4')); // ~> P4

// Chords
Chord.fromString('E Major');
ChordQuality.fromString('Dominant 7th'); // ~> Dom 7th
ChordQuality.fromIntervals([Intervals.P1, Intervals.M3, Intervals.P5]); // ~> Major
ChordQuality.fromIntervals([Intervals.P1, Intervals.m3, Intervals.P5]); // ~> Minor
// ChordQuality.fromIntervals([
//   Intervals.P1,
//   Intervals.m3,
//   Intervals.P5,
//   Intervals.m7,
// ]); // => Min 7th

// Scales
const scale = Scale.fromString('Diatonic Major');
scale.intervals; // ~> [P1, M2, M3, P4, P5, M6, M7]
scale.modes; // ~> [Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian]
// scale.modes.get('Dorian').intervals; // => [P1, M2, m3, P4, P5, M6, m7]

const key = scale.at(Note.fromString('E4'));
key.intervals; // ~> [P1, M2, M3, P4, P5, M6, M7]
key.pitchClasses; // ~> [0, 2, 4, 5, 7, 9, 11]

// Instruments and fret fingerings
frettingFor('E Major').ascii; // ~> 022100
```

## Status

* The API might change. In particular, `FrettedChord` might change back to
  `Fingering`.
* The graphics functions haven’t been tested since being ported from
  CoffeeScript.

## Other Languages

* The original (2013) CoffeeScript version is in the [`coffeescript`
  branch](https://github.com/osteele/tonic.ts/tree/typescript).
* [dart-tonic](https://github.com/osteele/dart-tonic) is a port to Dart 2.0. It’s compatible with Flutter.

## License

MIT
