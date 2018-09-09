# Tonic.ts

[![Build Status](https://travis-ci.org/osteele/tonic.ts.svg?branch=master)](https://travis-ci.org/osteele/tonic.ts)
[![Docs](./docs/docs-badge.svg)](http://osteele.github.io/tonic.ts/)

Tonic.ts is a TypeScript library that provides APIs for music theory, drawing
pitch constellation diagrams, and calculating guitar chord fingerings.

## Features

### Music Theory Types

* `Pitch` represents musical pitches such as "E4" and "F♯5". It converts between
  string and instance representations.
* `PitchClass` represents a pitch class: a musical pitch modulo its octave. For
  example, the pitch class "E" represents "E0", "E1", "E2", etc.
* `PitchLike` is an interface that includes `Pitch` and `PitchClass`. `Chord`
  and `SpecificScale` (below) can be specialized to either a pitch or a pitch
  class; this interface defines their common type.
* `Interval` represents a musical interval such as a minor third or a perfect
  fifth. The difference between two pitch-like instances of the same type is an
  Interval. A pitch-like instance can be transposed by an interval.
* `Chord<PitchLike>` is a set of intervals from a root. A chord has a name, a
  set of intervals, a set pitches (or pitch classes), and an inversion. For
  example, "E Major" and "C Minor" name chords.
* `ChordClass` is an equivalence class of Chords, modded out by their tonics.
  For example, "Major" and "Minor" are chord patterns.
* `Scale` is a named sequence of intervals from an (unspecified) tonic. For
  example, "Diatonic Major" names a scale.
* `SpecificScale<PitchLike>` is a scale that starts at a specific pitch or pitch
  class.

`Chord` and `SpecificScale` are generic classes, that can be instantiated at
either `Pitch` or `PitchClass`.

A `ChordClass` is to a `Chord` (and its *root*) as a `Scale` is to a
`SpecificScale` (and its *tonic*). The class name hide this symmetry, but
they're the names from the domain of music theory.

The API makes use of TypeScript generics. Although it can be used from straight
JavaScript, there's better alternatives (link TBD) for that.

### Guitar Chord Calculator

`bestFretting` finds [guitar chords](https://en.wikipedia.org/wiki/Guitar_chord)
(or chords on other polyphonic fretted stringed instruments) for a chord.

Chords are filtered and sorted according to voicing and play-ability metrics:
number of open strings, distance between closed frets, presence of barres.

### Chord Diagrams

A function to render a fingering as a chord diagram on a Canvas-like element.
This is probably broken (it hasn't been tested since being ported from
CoffeeScript).

### Pitch Constellations

A function to render a sequence of pitch classes as a [pitch
constellation](https://en.wikipedia.org/wiki/Chromatic_circle#Pitch_constellation).
You can see it in action at
[Fingerboard](http://osteele.github.io/fingerboard/). This is probably broken.
(It hasn't been tested since being ported from CoffeeScript, which is what the
Fingerboard web app uses, if I recall.)

## Road Map

* [x] Test coverage for music theory objects
* [x] Publish generated docs
* [ ] Guitar chord calculator docs
* [x] Guitar chord calculator test coverage
* [ ] Revise class names
* [ ] Docs, tests, for pitch constellation and chord diagram rendering.

## Other Languages

* The original (2013) CoffeeScript version is in the [`coffeescript`
  branch](https://github.com/osteele/tonic.ts/tree/typescript).
* [dart-tonic](https://github.com/osteele/dart-tonic) is a port of an earlier
  version of this library to Dart 2.0.

## License

MIT
