/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('coffee-errors');
const should = require('should');
const {Chord} = require('../lib/chords');
const {Scale, Scales, ScaleDegreeNames} = require('../lib/scales');

describe('Scales', function() {
  it('should be an array of Scale', function() {
    Scales.should.be.an.Array;
    return Scales[0].should.be.an.instanceOf(Scale);
  });

  return it('should contains various blues and diatonic scales', function() {
    should.exist(Scales['Diatonic Major']);
    should.exist(Scales['Natural Minor']);
    should.exist(Scales['Major Pentatonic']);
    should.exist(Scales['Diatonic Major']);
    should.exist(Scales['Minor Pentatonic']);
    should.exist(Scales['Melodic Minor']);
    should.exist(Scales['Harmonic Minor']);
    should.exist(Scales['Blues']);
    should.exist(Scales['Freygish']);
    should.exist(Scales['Whole Tone']);
    return should.exist(Scales['Octatonic']);
});
});

describe('Scale', () => it('#fromString should return a scale'));

describe('Diatonic Major Scale', function() {
  const scale = Scales['Diatonic Major'];

  it('should exist', () => should.exist(scale));

  it('should be a Scale', () => scale.should.be.an.instanceOf(Scale));

  it('should have seven pitch classes', function() {
    scale.pitchClasses.should.be.an.Array;
    scale.pitchClasses.should.have.length(7);
    return scale.pitchClasses.should.eql([0, 2, 4, 5, 7, 9, 11]);
});

  it('should have seven intervals', function() {
    scale.intervals.should.be.an.Array;
    scale.intervals.should.have.length(7);
    return scale.intervals.map(interval => interval.semitones).should.eql([0, 2, 4, 5, 7, 9, 11]);
});

  it('should have seven modes', function() {
    scale.modes.should.be.an.Array;
    return scale.modes.should.have.length(7);
  });

  return describe('at E', function() {
    const tonicized = scale.at('E');
    const chords = tonicized.chords();

    it('should have a tonic pitch', () => tonicized.tonic.toString().should.equal('E'));

    it('should have seven pitches', function() {
      tonicized.pitches.should.have.length(7);
      return (Array.from(tonicized.pitches).map((pitch) => pitch.toString())).should.eql('E F♯ G♯ A B C♯ D♯'.split(/\s/));
    });

    it('should have seven chords', function() {
      chords.should.have.length(7);
      return chords[0].should.be.an.instanceOf(Chord);
    });

    return it('should have the correct chord sequence', function() {
      chords[0].name.should.equal('E Major');
      chords[1].name.should.equal('F♯ Minor');
      chords[2].name.should.equal('G♯ Minor');
      chords[3].name.should.equal('A Major');
      chords[4].name.should.equal('B Major');
      chords[5].name.should.equal('C♯ Minor');
      return chords[6].name.should.equal('D♯ Dim');
    });
  });
});

describe('ScaleDegreeNames', () =>
  it('is an array of strings', function() {
    ScaleDegreeNames.should.be.an.Array;
    return ScaleDegreeNames[0].should.be.a.String;
  })
);

describe('Scale.fromRomanNumeral', function() {
  const scale = Scales.DiatonicMajor.at('E4');

  it('should create major chords', function() {
    // Chord.fromRomanNumeral('I', scale)
    Chord.fromRomanNumeral('I', scale).should.eql(Chord.fromString('E4 Major'), 'I');
    Chord.fromRomanNumeral('II', scale).should.eql(Chord.fromString('F♯4 Major'), 'II');
    Chord.fromRomanNumeral('IV', scale).should.eql(Chord.fromString('A4 Major'), 'IV');
    Chord.fromRomanNumeral('V', scale).should.eql(Chord.fromString('B4 Major'), 'V');
    return Chord.fromRomanNumeral('VI', scale).should.eql(Chord.fromString('C♯5 Major'), 'VI');
  });

  it('should create minor chords', function() {
    Chord.fromRomanNumeral('i', scale).should.eql(Chord.fromString('E4 Minor'), 'i');
    Chord.fromRomanNumeral('ii', scale).should.eql(Chord.fromString('F♯4 Minor'), 'ii');
    return Chord.fromRomanNumeral('vi', scale).should.eql(Chord.fromString('C♯5 Minor'), 'vi');
  });

  it('should create diminished chords', function() {
    Chord.fromRomanNumeral('vii°', scale).should.eql(Chord.fromString('D♯5°'), 'vi°');
    return Chord.fromRomanNumeral('iv°', scale).should.eql(Chord.fromString('A4°'), 'iv°');
  });

  return it('should create inversions');
});
    // Chord.fromRomanNumeral('ib', scale).should.eql Chord.fromString('E4 Minor'), 'i'
    // Chord.fromRomanNumeral('ic', scale).should.eql Chord.fromString('F♯4 Minor'), 'ii'
    // Chord.fromRomanNumeral('id', scale).should.eql Chord.fromString('C♯5 Minor'), 'vi'


describe('Chord.progression', () =>
  it('should do its stuff', function() {
    const chords = Chord.progression('I ii iii IV', Scales.DiatonicMajor.at('E4'));
    chords.should.be.an.Array;
    return chords.should.have.length(4);
  })
);
    // chords.should.eql 'E4 F♯4m G4m A'.split(/\s/).map(Chord.fromString)
