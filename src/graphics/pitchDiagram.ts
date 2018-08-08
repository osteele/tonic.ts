import { defaultStyle as ChordDiagramStyle } from './chordDiagram';
import { GraphicsContext } from './graphics';
const { PI, cos, sin, min, max } = Math;

const drawPitchDiagram = function(
  ctx: GraphicsContext,
  pitchClasses: number[],
  options: { pitchColors?: string[]; pitchNames?: string[]; draw: boolean } = {
    draw: true
  }
) {
  let angle, x, y;
  let { pitchColors, pitchNames } = options;
  if (!pitchColors) {
    pitchColors = ChordDiagramStyle.intervalClassColors;
  }
  if (!pitchNames) {
    pitchNames = 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/);
  }
  // pitch_names = '1 2b 2 3b 3 4 T 5 6b 6 7b 7'.split(/\s/)
  const r = 10;
  const r_label = r + 7;

  const pitchClassAngle = (pitchClass: number) =>
    ((pitchClass - 3) * 2 * PI) / 12;

  const bounds = { left: 0, top: 0, right: 0, bottom: 0 };
  function extendBounds(
    left: number,
    top: number,
    bottom?: number,
    right?: number
  ) {
    bounds.left = min(bounds.left, left);
    bounds.top = min(bounds.top, top);
    bounds.right = max(bounds.right, right != null ? right : left);
    bounds.bottom = max(bounds.bottom, bottom != null ? bottom : top);
  }

  pitchClasses.forEach(pitchClass => {
    angle = pitchClassAngle(pitchClass);
    x = r * cos(angle);
    y = r * sin(angle);

    if (options.draw) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    extendBounds(x, y);

    if (options.draw) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * PI, false);
      ctx.fillStyle = pitchColors
        ? pitchColors[pitchClass] || 'black'
        : 'black';
      ctx.fill();
    }
  });

  ctx.font = '4pt Times';
  ctx.fillStyle = 'black';
  pitchNames.forEach((className, pitchClass) => {
    angle = pitchClassAngle(pitchClass);
    const measure = ctx.measureText(className);
    x = r_label * cos(angle) - measure.width / 2;
    y = r_label * sin(angle) + measure.emHeightDescent;
    if (options.draw) {
      ctx.fillText(className, x, y);
    }
    bounds.left = min(bounds.left, x);
    bounds.right = max(bounds.right, x + measure.width);
    bounds.top = min(bounds.top, y - measure.emHeightAscent);
    bounds.bottom = max(bounds.bottom, y + measure.emHeightAscent);
  });

  return bounds;
};

export const draw = drawPitchDiagram;
