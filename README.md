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

## Status

* The API might change. In particular, `Scale` vs. `SpecificScale`; and `FrettedChord` might change back to `Fingering`.
* The graphics functions haven’t been tested since being ported from CoffeeScript.

## Other Languages

* The original (2013) CoffeeScript version is in the [`coffeescript`
  branch](https://github.com/osteele/tonic.ts/tree/typescript).
* [dart-tonic](https://github.com/osteele/dart-tonic) is a port to Dart 2.0. It’s compatible with Flutter.

## License

MIT
