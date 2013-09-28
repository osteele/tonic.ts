var DefaultStyle, FretCount, FretNumbers, SmallStyle, computeChordDiagramDimensions, drawChordDiagram, drawChordDiagramFrets, drawChordDiagramStrings, hsv2css, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

_ref = require('./instruments'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers;

hsv2css = require('./utils').hsv2css;

SmallStyle = {
  h_gutter: 5,
  v_gutter: 5,
  string_spacing: 6,
  fret_height: 8,
  above_fretboard: 8,
  note_radius: 1,
  closed_string_fontsize: 4,
  chord_degree_colors: ['red', 'blue', 'green', 'orange'],
  intervalClass_colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(n) {
    return hsv2css({
      h: n * 360 / 12,
      s: 1,
      v: 1
    });
  })
};

DefaultStyle = _.extend({}, SmallStyle, {
  string_spacing: 12,
  fret_height: 16,
  note_radius: 3,
  closed_string_fontsize: 8
});

computeChordDiagramDimensions = function(instrument, style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return {
    width: 2 * style.h_gutter + (instrument.strings - 1) * style.string_spacing,
    height: 2 * style.v_gutter + (style.fret_height + 2) * FretCount
  };
};

drawChordDiagramStrings = function(ctx, instrument, options) {
  var string, style, x, _i, _len, _ref1, _results;
  if (options == null) {
    options = {};
  }
  style = DefaultStyle;
  _ref1 = instrument.stringNumbers;
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    string = _ref1[_i];
    x = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(x, style.v_gutter + style.above_fretboard);
    ctx.lineTo(x, style.v_gutter + style.above_fretboard + FretCount * style.fret_height);
    ctx.strokeStyle = (options.dimStrings && __indexOf.call(options.dimStrings, string) >= 0 ? 'rgba(0,0,0,0.2)' : 'black');
    _results.push(ctx.stroke());
  }
  return _results;
};

drawChordDiagramFrets = function(ctx, instrument, _arg) {
  var drawNut, fret, style, y, _i, _len, _results;
  drawNut = (_arg != null ? _arg : {
    drawNut: true
  }).drawNut;
  style = DefaultStyle;
  ctx.strokeStyle = 'black';
  _results = [];
  for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
    fret = FretNumbers[_i];
    y = style.v_gutter + style.above_fretboard + fret * style.fret_height;
    ctx.beginPath();
    ctx.moveTo(style.v_gutter - 0.5, y);
    ctx.lineTo(style.v_gutter + 0.5 + (instrument.strings - 1) * style.string_spacing, y);
    if (fret === 0 && drawNut) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    _results.push(ctx.lineWidth = 1);
  }
  return _results;
};

