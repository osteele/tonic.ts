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

  describe 'at E', ->
    rooted = chord.at('E')

    it 'should have a root pitch', ->
      rooted.rootPitch.should.equal 4

    it 'should have a root name', ->
      rooted.rootName.should.equal 'E'

    it 'should have a name', ->
      rooted.name.should.equal 'E'

    it 'should have a fullName', ->
      rooted.fullName.should.equal 'E Major'

  describe 'at C', ->
    rooted = chord.at('C')

    it 'should have a name', ->
      rooted.name.should.equal 'C'

    it 'should have a fullName', ->
      rooted.fullName.should.equal 'C Major'

describe 'Major Chord', ->
  chord = Chords['Minor']

  describe 'at C', ->
    rooted = chord.at('C')

    it 'should have a name', ->
      rooted.name.should.equal 'Cm'

    it 'should have a fullName', ->
      rooted.fullName.should.equal 'C Minor'
