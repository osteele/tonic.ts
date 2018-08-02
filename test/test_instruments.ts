/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('coffee-errors');
const should = require('should');
const { Pitch } = require('../lib/pitches');
const { Instrument, Instruments } = require('../lib/instruments');

describe('Instruments', () =>
  it('should define a guitar', () =>
    Instruments.Guitar.should.be.an.instanceOf(Instrument)));

describe('Instrument', function() {
  const guitar = Instruments.Guitar;

  it('should have a string count', () => guitar.stringCount.should.equal(6));

  it('should have an array of strings', () => guitar.strings.should.equal(6));

  it('should have a fret count', () => guitar.fretCount.should.equal(12));

  it('should have an array of strings', () =>
    guitar.stringNumbers.should.eql([0, 1, 2, 3, 4, 5]));

  it('should have an array of string pitches', function() {
    guitar.stringPitches.should.be.an.Array;
    guitar.stringPitches.should.have.length(6);
    guitar.stringPitches[0].should.be.an.instanceOf(Pitch);
    guitar.stringPitches[0].toString().should.equal('E2');
    return guitar.stringPitches[5].toString().should.equal('E4');
  });

  it('should define the pitch at each string and fret', function() {
    guitar
      .pitchAt({ string: 0, fret: 0 })
      .toString()
      .should.equal('E2');
    guitar
      .pitchAt({ string: 0, fret: 1 })
      .toString()
      .should.equal('F2');
    return guitar
      .pitchAt({ string: 5, fret: 3 })
      .toString()
      .should.equal('G4');
  });

  return describe('eachFingerPosition', () =>
    it('should iterate over each finger position', function() {
      let count = 0;
      let found = false;
      const strings = [];
      const frets = [];
      guitar.eachFingerPosition(function({ string, fret }) {
        string.should.be.within(0, 5);
        fret.should.be.within(0, 12);
        strings[string] = true;
        frets[fret] = true;
        count += 1;
        return found || (found = string === 2 && fret === 3);
      });
      count.should.equal(6 * 13);
      strings.should.have.length(6);
      frets.should.have.length(13);
      frets[0].should.be.true;
      frets[12].should.be.true;
      should.not.exist(frets[13]);
      return found.should.be.true;
    }));
});
