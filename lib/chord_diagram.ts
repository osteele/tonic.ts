/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from 'underscore';
import { FretCount, FretNumbers } from './instruments';
//
// Style
//
import { hsv2css } from './utils';


const SmallStyle = {
  h_gutter: 5,
  v_gutter: 5,
  string_spacing: 6,
  fret_height: 8,
  above_fretboard: 8,
  note_radius: 1,
  closed_string_fontsize: 4,
  chord_degree_colors: ['red', 'blue', 'green', 'orange'],
  intervalClass_colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n =>
    // i = (7 * n) % 12  # color by circle of fifth ascension
    hsv2css({h: (n * 360) / 12, s: 1, v: 1})
  )
};

const DefaultStyle = _.extend({}, SmallStyle, {
  string_spacing: 12,
  fret_height: 16,
  note_radius: 3,
  closed_string_fontsize: 8
}
);

const computeChordDiagramDimensions = function(instrument, style) {
  if (style == null) { style = DefaultStyle; }
  return {
    width: (2 * style.h_gutter) + ((instrument.strings - 1) * style.string_spacing),
    height: (2 * style.v_gutter) + ((style.fret_height + 2) * FretCount)
  };
};


//
// Drawing Methods
//

const drawChordDiagramStrings = function(ctx, instrument, options) {
  if (options == null) { options = {}; }
  const style = DefaultStyle;
  return (() => {
    const result = [];
    for (let string of Array.from(instrument.stringNumbers)) {
      const x = (string * style.string_spacing) + style.h_gutter;
      ctx.beginPath();
      ctx.moveTo(x, style.v_gutter + style.above_fretboard);
      ctx.lineTo(x, style.v_gutter + style.above_fretboard + (FretCount * style.fret_height));
      ctx.strokeStyle = (options.dimStrings && Array.from(options.dimStrings).includes(string) ? 'rgba(0,0,0,0.2)' : 'black');
      result.push(ctx.stroke());
    }
    return result;
  })();
};

const drawChordDiagramFrets = function(ctx, instrument, param) {
  if (param == null) { param = {drawNut: true}; }
  const {drawNut} = param;
  const style = DefaultStyle;
  ctx.strokeStyle = 'black';
  return (() => {
    const result = [];
    for (let fret of Array.from(FretNumbers)) {
      const y = style.v_gutter + style.above_fretboard + (fret * style.fret_height);
      ctx.beginPath();
      ctx.moveTo(style.v_gutter - 0.5, y);
      ctx.lineTo(style.v_gutter + 0.5 + ((instrument.strings - 1) * style.string_spacing), y);
      if ((fret === 0) && drawNut) { ctx.lineWidth = 3; }
      ctx.stroke();
      result.push(ctx.lineWidth = 1);
    }
    return result;
  })();
};

