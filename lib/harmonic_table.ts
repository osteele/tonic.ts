/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from 'underscore';
const { IntervalNames } from './pitches';
const { drawText, withGraphicsContext } from './layout';
const ChordDiagram from './chord_diagram';

const DefaultStyle = {
  intervalClass_colors: ChordDiagram.defaultStyle.intervalClass_colors,
  radius: 50,
  center: true,
  fill_cells: false,
  label_cells: false
};

// Enumerate these explicitly instead of computing them,
// so that we can fine-tune the position of cells that
// could be placed at one of several different locations.
const IntervalVectors = {
  2: { P5: -1, m3: -1 },
  3: { m3: 1 },
  4: { M3: 1 },
  5: { P5: -1 },
  6: { m3: 2 },
  11: { P5: 1, M3: 1 }
};

// Returns a record {m3 M3 P5} that represents the canonical vector (according to `IntervalVectors`)
// of the interval class.
const intervalClassVectors = function(intervalClass) {
  const original_intervalClass = intervalClass; // for error reporting
  const adjustments = {};
  const adjust = function(d_ic, intervals) {
    intervalClass += d_ic;
    for (var k in intervals) {
      if (adjustments[k] == null) {
        adjustments[k] = 0;
      }
    }
    return (() => {
      const result = [];
      for (k in intervals) {
        const v = intervals[k];
        result.push((adjustments[k] += v));
      }
      return result;
    })();
  };
  while (intervalClass >= 24) {
    adjust(-24, { P5: 4, M3: -1 });
  }
  while (intervalClass >= 12) {
    adjust(-12, { M3: 3 });
  }
  let [record, sign] = Array.from([IntervalVectors[intervalClass], 1]);
  if (!record) {
    [record, sign] = Array.from([IntervalVectors[12 - intervalClass], -1]);
  }
  const intervals = _.extend({ m3: 0, M3: 0, P5: 0, sign: 1 }, record);
  for (var k in intervals) {
    intervals[k] *= sign;
  }
  for (k in adjustments) {
    const v = adjustments[k];
    intervals[k] += v;
  }
  const computed_semitones =
    (12 + intervals.P5 * 7 + intervals.M3 * 4 + intervals.m3 * 3) % 12;
  if (computed_semitones !== original_intervalClass % 12) {
    console.error(
      `Error computing grid position for ${original_intervalClass}:\n`,
      `  ${original_intervalClass} ->`,
      intervals,
      '->',
      computed_semitones,
      '!=',
      original_intervalClass % 12
    );
  }
  return intervals;
};

const drawHarmonicTable = function(intervalClasses, options) {
  let x, y;
  if (options == null) {
    options = {};
  }
  options = _.extend({ draw: true }, DefaultStyle, options);
  const colors = options.intervalClass_colors;
  if (!Array.from(intervalClasses).includes(0)) {
    intervalClasses = [0].concat(intervalClasses);
  }
  const cell_radius = options.radius;
  const hex_radius = cell_radius / 2;

  const cell_center = function(interval_klass) {
    const vectors = intervalClassVectors(interval_klass);
    const dy = vectors.P5 + (vectors.M3 + vectors.m3) / 2;
    const dx = vectors.M3 - vectors.m3;
    const x = dx * cell_radius * 0.8;
    const y = -dy * cell_radius * 0.95;
    return { x, y };
  };

  const bounds = {
    left: Infinity,
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity
  };
  for (var interval_klass of Array.from(intervalClasses)) {
    ({ x, y } = cell_center(interval_klass));
    bounds.left = Math.min(bounds.left, x - hex_radius);
    bounds.top = Math.min(bounds.top, y - hex_radius);
    bounds.right = Math.max(bounds.right, x + hex_radius);
    bounds.bottom = Math.max(bounds.bottom, y + hex_radius);
  }

  if (!options.draw) {
    return {
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top
    };
  }

  return withGraphicsContext(function(ctx) {
    ctx.translate(-bounds.left, -bounds.bottom);

    for (interval_klass of Array.from(intervalClasses)) {
      const isRoot = interval_klass === 0;
      var color = colors[interval_klass % 12];
      if (!color) {
        color = colors[12 - interval_klass];
      }
      ctx.beginPath();
      ({ x, y } = cell_center(interval_klass));

      // frame
      for (let i = 0; i <= 6; i++) {
        const a = (i * Math.PI) / 3;
        const pos = [
          x + hex_radius * Math.cos(a),
          y + hex_radius * Math.sin(a)
        ];
        if (i === 0) {
          ctx.moveTo(...Array.from(pos || []));
        }
        ctx.lineTo(...Array.from(pos || []));
      }
      ctx.strokeStyle = 'gray';
      ctx.stroke();

      // fill
      if (isRoot || (options.fill_cells && interval_klass < 12)) {
        ctx.fillStyle = color || 'rgba(255,0,0,0.15)';
        if (!isRoot) {
          ctx.globalAlpha = 0.3;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (isRoot || options.fill_cells) {
        continue;
      }

      // fill
      if (options.label_cells) {
        ctx.globalAlpha = 0.3;
      }
      (function() {
        let [dx, dy, dn] = Array.from([-y, x, 2 / Math.sqrt(x * x + y * y)]);
        dx *= dn;
        dy *= dn;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x + dx, y + dy);
        ctx.lineTo(x - dx, y - dy);
        ctx.fillStyle = color;
        return ctx.fill();
      })();

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();

    if (options.label_cells) {
      return (() => {
        const result = [];
        for (interval_klass of Array.from(intervalClasses)) {
          let label = IntervalNames[interval_klass];
          if (interval_klass === 0) {
            label = 'R';
          }
          ({ x, y } = cell_center(interval_klass));
          result.push(
            drawText(label, {
              font: '10pt Times',
              fillStyle: 'black',
              x,
              y,
              gravity: 'center'
            })
          );
        }
        return result;
      })();
    }
  });
};

 export const draw = drawHarmonicTable;
