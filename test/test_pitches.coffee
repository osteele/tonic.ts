should = require 'should'
{getPitchClassName, getPitchName, normalizePitchClass, parsePitchClass} = require '../lib/pitches'

#TODO intervalClassDifference
#TODO pitchToPitchClass
#TODO midi2name
#TODO name2midi

describe 'getPitchClassName', ->
  it 'should return natural names', ->
    getPitchClassName(0).should.equal 'C'
    getPitchClassName(2).should.equal 'D'
    getPitchClassName(4).should.equal 'E'
    getPitchClassName(5).should.equal 'F'
    getPitchClassName(7).should.equal 'G'
    getPitchClassName(9).should.equal 'A'
    getPitchClassName(11).should.equal 'B'

  it 'should return sharp names', ->
    getPitchClassName(1).should.equal 'C♯'
    getPitchClassName(3).should.equal 'D♯'
    getPitchClassName(6).should.equal 'F♯'
    getPitchClassName(8).should.equal 'G♯'
    getPitchClassName(10).should.equal 'A♯'

describe 'getPitchName', ->
  it 'should return natural names', ->
    getPitchName(0).should.equal 'C'
    getPitchName(2).should.equal 'D'
    getPitchName(4).should.equal 'E'
    getPitchName(5).should.equal 'F'
    getPitchName(7).should.equal 'G'
    getPitchName(9).should.equal 'A'
    getPitchName(11).should.equal 'B'

  it 'should return flat names by default', ->
    getPitchName(1).should.equal 'D♭'
    getPitchName(3).should.equal 'E♭'
    getPitchName(6).should.equal 'G♭'
    getPitchName(8).should.equal 'A♭'
    getPitchName(10).should.equal 'B♭'

  it 'should return flat names with flat option', ->
    getPitchName(1, flat: true).should.equal 'D♭'

  it 'should return sharp names with sharp option', ->
    getPitchName(1, sharp: true).should.equal 'C♯'
    getPitchName(3, sharp: true).should.equal 'D♯'
    getPitchName(6, sharp: true).should.equal 'F♯'
    getPitchName(8, sharp: true).should.equal 'G♯'
    getPitchName(10, sharp: true).should.equal 'A♯'

  it 'should return both names with both options', ->
    getPitchName(1, sharp: true, flat: true).should.equal "D♭/\nC♯"

describe 'normalizePitchClass', ->
  it 'should return an interger in 0..11', ->
    normalizePitchClass(0).should.equal 0
    normalizePitchClass(11).should.equal 11
    normalizePitchClass(-1).should.equal 11
    normalizePitchClass(-13).should.equal 11
    normalizePitchClass(12).should.equal 0
    normalizePitchClass(13).should.equal 1
    normalizePitchClass(25).should.equal 1

describe 'parsePitchClass', ->
  it 'should parse naturals', ->
    parsePitchClass('C').should.equal 0
    parsePitchClass('D').should.equal 2
    parsePitchClass('E').should.equal 4
    parsePitchClass('F').should.equal 5
    parsePitchClass('G').should.equal 7
    parsePitchClass('A').should.equal 9
    parsePitchClass('B').should.equal 11

  it 'should parse sharps', ->
    parsePitchClass('C#').should.equal 1
    parsePitchClass('C♯').should.equal 1

  it 'should parse flats', ->
    parsePitchClass('Cb').should.equal 11
    parsePitchClass('C♭').should.equal 11

  it 'should parse double sharps and flats'
    # parsePitchClass('C𝄪').should.equal 2
    # parsePitchClass('C𝄫').should.equal 10