const drawChordDiagram = function(ctx, instrument, positions, options) {
  let fret, string;
  if (options == null) { options = {}; }
  const defaults = {drawClosedStrings: true, drawNut: true, dy: 0, style: DefaultStyle};
  options = _.extend(defaults, options);
  let {barres, dy, drawClosedStrings, drawNut, style} = options;

  let topFret = 0;
  const frets = ((() => {
    const result = [];
    for ({fret} of Array.from(positions)) {       if (fret !== 0) {
        result.push(fret);
      }
    }
    return result;
  })());
  const lowestFret = Math.min(...Array.from(frets || []));
  const highestFret = Math.max(...Array.from(frets || []));
  if (highestFret > 4) {
    topFret = lowestFret - 1;
    drawNut = false;
  }

  if (options.dimUnusedStrings) {
    const usedStrings = ((() => {
      const result1 = [];
      for ({string} of Array.from(positions)) {         result1.push(string);
      }
      return result1;
    })());
    options.dimStrings = ((() => {
      const result2 = [];
      for (string of Array.from(instrument.stringNumbers)) {         if (!Array.from(usedStrings).includes(string)) {
          result2.push(string);
        }
      }
      return result2;
    })());
  }

  const fingerCoordinates = function({string, fret}) {
    if (fret > 0) { fret -= topFret; }
    return {
      x: style.h_gutter + (string * style.string_spacing),
      y: style.v_gutter + style.above_fretboard + ((fret - 0.5) * style.fret_height) + dy
    };
  };

  const drawFingerPosition = function(position, options) {
    if (options == null) { options = {}; }
    const {isRoot, color} = options;
    const {x, y} = fingerCoordinates(position);
    ctx.fillStyle = color || (isRoot ? 'red' : 'white');
    ctx.strokeStyle = color || (isRoot ? 'red' : 'black');
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isRoot && position.fret) {
      (r => ctx.rect(x - r, y - r, 2 * r, 2 * r))(style.note_radius);
    } else {
      ctx.arc(x, y, style.note_radius, 0, Math.PI * 2, false);
    }
    if ((position.fret > 0) || isRoot) { ctx.fill(); }
    return ctx.stroke();
  };

  const drawBarres = function() {
    ctx.fillStyle = 'black';
    return (() => {
      let firstString, stringCount;
      const result3 = [];
      for ({fret, firstString, stringCount} of Array.from(barres)) {
        const {x: x1, y} = fingerCoordinates({string: firstString, fret});
        const {x: x2} = fingerCoordinates({string: (firstString + stringCount) - 1, fret});
        var w = x2 - x1;
        ctx.save();
        ctx.translate((x1 + x2) / 2, y - (style.fret_height * .25));
        ctx.beginPath();
        var eccentricity = 10;
        (function() {
          ctx.save();
          ctx.scale(w, eccentricity);
          ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, Math.PI, 0, false);
          return ctx.restore();
        })();
        (function() {
          ctx.save();
          ctx.scale(w, 14);
          ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, 0, Math.PI, true);
          return ctx.restore();
        })();
        ctx.fill();
        result3.push(ctx.restore());
      }
      return result3;
    })();
  };
      // ctx.fillStyle = 'rgba(0,0,0, 0.5)'
      // ctx.beginPath()
      // ctx.arc x1, y, style.string_spacing / 2, Math.PI * 1/2, Math.PI * 3/2, false
      // ctx.arc x2, y, style.string_spacing / 2, Math.PI * 3/2, Math.PI * 1/2, false
      // ctx.fill()

  const drawFingerPositions = () =>
    (() => {
      const result3 = [];
      for (let position of Array.from(positions)) {
        const default_options = {
          color: style.intervalClass_colors[position.intervalClass.semitones],
          isRoot: (position.intervalClass === 0)
        };
        result3.push(drawFingerPosition(position, _.extend(default_options, position)));
      }
      return result3;
    })()
  ;

  drawClosedStrings = function() {
    let string;
    const fretted_strings = [];
    for (let position of Array.from(positions)) { fretted_strings[position.string] = true; }
    const closed_strings = ((() => {
      const result3 = [];
      for (string of Array.from(instrument.stringNumbers)) {         if (!fretted_strings[string]) {
          result3.push(string);
        }
      }
      return result3;
    })());
    const r = style.note_radius;
    ctx.fillStyle = 'black';
    return (() => {
      const result4 = [];
      for (string of Array.from(closed_strings)) {
        const {x, y} = fingerCoordinates({string, fret: 0});
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(x - r, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.moveTo(x - r, y + r);
        ctx.lineTo(x + r, y - r);
        result4.push(ctx.stroke());
      }
      return result4;
    })();
  };

  drawChordDiagramStrings(ctx, instrument, options);
  drawChordDiagramFrets(ctx, instrument, {drawNut});
  if (barres) { drawBarres(); }
  if (positions) { drawFingerPositions(); }
  if (positions && options.drawClosedStrings) { drawClosedStrings(); }
  return {topFret};
};

export const defaultStyle = DefaultStyle ;
export const width = (instrument) => { return computeChordDiagramDimensions(instrument).width; };
export const height = (instrument) => { return computeChordDiagramDimensions(instrument).height; };
export const draw = drawChordDiagram ;
