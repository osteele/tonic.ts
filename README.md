# Tonic.ts

[![Build Status](https://api.travis-ci.org/osteele/tonic.ts.png?branch-master)](https://api.travis-ci.org/osteele/tonic.ts.png?branch-master)

Tonic.ts is a TypeScript library that provides APIs for music theory, drawing
pitch constellation diagrams, and calculating guitar chord fingerings.

This started out as a side project to generate various fretboard and fretboard
diagrams that I'm using to learn guitar.

It isn't intended to be useful to anyone but me in its current state, but it's
slowly evolving towards a library of re-usable API.

## Features

This code provides the following types.

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
* `Chord` is a set of intervals from a root. A chord has a name, a set of
  intervals, a set pitches (or pitch classes), and an inversion. For example, "E
  Major" and "C Minor" name chords.
* `ChordPattern` is an equivalence class of Chords, modded out by their tonics.
  For example, "Major" and "Minor" are chord patterns.
* `Scale` is a named sequence of intervals from an (unspecified) tonic. For
  example, "Diatonic Major" names a scale.
* `SpecificScale` is a scale that starts at a specific pitch or pitch class.

`Chord` and `SpecificScale` are generic classes, that can be instantiated at
either `Pitch` or `PitchClass`.

A `ChordPattern` is to a `Chord` (and its *root*) as a `Scale` is to a
`SpecificScale` (and its *tonic*). The class name hide this symmetry, but
they're the names from the domain of music theory.

The API makes use of TypeScript generics. Although it can be used from straight
JavaScript, there's better alternatives (link TBD) for that.

### Chord calculator

There's a function (TBD) to calculate the guitar (or other fretted polyphonic stringed instrument) fingerings that voice a chord.

Fingerings are ranked and sorted according to voicing and playability metrics:
number of open strings, distance between closed frets, presence of barres.

These are "fingerings", rather than "voicings", because two instances may have
the same voicing (which frets are held on which strings), but differ in their
specification (the presence or absence of barres).

### Chord Diagram Rendering

A function to render a fingering as a chord diagram on a Canvas-like element.
This is probably broken (it hasn't been tested since being ported from
CoffeeScript).

### Pitch Constellation Rendering

A function to render a sequence of pitch classes as a [pitch
constellation](https://en.wikipedia.org/wiki/Chromatic_circle#Pitch_constellation).
You can see it in action at
[Fingerboard](http://osteele.github.io/fingerboard/). This is probably broken.
(It hasn't been tested since being ported from CoffeeScript, which is what the
Fingerboard web app uses, if I recall.)

## Road Map

* [x] Test coverage for music theory objects
* [ ] Generated docs
* [ ] Better docs and coverage for guitar chord calculator
* [ ] Restore, and test, pitch constellation and chord diagram rendering.

## Other Languages

* The original (2013) CoffeeScript version is in the [`coffeescript`
  branch](https://github.com/osteele/tonic.ts/tree/typescript).
* [dart-tonic](https://github.com/osteele/dart-tonic) is a port of an earlier
  version of this library to Dart 2.0.

## License

MIT
