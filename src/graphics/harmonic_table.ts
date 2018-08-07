import * as _ from 'lodash';
import { IntervalNames } from '../interval';
import * as ChordDiagram from './chord_diagram';
import { drawText, GraphicsContext, withGraphicsContext } from './graphics';

const DefaultStyle = {
  intervalClassColors: ChordDiagram.defaultStyle.intervalClassColors,
  radius: 50,
  center: true,
  fillCells: false,
  labelCells: false
};

// Enumerate these explicitly instead of computing them, so that we can
// fine-tune the position of cells that could be placed at one of several
// different locations.
const IntervalVectors = <{ [_: number]: { [_: string]: number } }>{
  2: { P5: -1, m3: -1 },
  3: { m3: 1 },
  4: { M3: 1 },
  5: { P5: -1 },
  6: { m3: 2 },
  11: { P5: 1, M3: 1 }
};

// Returns a record {m3 M3 P5} that represents the canonical vector (according
// to `IntervalVectors`) of the interval class.
function intervalClassVectors(
  intervalClass: number
): { m3: number; M3: number; P5: number } {
  const originalIntervalClass = intervalClass; // for error reporting
  let [dM3, dP5] = [0, 0];
  while (intervalClass >= 24) {
    intervalClass -= 24;
    dM3 -= 1;
    dP5 += 4;
  }
  while (intervalClass >= 12) {
    intervalClass -= 12;
    dM3 += 3;
  }
  const record =
    IntervalVectors[intervalClass] ||
    _.mapValues(IntervalVectors[12 - intervalClass], n => -n);
  const intervals = { m3: 0, M3: 0, P5: 0, record };
  intervals['M3'] += dM3;
  intervals['P5'] += dP5;
  const originalIc = originalIntervalClass % 12;
  const computedIc =
    (12 + intervals.P5 * 7 + intervals.M3 * 4 + intervals.m3 * 3) % 12;
  if (computedIc !== originalIc) {
    console.error(
      `Error computing grid position for ${originalIntervalClass}:\n
      ${originalIntervalClass} -> ${intervals} -> ${computedIc} != ${originalIc}`
    );
  }
  return intervals;
}

function drawHarmonicTable(
  intervalClasses: number[],
  options_: {
    intervalClassColors?: string[];
    radius?: number;
    draw?: boolean;
    fillCells?: boolean;
    labelCells?: boolean;
  } = {}
) {
  const options = { draw: true, ...DefaultStyle, ...options_ };
  const colors = options.intervalClassColors;
  if (intervalClasses.indexOf(0) < 0) {
    intervalClasses = [0, ...intervalClasses];
  }
  const cellRadius = options.radius;
  const hexRadius = cellRadius / 2;

  function getCellCenter(intervalClass: number): { x: number; y: number } {
    const vectors = intervalClassVectors(intervalClass);
    const dy = vectors.P5 + (vectors.M3 + vectors.m3) / 2;
    const dx = vectors.M3 - vectors.m3;
    const x = dx * cellRadius * 0.8;
    const y = -dy * cellRadius * 0.95;
    return { x, y };
  }

  const bounds = {
    left: Infinity,
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity
  };
  intervalClasses.forEach(intervalClass => {
    const { x, y } = getCellCenter(intervalClass);
    bounds.left = Math.min(bounds.left, x - hexRadius);
    bounds.top = Math.min(bounds.top, y - hexRadius);
    bounds.right = Math.max(bounds.right, x + hexRadius);
    bounds.bottom = Math.max(bounds.bottom, y + hexRadius);
  });

  if (!options.draw) {
    return {
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top
    };
  }

  withGraphicsContext((ctx: GraphicsContext) => {
    ctx.translate(-bounds.left, -bounds.bottom);

    intervalClasses.forEach(intervalClass => {
      const isRoot = intervalClass === 0;
      const color = colors[intervalClass % 12] || colors[12 - intervalClass];
      ctx.beginPath();
      const { x, y } = getCellCenter(intervalClass);

      // frame
      for (let i = 0; i <= 6; i++) {
        const a = (i * Math.PI) / 3;
        const mx = x + hexRadius * Math.cos(a);
        const my = y + hexRadius * Math.sin(a);
        if (i === 0) {
          ctx.moveTo(mx, my);
        } else {
          ctx.lineTo(mx, my);
        }
      }
      ctx.strokeStyle = 'gray';
      ctx.stroke();

      // fill
      if (isRoot || (options.fillCells && intervalClass < 12)) {
        ctx.fillStyle = color || 'rgba(255,0,0,0.15)';
        if (!isRoot) {
          ctx.globalAlpha = 0.3;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (isRoot || options.fillCells) {
        return;
      }

      // fill
      if (options.labelCells) {
        ctx.globalAlpha = 0.3;
      }

      let [dx, dy, dn] = [-y, x, 2 / Math.sqrt(x * x + y * y)];
      dx *= dn;
      dy *= dn;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x + dx, y + dy);
      ctx.lineTo(x - dx, y - dy);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();

    if (options.labelCells) {
      intervalClasses.forEach(intervalClass => {
        let label = IntervalNames[intervalClass];
        if (intervalClass === 0) {
          label = 'R';
        }
        const { x, y } = getCellCenter(intervalClass);
        drawText(label, {
          font: '10pt Times',
          fillStyle: 'black',
          x,
          y,
          gravity: 'center'
        });
      });
    }
  });
}

export const draw = drawHarmonicTable;
