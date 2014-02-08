require 'coffee-errors'
should = require 'should'
{Pitch} = require '../lib/pitches'
{Chord, ChordClass, ChordClasses} = require '../lib/chords'
_ = require 'underscore'
_(global).extend require('../lib/pitches').Intervals

describe 'ChordClasses', ->
  it 'should be an array of ChordClass', ->
    ChordClasses.should.be.an.Array
    ChordClasses[0].should.be.an.instanceOf ChordClass

  it 'should be indexed by chord name', ->
    should.exist ChordClasses['Major']
    should.exist ChordClasses['Minor']
    should.exist ChordClasses['Augmented']
    should.exist ChordClasses['Diminished']

  it 'should be indexed by chord abbreviation', ->
    should.exist ChordClasses['M']
    should.exist ChordClasses['aug']
    should.exist ChordClasses['°']

  it 'should index chord classes by interval sequence', ->
    intervals = [0, 3, 7]
    chordClass = ChordClasses[intervals]
    should.exist chordClass
    chordClass.name.should.equal 'Minor'

    intervals = [0, 4, 7]
    chordClass = ChordClasses[intervals]
    should.exist chordClass
    chordClass.name.should.equal 'Major'


describe 'ChordClass', ->
  describe '#fromString', ->
    it 'should convert from chord class names', ->
      chordClass = ChordClass.fromString('Major')
      chordClass.should.be.an.instanceOf ChordClass
      chordClass.name.should.equal 'Major'

      chordClass = ChordClass.fromString('Minor')
      chordClass.should.be.an.instanceOf ChordClass
      chordClass.name.should.equal 'Minor'

  describe '#fromIntervals', ->
    it 'should find the chord class from an array of intervals', ->
      chordClass = ChordClass.fromIntervals([P1, M3, P5])
      chordClass.name.should.equal 'Major'
      chordClass = ChordClass.fromIntervals([P1, m3, P5])
      chordClass.name.should.equal 'Minor'

    it 'should recognize inversions'


describe 'Chord', ->
  describe '#fromString', ->
    it 'should convert from scientific pitch chord names', ->
      Chord.fromString('E4').should.be.an.instanceOf Chord
      Chord.fromString('E4Major').should.be.an.instanceOf Chord
      Chord.fromString('E4 Major').should.be.an.instanceOf Chord

    it 'should recognize Helmoltz pitch names', ->
      Chord.fromString('E').should.be.an.instanceOf Chord
      Chord.fromString('EMajor').should.be.an.instanceOf Chord
      Chord.fromString('E Major').should.be.an.instanceOf Chord
      Chord.fromString('E Minor').should.be.an.instanceOf Chord
      Chord.fromString("E'").should.be.an.instanceOf Chord
      Chord.fromString("E' Major").should.be.an.instanceOf Chord
      Chord.fromString("E'  Major").should.be.an.instanceOf Chord

  describe '#fromPitches', ->
    it 'should find the chord from an array of pitches', ->
      pitches = 'A3 C#4 E4'.split(/\s/).map (name) -> Pitch.fromString(name)
      chord = Chord.fromPitches(pitches)
      chord.name.should.equal 'A3 Major'


describe 'Major Chord Class', ->
  chordClass = ChordClasses['Major']

  it 'should exist', ->
    should.exist chordClass

  it 'should be a Chord', ->
    chordClass.should.be.an.instanceOf ChordClass

  it 'should have a name', ->
    chordClass.name.should.be.a.String
    chordClass.name.should.equal 'Major'

  it 'should have a fullName', ->
    chordClass.fullName.should.be.a.String
    chordClass.fullName.should.equal 'Major'

  it 'should have a list of abbreviations', ->
    chordClass.abbrs.should.be.an.Array
    chordClass.abbrs.should.eql ['', 'M']

  it 'should have a default abbreviation', ->
    chordClass.abbr.should.be.a.String
    chordClass.abbr.should.equal ''

  it 'should contain three intervals', ->
    chordClass.intervals.should.be.an.Array
    chordClass.intervals.should.have.length 3


  describe 'at E', ->
    chord = chordClass.at('E')

    it 'should have a root', ->
      chord.root.toString().should.equal 'E'

    it 'should have a name', ->
      chord.name.should.be.a.String
      chord.name.should.equal 'E Major'

    it 'should have a fullName', ->
      chord.fullName.should.be.a.String
      chord.fullName.should.equal 'E Major'

    it 'should have an abbreviated name', ->
      chord.abbr.should.be.a.String
      chord.abbr.should.equal 'E'

    it 'should contain three intervals', ->
      chord.intervals.should.be.an.Array
      chord.intervals.should.have.length 3

    it 'should have three pitches', ->
      chord.pitches.should.have.length 3
      # eql [0, 4, 7]

    it '#invert'
    it '#fromRomanNumeral'
    it '#fromPitches'


  describe 'at C', ->
    chord = chordClass.at('C')

    it 'should have a name', ->
      chord.name.should.be.a.String
      chord.name.should.equal 'C Major'

    it 'should have a fullName', ->
      chord.fullName.should.be.a.String
      chord.fullName.should.equal 'C Major'


  describe 'at E4', ->
    chord = chordClass.at('E4')

    it 'should have a name', ->
      chord.name.should.be.a.String
      chord.name.should.equal 'E4 Major'

    it 'should have an array of pitches', ->
      chord.pitches.should.be.an.Array
      chord.pitches.should.have.length 3
      chord.pitches.should.eql ['E4', 'G♯4', 'B4'].map(Pitch.fromString)


describe 'Minor Chord', ->
  chordClass = ChordClasses['Minor']

  describe 'at C', ->
    chord = chordClass.at('C')

    it 'should have a name', ->
      chord.name.should.be.a.String
      chord.name.should.equal 'C Minor'

    it 'should have a fullName', ->
      chord.fullName.should.be.a.String
      chord.fullName.should.equal 'C Minor'
