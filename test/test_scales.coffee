should = require 'should'
{Chord} = require '../lib/chords'
{Scale, Scales, ScaleDegreeNames} = require '../lib/scales'

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

describe 'Scale', ->
  it 'fromString'

describe 'Diatonic Major Scale', ->
  scale = Scales['Diatonic Major']

  it 'should exist', ->
    should.exist scale

  it 'should be a Scale', ->
    scale.should.be.an.instanceOf Scale

  it 'should have seven pitch classes', ->
    scale.pitchClasses.should.be.an.Array
    scale.pitchClasses.should.have.length 7
    scale.pitchClasses.should.eql [0, 2, 4, 5, 7, 9, 11]

  it 'should have seven intervals', ->
    scale.intervals.should.be.an.Array
    scale.intervals.should.have.length 7
    scale.intervals.map((interval) -> interval.semitones).should.eql [0, 2, 4, 5, 7, 9, 11]

  it 'should have seven modes', ->
    scale.modes.should.be.an.Array
    scale.modes.should.have.length 7

  describe 'at E', ->
    tonicized = scale.at('E')
    chords = tonicized.chords()

    it 'should have a tonic pitch', ->
      tonicized.tonic.toString().should.equal 'E'

    it 'should have seven pitches', ->
      tonicized.pitches.should.have.length 7
      (pitch.toString() for pitch in tonicized.pitches).should.eql 'E F♯ G♯ A B C♯ D♯'.split(/\s/)

    it 'should have seven chords', ->
      chords.should.have.length 7
      chords[0].should.be.an.instanceOf Chord

    it 'should have the right mix of major, minor, dominant and diminished chords', ->
      chords[0].name.should.equal 'E Major'
      chords[1].name.should.equal 'F♯ Minor'
      chords[2].name.should.equal 'G♯ Minor'
      chords[3].name.should.equal 'A Major'
      chords[4].name.should.equal 'B Major'
      chords[5].name.should.equal 'C♯ Minor'
      chords[6].name.should.equal 'D♯ Dim'

describe 'ScaleDegreeNames', ->
  it 'is an array of strings', ->
    ScaleDegreeNames.should.be.an.Array
    ScaleDegreeNames[0].should.be.a.String
