require 'coffee-errors'
should = require 'should'
{Interval} = require '../lib/pitches'
{Chord} = require '../lib/chords'
{Instruments} = require '../lib/instruments'
{Fingering, bestFingeringFor} = require '../lib/fingerings'

describe 'Fingering', ->
  chord = Chord.fromString('E Major')
  instrument = Instruments.Guitar
  fingering = bestFingeringFor(chord, instrument)

  it 'should have a chord property', ->
    fingering.chord.should.be.equal chord

  it 'should have an instrument property', ->
    fingering.instrument.should.equal instrument

  it 'should have an array of barres', ->
    fingering.barres.should.be.an.Array

  it 'should have a fretstring', ->
    fingering.fretstring.should.be.a.String
    fingering.fretstring.should.match /^[\dx]{6}$/

  it 'should have an inversion'
    # fingering.positions.should.be.an.Array

  it 'should have an inversion letter'
    # fingering.positions.should.be.an.Array

  it 'should have a properties dictioary', ->
    fingering.properties.should.be.an.Object

  describe 'positions', ->
    it 'should be an array', ->
      fingering.positions.should.be.an.Array

    it 'should have fret and string properties'
      # fingering.positions[0].should.have.properties 'fret', 'string', 'intervalClass'

describe 'bestFingeringFor', ->
  describe 'E Major', ->
    fingering = bestFingeringFor(Chord.fromString('E Major'), Instruments.Guitar)

    it 'should have fingers at 022100', ->
      fingering.positions.should.have.length 6
      fingering.positions[0].string.should.equal 0, 'finger #1 string'
      fingering.positions[0].fret.should.equal 0, 'finger #1 fret'
      fingering.positions[0].intervalClass.should.equal Interval.fromString('P1'), 'finger #1 intervalClass'

      fingering.positions[1].string.should.equal 1, 'finger #2 string'
      fingering.positions[1].fret.should.equal 2, 'finger #2 fret'
      fingering.positions[1].intervalClass.should.equal Interval.fromString('P5'), 'finger #2 intervalClass'

      fingering.positions[2].string.should.equal 2, 'finger #3 string'
      fingering.positions[2].fret.should.equal 2, 'finger #3 fret'
      fingering.positions[2].intervalClass.should.equal Interval.fromString('P1'), 'finger #3 intervalClass'

      fingering.positions[3].string.should.equal 3, 'finger #4 string'
      fingering.positions[3].fret.should.equal 1, 'finger #4 fret'
      fingering.positions[3].intervalClass.should.equal Interval.fromString('M3'), 'finger #4 intervalClass'

      fingering.positions[4].string.should.equal 4, 'finger #5 string'
      fingering.positions[4].fret.should.equal 0, 'finger #5 fret'
      fingering.positions[4].intervalClass.should.equal Interval.fromString('P5'), 'finger #5 intervalClass'

      fingering.positions[5].string.should.equal 5, 'finger #6 string'
      fingering.positions[5].fret.should.equal 0, 'finger #6 fret'
      fingering.positions[5].intervalClass.should.equal Interval.fromString('P1'), 'finger #6 intervalClass'

    it 'should have no barres', ->
      fingering.barres.should.have.length 0

    it 'properties', ->
      fingering.properties.root.should.equal true, 'root'
      fingering.properties.barres.should.equal 0, 'barres'
      fingering.properties.fingers.should.equal 3, 'fingers'
      fingering.properties.skipping.should.equal false, 'skipping'
      fingering.properties.muting.should.equal false, 'muting'
      fingering.properties.open.should.equal true, 'open'
      fingering.properties.triad.should.equal false, 'triad'
      fingering.properties.position.should.equal 0, 'position'
      fingering.properties.strings.should.equal 6, 'strings'
