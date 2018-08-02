/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Interval, IntervalNames, Pitch, PitchClass} from './pitches';

//
// ChordClasses
//

const ChordNameRE = /^([a-gA-G],*'*[#b♯♭𝄪𝄫]*(?:\d*))\s*(.*)$/;
const InversionNames = 'acd'.split(/./);

// An instance of ChordClass represents the intervals of the chord,
// without the root. For example, Dom7. It represents the quality, suspensions, and additions.
class ChordClass {
    name: string;
    fullName: string;
    abbr: string;
    abbrs: [string];
    intervals: [Interval];
  constructor({name, fullName, abbrs, intervals}) {
    this.name = name;
    this.fullName = fullName;
    this.abbrs = abbrs;
    this.intervals = intervals;
    this.abbr = this.abbrs[0];
  }

  at(root) {
    return new Chord({chordClass: this, root});
  }

  static fromIntervals(intervals) {
    const semitones = (Array.from(intervals).map((interval) => interval.semitones));
    const chordClass = ChordClasses[semitones.sort((a, b) => a > b)];
    if (!chordClass) { throw new Error(`Couldn't find chord class with intervals ${intervals}`); }
    return chordClass;
  }

  static fromString(name) {
    let chord;
    if (chord = ChordClasses[name]) { return chord; }
    throw new Error(`“${name}” is not a chord name`);
  }
}


// A chord may be:
// - a torsor (e.g. Major)
// - a scale degree (e.g. I)
// - a tonicized scale (e.g. C Major)
class Chord {
    chordClass: ChordClass;
    root: Pitch;
    inversion: number;
    name: string;
    fullName: string
    abbr: string;
    abbrs: [string];
    intervals: [Interval];
    pitches: [Pitch];
  constructor({chordClass, root, inversion=0}) {
    let abbr;
    this.chordClass = chordClass;
    this.root = root;
    this.inversion = inversion;
    if (typeof this.root === 'string') { this.root = Pitch.fromString(this.root); }

    this.name = `${this.root.toString()} ${this.chordClass.name}`;
    this.fullName = `${this.root.toString()} ${this.chordClass.fullName}`;
    this.abbrs = ((() => {
      const result = [];
      for (abbr of Array.from(this.chordClass.abbrs)) {         result.push(`${this.root.toString()} ${abbr}`.replace(/\s+$/, ''));
      }
      return result;
    })());
    this.abbr = this.abbrs[0];
    this.intervals = this.chordClass.intervals;
    this.pitches = (Array.from(this.chordClass.intervals).map((interval) => this.root.toPitch().transposeBy(interval)));

    // degrees = (1 + 2 * pitchClass.semitones for pitchClass in [0..@pitchClasses.length])
    // degrees[1] = {'Sus2':2, 'Sus4':4}[@name] || degrees[1]
    // degrees[3] = 6 if @name.match /6/

    if (this.inversion) {
      this.intervals = rotateArray(this.intervals, this.inversion);
      this.pitches = rotateArray(this.pitches, this.inversion);
    }
  }
      // @pitchClasses = rotateArray(@pitchClasses, @inversion)

    // @components = for interval, index in intervals
    //   semitones = interval.semitones
    //   name = IntervalNames[semitones]
    //   degree = degrees[index]
    //   if semitones == 0
    //     name = 'R'
    //   else unless Number(name.match(/\d+/)?[0]) == degree
    //     name = "A#{degree}" if Number(IntervalNames[semitones - 1].match(/\d+/)?[0]) == degree
    //     name = "d#{degree}" if Number(IntervalNames[semitones + 1].match(/\d+/)?[0]) == degree
    //   name

  _clone(extend) {
    const attrs = {
      inversion: this.inversion,
      chordClass: this.chordClass,
      root: this.root
    };
    for (let key in extend) { const value = extend[key]; attrs[key] = value; }
    return new Chord(attrs);
  }

  // at: (root) ->
  //   @_clone root: root

  // degreeName: (degreeIndex) ->
  //   @components[degreeIndex]

  // enharmonicizeTo: (scale) ->
  //   @_clone root: @root.enharmonicizeTo(scale)

  invert(inversion) {
    if (typeof inversion !== 'number') {
      if (!Array.from(InversionNames).includes(inversion)) { throw new Error(`Unknown inversion “${inversion}”`); }
      inversion = 1 + InversionNames.indexOf(inversion);
    }
    return this._clone({inversion});
  }

  static fromRomanNumeral(name, scale) {
    return chordFromRomanNumeral(name, scale);
  }

  static fromString(name) {
    let match;
    if (!(match = name.match(ChordNameRE))) {
      throw new Error(`“${name}” is not a chord name`);
    }
    let [rootName, className] = Array.from(match.slice(1));
    if (!className) { className = 'Major'; }
    const chordClass = ChordClass.fromString(className);
    if (rootName) { return chordClass.at(Pitch.fromString(rootName)); }
  }

  static fromPitches(pitches) {
    const root = pitches[0];
    const intervals = (Array.from(pitches).map((pitch) => Interval.between(root, pitch)));
    return ChordClass.fromIntervals(intervals).at(root);
  }
}

var ChordClasses = [
  {name: 'Major', abbrs: ['', 'M'], intervals: '047'},
  {name: 'Minor', abbrs: ['m'], intervals: '037'},
  {name: 'Augmented', abbrs: ['+', 'aug'], intervals: '048'},
  {name: 'Diminished', abbrs: ['°', 'dim'], intervals: '036'},
  {name: 'Sus2', abbrs: ['sus2'], intervals: '027'},
  {name: 'Sus4', abbrs: ['sus4'], intervals: '057'},
  {name: 'Dominant 7th', abbrs: ['7', 'dom7'], intervals: '047t'},
  {name: 'Augmented 7th', abbrs: ['+7', '7aug'], intervals: '048t'},
  {name: 'Diminished 7th', abbrs: ['°7', 'dim7'], intervals: '0369'},
  {name: 'Major 7th', abbrs: ['maj7'], intervals: '047e'},
  {name: 'Minor 7th', abbrs: ['min7'], intervals: '037t'},
  {name: 'Dominant 7b5', abbrs: ['7b5'], intervals: '046t'},
  // following is also half-diminished 7th
  {name: 'Minor 7th b5', abbrs: ['ø', 'Ø', 'm7b5'], intervals: '036t'},
  {name: 'Diminished Maj 7th', abbrs: ['°Maj7'], intervals: '036e'},
  {name: 'Minor-Major 7th', abbrs: ['min/maj7', 'min(maj7)'], intervals: '037e'},
  {name: '6th', abbrs: ['6', 'M6', 'M6', 'maj6'], intervals: '0479'},
  {name: 'Minor 6th', abbrs: ['m6', 'min6'], intervals: '0379'},
].map(function({name, abbr, abbrs, intervals}) {
  const fullName = name;
  name = name
    .replace(/Major(?!$)/, 'Maj')
    .replace(/Minor(?!$)/, 'Min')
    .replace('Dominant', 'Dom')
    .replace('Diminished', 'Dim');
  intervals = intervals.match(/./g).map(function(c) {
    let left;
    const semitones = (left = {'t':10, 'e':11}[c]) != null ? left : Number(c);
    return Interval.fromSemitones(semitones);
  });
  return new ChordClass({name, fullName, abbr, abbrs, intervals});});

// `ChordClasses` is also indexed by name, abbreviation, and pitch classes
(() =>
  (() => {
    const result = [];
    for (let chordClass of Array.from(ChordClasses)) {
      const {name, fullName, abbrs} = chordClass;
      for (let key of Array.from([name, fullName].concat(abbrs))) { ChordClasses[key] = chordClass; }
      result.push(ChordClasses[Array.from(chordClass.intervals).map((interval) => interval.semitones)] = chordClass);
    }
    return result;
  })()
)();


//
// Chord Progressions
//

const ChordRomanNumerals = 'I II III IV V VI VII'.split(/\s+/);

var rotateArray = (array, n) => array.slice(n).concat(array.slice(0, n));

const RomanNumeralModifiers = {
  '+': 'aug',
  '°': 'dim',
  '6': 'maj6',
  '7': 'dom7',
  '+7': '+7',
  '°7': '°7',
  'ø7': 'ø7'
};

var chordFromRomanNumeral = function(name, scale) {
  let match;
  if (!(match = name.match(/^(♭?)(i+v?|vi*)(.*?)([acd]?)$/i))) { throw new Error(`“${name}” is not a chord roman numeral`); }
  if (scale.tonic == null) { throw new Error("requires a scale with a tonic"); }
  const [accidental, romanNumeral, modifiers, inversion] = Array.from(match.slice(1));
  const degree = ChordRomanNumerals.indexOf(romanNumeral.toUpperCase());
  if (!(degree >= 0)) { throw new Error("Not a chord name"); }
  let chordType = (() => { switch (false) {
    case romanNumeral !== romanNumeral.toUpperCase():
      return 'Major';
    case romanNumeral !== romanNumeral.toLowerCase():
      return 'Minor';
    default:
      throw new Error(`Roman numeral chords can't be mixed case in “${romanNumeral}”`);
  } })();
  if (modifiers) {
    // throw new Error("Unimplemented: mixing minor chords with chord modifiers") unless chordType == 'Major'
    chordType = RomanNumeralModifiers[modifiers];
    if (!chordType) { throw new Error(`unknown chord modifier “${modifiers}”`); }
  }
  // TODO 9, 13, sharp, natural
  let chord = ChordClass.fromString(chordType).at(scale.pitches[degree]);
  if (inversion) { chord = chord.invert(inversion); }
  return chord;
};



//
// Exports
//

export {
  ChordClass,
  ChordClasses,
  Chord
};
