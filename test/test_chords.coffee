should = require 'should'
{Chord, Chords} = require '../lib/chords'

describe 'Chords', ->
  it 'should be an array', ->
    Chords.should.be.an.instanceOf Array

  it 'should be indexed by chord name', ->
    should.exist Chords['Major']
    should.exist Chords['Minor']
    should.exist Chords['Augmented']
    should.exist Chords['Diminished']

  it 'should be indexed by chord abbreviation', ->
    should.exist Chords['M']
    should.exist Chords['aug']
    should.exist Chords['°']

  it 'should find chords by pitch sequence'
  it 'should find chords by interval sequence'

describe 'Chord', ->
  describe 'fromString', ->
    it 'should parse unrooted chord names', ->
      Chord.fromString('Major').should.be.an.instanceOf Chord

    it 'should rooted chord names', ->
      Chord.fromString('E').should.be.an.instanceOf Chord
      Chord.fromString('EMajor').should.be.an.instanceOf Chord
      Chord.fromString('E Major').should.be.an.instanceOf Chord


describe 'Major Chord', ->
  chord = Chords['Major']

  it 'should exist', ->
    should.exist chord

  it 'should be a Chord', ->
    chord.should.be.an.instanceOf Chord

  it 'should have a name', ->
    chord.name.should.equal 'Major'

  it 'should have a fullName', ->
    chord.fullName.should.equal 'Major'

  it 'should have a default abbreviation', ->
    chord.abbr.should.equal ''

  it 'should have a list of abbreviations', ->
    chord.abbrs.should.eql ['', 'M']

  it 'should have three pitch classes', ->
    chord.pitchClasses.should.eql [0, 4, 7]

  it 'should have three intervals', ->
    chord.intervals.should.have.length 3


  describe 'at E', ->
    EMajorChord = chord.at('E')

    it 'should have a root', ->
      EMajorChord.root.toString().should.equal 'E'

    it 'should have a name', ->
      EMajorChord.name.should.equal 'E Major'

    it 'should have a fullName', ->
      EMajorChord.fullName.should.equal 'E Major'

    it 'should have an abbreviated name', ->
      EMajorChord.abbr.should.equal 'E'


  describe 'at C', ->
    CMajorChord = chord.at('C')

    it 'should have a name', ->
      CMajorChord.name.should.equal 'C Major'

    it 'should have a fullName', ->
      CMajorChord.fullName.should.equal 'C Major'

describe 'Minor Chord', ->
  minorChord = Chords['Minor']

  describe 'at C', ->
    CMinorChord = minorChord.at('C')

    it 'should have a name', ->
      CMinorChord.name.should.equal 'C Minor'

    it 'should have a fullName', ->
      CMinorChord.fullName.should.equal 'C Minor'