drawChordDiagram = function(ctx, instrument, positions, options) {
  var barres, defaults, drawBarres, drawClosedStrings, drawFingerPosition, drawFingerPositions, drawNut, dy, fingerCoordinates, fret, frets, highestFret, lowestFret, string, style, topFret, usedStrings;
  if (options == null) {
    options = {};
  }
  defaults = {
    drawClosedStrings: true,
    drawNut: true,
    dy: 0,
    style: DefaultStyle
  };
  options = _.extend(defaults, options);
  barres = options.barres, dy = options.dy, drawClosedStrings = options.drawClosedStrings, drawNut = options.drawNut, style = options.style;
  topFret = 0;
  frets = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      fret = positions[_i].fret;
      if (fret !== 0) {
        _results.push(fret);
      }
    }
    return _results;
  })();
  lowestFret = Math.min.apply(Math, frets);
  highestFret = Math.max.apply(Math, frets);
  if (highestFret > 4) {
    topFret = lowestFret - 1;
    drawNut = false;
  }
  if (options.dimUnusedStrings) {
    usedStrings = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = positions.length; _i < _len; _i++) {
        string = positions[_i].string;
        _results.push(string);
      }
      return _results;
    })();
    options.dimStrings = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = instrument.stringNumbers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        string = _ref1[_i];
        if (__indexOf.call(usedStrings, string) < 0) {
          _results.push(string);
        }
      }
      return _results;
    })();
  }
  fingerCoordinates = function(_arg) {
    var fret, string;
    string = _arg.string, fret = _arg.fret;
    if (fret > 0) {
      fret -= topFret;
    }
    return {
      x: style.h_gutter + string * style.string_spacing,
      y: style.v_gutter + style.above_fretboard + (fret - 0.5) * style.fret_height + dy
    };
  };
  drawFingerPosition = function(position, options) {
    var color, isRoot, x, y, _ref1;
    if (options == null) {
      options = {};
    }
    isRoot = options.isRoot, color = options.color;
    _ref1 = fingerCoordinates(position), x = _ref1.x, y = _ref1.y;
    ctx.fillStyle = color || (isRoot ? 'red' : 'white');
    ctx.strokeStyle = color || (isRoot ? 'red' : 'black');
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isRoot && position.fret) {
      (function(r) {
        return ctx.rect(x - r, y - r, 2 * r, 2 * r);
      })(style.note_radius);
    } else {
      ctx.arc(x, y, style.note_radius, 0, Math.PI * 2, false);
    }
    if (position.fret > 0 || isRoot) {
      ctx.fill();
    }
    return ctx.stroke();
  };
  drawBarres = function() {
    var eccentricity, firstString, stringCount, w, x1, x2, y, _fn, _fn1, _i, _len, _ref1, _ref2, _results;
    ctx.fillStyle = 'black';
    _fn = function() {
      ctx.save();
      ctx.scale(w, eccentricity);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, Math.PI, 0, false);
      return ctx.restore();
    };
    _fn1 = function() {
      ctx.save();
      ctx.scale(w, 14);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, 0, Math.PI, true);
      return ctx.restore();
    };
    _results = [];
    for (_i = 0, _len = barres.length; _i < _len; _i++) {
      _ref1 = barres[_i], fret = _ref1.fret, firstString = _ref1.firstString, stringCount = _ref1.stringCount;
      _ref2 = fingerCoordinates({
        string: firstString,
        fret: fret
      }), x1 = _ref2.x, y = _ref2.y;
      x2 = fingerCoordinates({
        string: firstString + stringCount - 1,
        fret: fret
      }).x;
      w = x2 - x1;
      ctx.save();
      ctx.translate((x1 + x2) / 2, y - style.fret_height * .25);
      ctx.beginPath();
      eccentricity = 10;
      _fn();
      _fn1();
      ctx.fill();
      _results.push(ctx.restore());
    }
    return _results;
  };
  drawFingerPositions = function() {
    var default_options, position, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      default_options = {
        color: style.intervalClass_colors[position.intervalClass],
        isRoot: position.intervalClass === 0
      };
      _results.push(drawFingerPosition(position, _.extend(default_options, position)));
    }
    return _results;
  };
  drawClosedStrings = function() {
    var closed_strings, fretted_strings, position, r, x, y, _i, _j, _len, _len1, _ref1, _results;
    fretted_strings = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      fretted_strings[position.string] = true;
    }
    closed_strings = (function() {
      var _j, _len1, _ref1, _results;
      _ref1 = instrument.stringNumbers;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        string = _ref1[_j];
        if (!fretted_strings[string]) {
          _results.push(string);
        }
      }
      return _results;
    })();
    r = style.note_radius;
    ctx.fillStyle = 'black';
    _results = [];
    for (_j = 0, _len1 = closed_strings.length; _j < _len1; _j++) {
      string = closed_strings[_j];
      _ref1 = fingerCoordinates({
        string: string,
        fret: 0
      }), x = _ref1.x, y = _ref1.y;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x - r, y - r);
      ctx.lineTo(x + r, y + r);
      ctx.moveTo(x - r, y + r);
      ctx.lineTo(x + r, y - r);
      _results.push(ctx.stroke());
    }
    return _results;
  };
  drawChordDiagramStrings(ctx, instrument, options);
  drawChordDiagramFrets(ctx, instrument, {
    drawNut: drawNut
  });
  if (barres) {
    drawBarres();
  }
  if (positions) {
    drawFingerPositions();
  }
  if (positions && options.drawClosedStrings) {
    drawClosedStrings();
  }
  return {
    topFret: topFret
  };
};

module.exports = {
  defaultStyle: DefaultStyle,
  width: function(instrument) {
    return computeChordDiagramDimensions(instrument).width;
  },
  height: function(instrument) {
    return computeChordDiagramDimensions(instrument).height;
  },
  draw: drawChordDiagram
};

/*
//@ sourceMappingURL=chord_diagram.js.map
*/