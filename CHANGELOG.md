# Changelog

This project has no release tags in the repository history. The sections below
are backfilled from `package.json` version changes and grouped to list only the
larger user-facing or project-level changes.

## Unreleased

- Fixed documentation examples to use the published `tonic.ts` package name.
- Fixed chord-quality lookup for built-in seventh and ninth chord interval
  spellings such as dominant seventh, major seventh, minor seventh flat five,
  and major ninth.
- Fixed fretting option merging so caller-provided options override defaults.
- Modernized the project toolchain from the older TSLint/Jest/TypeScript setup
  to current Bun, ESLint, Jest, TypeScript, TypeDoc, and Biome-based formatting.
- Strengthened tests for interval spelling, compound note transposition, chord
  quality parsing, fretting options, and error assertions.

## 0.1.0 - 2018-08-07

- Ported the package from CoffeeScript to TypeScript.
- Added the typed public API around chords, chord qualities, intervals, interval
  qualities, notes, pitch classes, scales, keys, and fretted instruments.
- Added TypeScript build output and package entry points for npm consumers.
- Added Jest-based tests, stricter TypeScript checks, generated API
  documentation, and README doc-test coverage.
- Expanded music-theory behavior across the 0.1.x history, including compound
  intervals, augmented and diminished intervals, chord inversions, seventh and
  ninth chord qualities, scale modes, roman-numeral progressions, and guitar
  fretting helpers.

## 0.0.1 - 2013-05-10

- Created the original CoffeeScript package for chord, pitch, scale, and
  fretboard logic.
- Added guitar fingering search and filtering, chord diagrams, pitch diagrams,
  harmonic-table rendering, and command-line/book generation utilities.
- Added the initial Grunt-based build, CoffeeScript test workflow, and package
  metadata.
