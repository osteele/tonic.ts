should = require 'should'
{Chord} = require '../lib/chords'
{Scale, Scales} = require '../lib/scales'

describe 'Scales', ->
  it 'should be an array', ->
    Scales.should.be.an.instanceOf Array

  it 'should contains various blues and diatonic scales', ->
    should.exist Scales['Diatonic Major']
    should.exist Scales['Natural Minor']
    should.exist Scales['Major Pentatonic']
    should.exist Scales['Diatonic Major']
    should.exist Scales['Minor Pentatonic']
    should.exist Scales['Melodic Minor']
    should.exist Scales['Harmonic Minor']
    should.exist Scales['Blues']
    should.exist Scales['Freygish']
    should.exist Scales['Whole Tone']
    should.exist Scales['Octatonic']

describe 'Diatonic Major Scale', ->
  scale = Scales['Diatonic Major']

  it 'should exist', ->
    should.exist scale

  it 'should be a Scale', ->
    scale.should.be.an.instanceOf Scale

  it 'should have seven pitch classes', ->
    scale.pitchClasses.should.eql [0, 2, 4, 5, 7, 9, 11]

  it 'should have seven modes', ->
    scale.modes.length.should.equal 7

  describe 'at E', ->
    tonicized = scale.at('E')
    chords = tonicized.chords()

    it 'should have a tonic pitch', ->
      tonicized.tonicPitch.should.equal 4

    it 'should have a tonic name', ->
      tonicized.tonicName.should.equal 'E'

    it 'should have pitches', ->
      tonicized.pitches.should.eql [4, 6, 8, 9, 11, 13, 15]

    it 'should have seven chords', ->
      chords.should.have.length 7
      chords[0].should.be.an.instanceOf Chord

    it 'should have a mix of major, minor, dominant and diminished chords', ->
      chords[0].name.should.equal 'E'
      chords[1].name.should.equal 'F♯m'
      chords[2].name.should.equal 'G♯m'
      chords[3].name.should.equal 'A'
      chords[4].name.should.equal 'B'
      chords[5].name.should.equal 'C♯m'
      chords[6].name.should.equal 'D♯°'

