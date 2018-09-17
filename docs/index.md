# Tonic.ts

[![Build Status](https://travis-ci.org/osteele/tonic.ts.svg?branch=master)](https://travis-ci.org/osteele/tonic.ts)

[Tonic.ts](https://github.com/osteele/tonic.ts) is a TypeScript library that provides APIs for music theory, drawing
pitch constellation diagrams, and calculating guitar chord fingerings.

## Classes

* [[Note]] represents musical notes such as "E4" and "F♯5". It converts between
  string and instance representations.
* [[PitchClass]] represents a pitch class: a musical pitch modulo its octave. For
  example, the pitch class "E" represents "E0", "E1", "E2", etc.
* [[PitchLike]] is an interface that includes [[Note]] and [[PitchClass]]. [[Chord]]
  and [[SpecificScale]] (below) can be specialized to either a pitch or a pitch
  class; this interface defines their common type.
* [[Interval]] represents a musical interval, such as a minor third or a perfect
  fifth, between two notes. The difference between two pitch-like instances of the same type is an
  Interval. A pitch-like instance can be transposed by an interval.
* [[Chord<PitchLike>]] is a set of intervals from a root. A chord has a tonic, a
  a (chord quality), and an inversion. From these can be derived a set of
  [[Note]]s (or pitch classes), and a name. For example, "E Major" and "C Minor"
  name chords.
* [[ChordQuality]] represents the qualities of a chord's component intervals,
  its suspensions, and additions. The qualities named by "Major", "Minor", and
  "Dom7" are examples of chord qualities.
* [[Scale]] is a named sequence of intervals from an (unspecified) tonic. For
  example, "Diatonic Major" names a scale.
* [[SpecificScale]] is a scale that starts at a specific node or pitch
  class.

[[Chord]] and [[SpecificScale]] are generic classes, that can be instantiated at
either [[Note]] or [[PitchClass]].

A [[ChordClass]] is to a [[Chord]] (and its *root*) as a [[Scale]] is to a
[[SpecificScale]] (and its *tonic*). The class name hide this symmetry, but
they're the names from the domain of music theory.

The API makes use of TypeScript generics. Although it can be used from straight
JavaScript, there's better alternatives (link TBD) for that.

### Guitar Chord Calculator

[[frettingFor]] and [[allFrettings]] find [guitar chords](https://en.wikipedia.org/wiki/Guitar_chord)
(or chords on other polyphonic fretted stringed instruments) for a chord.

Chords are filtered and sorted according to voicing and play-ability metrics:
number of open strings, distance between closed frets, presence of barres.

## Graphics Module

The `diagram` module contains functions to render chord diagrams and [pitch
constellations](https://en.wikipedia.org/wiki/Chromatic_circle#Pitch_constellation).

These functions haven’t been tested since this package was ported from
CoffeeScript.

## License

MIT
