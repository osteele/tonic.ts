/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('coffee-errors');
const should = require('should');
const {Pitch} = require('../lib/pitches');
const {Chord, ChordClass, ChordClasses} = require('../lib/chords');
const _ = require('underscore');
_(global).extend(require('../lib/pitches').Intervals);

describe('ChordClasses', function() {
  it('should be an array of ChordClass', function() {
    ChordClasses.should.be.an.Array;
    return ChordClasses[0].should.be.an.instanceOf(ChordClass);
  });

  it('should be indexed by chord name', function() {
    should.exist(ChordClasses['Major']);
    should.exist(ChordClasses['Minor']);
    should.exist(ChordClasses['Augmented']);
    return should.exist(ChordClasses['Diminished']);
});

  it('should be indexed by chord abbreviation', function() {
    should.exist(ChordClasses['M']);
    should.exist(ChordClasses['aug']);
    return should.exist(ChordClasses['°']);
});

  return it('should index chord classes by interval sequence', function() {
    let intervals = [0, 3, 7];
    let chordClass = ChordClasses[intervals];
    should.exist(chordClass);
    chordClass.name.should.equal('Minor');

    intervals = [0, 4, 7];
    chordClass = ChordClasses[intervals];
    should.exist(chordClass);
    return chordClass.name.should.equal('Major');
  });
});


describe('ChordClass', function() {
  describe('#fromString', () =>
    it('should convert from chord class names', function() {
      let chordClass = ChordClass.fromString('Major');
      chordClass.should.be.an.instanceOf(ChordClass);
      chordClass.name.should.equal('Major');

      chordClass = ChordClass.fromString('Minor');
      chordClass.should.be.an.instanceOf(ChordClass);
      return chordClass.name.should.equal('Minor');
    })
  );

  return describe('#fromIntervals', function() {
    it('should find the chord class from an array of intervals', function() {
      let chordClass = ChordClass.fromIntervals([P1, M3, P5]);
      chordClass.name.should.equal('Major');
      chordClass = ChordClass.fromIntervals([P1, m3, P5]);
      return chordClass.name.should.equal('Minor');
    });

    return it('should recognize inversions');
  });
});


describe('Chord', function() {
  describe('#fromString', function() {
    it('should convert from scientific pitch chord names', function() {
      Chord.fromString('E4').should.be.an.instanceOf(Chord);
      Chord.fromString('E4Major').should.be.an.instanceOf(Chord);
      return Chord.fromString('E4 Major').should.be.an.instanceOf(Chord);
    });

    return it('should recognize Helmoltz pitch names', function() {
      Chord.fromString('E').should.be.an.instanceOf(Chord);
      Chord.fromString('EMajor').should.be.an.instanceOf(Chord);
      Chord.fromString('E Major').should.be.an.instanceOf(Chord);
      Chord.fromString('E Minor').should.be.an.instanceOf(Chord);
      Chord.fromString("E'").should.be.an.instanceOf(Chord);
      Chord.fromString("E' Major").should.be.an.instanceOf(Chord);
      return Chord.fromString("E'  Major").should.be.an.instanceOf(Chord);
    });
  });

  return describe('#fromPitches', () =>
    it('should find the chord from an array of pitches', function() {
      const pitches = 'A3 C#4 E4'.split(/\s/).map(name => Pitch.fromString(name));
      const chord = Chord.fromPitches(pitches);
      return chord.name.should.equal('A3 Major');
    })
  );
});


describe('Major Chord Class', function() {
  const chordClass = ChordClasses['Major'];

  it('should exist', () => should.exist(chordClass));

  it('should be a Chord', () => chordClass.should.be.an.instanceOf(ChordClass));

  it('should have a name', function() {
    chordClass.name.should.be.a.String;
    return chordClass.name.should.equal('Major');
  });

  it('should have a fullName', function() {
    chordClass.fullName.should.be.a.String;
    return chordClass.fullName.should.equal('Major');
  });

  it('should have a list of abbreviations', function() {
    chordClass.abbrs.should.be.an.Array;
    return chordClass.abbrs.should.eql(['', 'M']);
});

  it('should have a default abbreviation', function() {
    chordClass.abbr.should.be.a.String;
    return chordClass.abbr.should.equal('');
  });

  it('should contain three intervals', function() {
    chordClass.intervals.should.be.an.Array;
    return chordClass.intervals.should.have.length(3);
  });


  describe('at E', function() {
    const chord = chordClass.at('E');

    it('should have a root', () => chord.root.toString().should.equal('E'));

    it('should have a name', function() {
      chord.name.should.be.a.String;
      return chord.name.should.equal('E Major');
    });

    it('should have a fullName', function() {
      chord.fullName.should.be.a.String;
      return chord.fullName.should.equal('E Major');
    });

    it('should have an abbreviated name', function() {
      chord.abbr.should.be.a.String;
      return chord.abbr.should.equal('E');
    });

    it('should contain three intervals', function() {
      chord.intervals.should.be.an.Array;
      return chord.intervals.should.have.length(3);
    });

    it('should have three pitches', () => chord.pitches.should.have.length(3));
      // eql [0, 4, 7]

    it('#invert');
    it('#fromRomanNumeral');
    return it('#fromPitches');
  });


  describe('at C', function() {
    const chord = chordClass.at('C');

    it('should have a name', function() {
      chord.name.should.be.a.String;
      return chord.name.should.equal('C Major');
    });

    return it('should have a fullName', function() {
      chord.fullName.should.be.a.String;
      return chord.fullName.should.equal('C Major');
    });
  });


  return describe('at E4', function() {
    const chord = chordClass.at('E4');

    it('should have a name', function() {
      chord.name.should.be.a.String;
      return chord.name.should.equal('E4 Major');
    });

    return it('should have an array of pitches', function() {
      chord.pitches.should.be.an.Array;
      chord.pitches.should.have.length(3);
      return chord.pitches.should.eql(['E4', 'G♯4', 'B4'].map(Pitch.fromString));
    });
  });
});


describe('Minor Chord', function() {
  const chordClass = ChordClasses['Minor'];

  return describe('at C', function() {
    const chord = chordClass.at('C');

    it('should have a name', function() {
      chord.name.should.be.a.String;
      return chord.name.should.equal('C Minor');
    });

    return it('should have a fullName', function() {
      chord.fullName.should.be.a.String;
      return chord.fullName.should.equal('C Minor');
    });
  });
});
