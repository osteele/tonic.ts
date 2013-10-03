should = require 'should'
{Interval, Pitch, PitchClass, getPitchClassName, getPitchName, normalizePitchClass, parsePitchClass} =
  require '../lib/pitches'

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
  it 'should return an integer in 0..11', ->
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

describe 'Interval', ->
  it 'should implement fromString', ->
    Interval.fromString('P1').semitones.should.equal 0
    Interval.fromString('m2').semitones.should.equal 1
    Interval.fromString('M2').semitones.should.equal 2
    Interval.fromString('m3').semitones.should.equal 3
    Interval.fromString('M3').semitones.should.equal 4
    Interval.fromString('P4').semitones.should.equal 5
    Interval.fromString('TT').semitones.should.equal 6
    Interval.fromString('P5').semitones.should.equal 7
    Interval.fromString('m6').semitones.should.equal 8
    Interval.fromString('M6').semitones.should.equal 9
    Interval.fromString('m7').semitones.should.equal 10
    Interval.fromString('M7').semitones.should.equal 11
    Interval.fromString('P8').semitones.should.equal 12

  it 'should implement toString', ->
    Interval.fromSemitones(0).toString().should.equal 'P1'
    Interval.fromSemitones(1).toString().should.equal 'm2'
    Interval.fromSemitones(4).toString().should.equal 'M3'
    Interval.fromSemitones(12).toString().should.equal 'P8'

  it 'should be interned', ->
    Interval.fromString('P1').should.equal Interval.fromString('P1')
    Interval.fromString('M2').should.equal Interval.fromString('M2')
    Interval.fromString('P1').should.not.equal Interval.fromString('M2')

  describe 'add', ->
    it 'should add to an interval', ->
      Interval.fromString('m2').add(Interval.fromString('M2')).semitones.should == 3

  describe 'between', ->
    it 'should return the interval', ->
      Interval.between(Pitch.fromString('E'), Pitch.fromString('E')).toString().should.equal 'P1'
      Interval.between(Pitch.fromString('E'), Pitch.fromString('F')).toString().should.equal 'm2'
      Interval.between(Pitch.fromString('E'), Pitch.fromString('G')).toString().should.equal 'm3'
    it 'should use modular arithmetic', ->
      Interval.between(Pitch.fromString('F'), Pitch.fromString('C')).toString().should.equal 'P5'

describe 'Pitch', ->
  it 'should parse scientific notation', ->
    Pitch.fromString('C4').midiNumber.should.equal 60
    Pitch.fromString('C5').midiNumber.should.equal 72
    Pitch.fromString('E4').midiNumber.should.equal 64
    Pitch.fromString('G5').midiNumber.should.equal 79

  it 'should parse Helmholtz notation', ->
    Pitch.fromString('C,').midiNumber.should.equal 24
    Pitch.fromString('D,').midiNumber.should.equal 26
    Pitch.fromString('C').midiNumber.should.equal 36
    Pitch.fromString('c').midiNumber.should.equal 48
    Pitch.fromString('c♯').midiNumber.should.equal 49
    Pitch.fromString('c♭').midiNumber.should.equal 47
    Pitch.fromString("c'").midiNumber.should.equal 60
    Pitch.fromString("c'''").midiNumber.should.equal 84
    Pitch.fromString("d'''").midiNumber.should.equal 86

  it 'should implement toString', ->
    Pitch.fromMidiNumber(60).toString().should.equal 'C4'
    Pitch.fromMidiNumber(72).toString().should.equal 'C5'
    Pitch.fromMidiNumber(64).toString().should.equal 'E4'
    Pitch.fromMidiNumber(79).toString().should.equal 'G5'

  it 'should add to an interval', ->
    Pitch.fromString('C4').add(Interval.fromString('P1')).toString().should.equal 'C4'
    Pitch.fromString('C4').add(Interval.fromString('M2')).toString().should.equal 'D4'
    Pitch.fromString('C4').add(Interval.fromString('P8')).toString().should.equal 'C5'

  it 'should implement transposeBy', ->
    Pitch.fromString('C4').transposeBy(Interval.fromString('M2')).toString().should.equal 'D4'

  it 'should implement enharmonicizeTo'
  it 'toPitch'
  it 'toPitchClass'

describe 'PitchClass', ->
  it 'should implement fromString', ->
    PitchClass.fromString('C').semitones.should.equal 0
    PitchClass.fromString('E').semitones.should.equal 4
    PitchClass.fromString('G').semitones.should.equal 7
    PitchClass.fromString('C♭').semitones.should.equal 11
    PitchClass.fromString('C♯').semitones.should.equal 1

  it 'should implement toString', ->
    PitchClass.fromSemitones(0).toString().should.equal 'C'
    PitchClass.fromSemitones(2).toString().should.equal 'D'
    PitchClass.fromSemitones(4).toString().should.equal 'E'

  it 'should normalize its input', ->
    PitchClass.fromSemitones(12).toString().should.equal 'C'
    PitchClass.fromSemitones(14).toString().should.equal 'D'

  it 'should add to an interval', ->
    PitchClass.fromString('C').add(Interval.fromString('M2')).toString().should.equal 'D'

  it 'toPitch'
  it 'toPitchClass'
