/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { defaultStyle as ChordDiagramStyle } from './chord_diagram';
const { PI, cos, sin, min, max } = Math;

const draw_pitch_diagram = function(ctx, pitchClasses, options) {
  let angle, x, y;
  if (options == null) {
    options = { draw: true };
  }
  let { pitch_colors, pitch_names } = options;
  if (!pitch_colors) {
    pitch_colors = ChordDiagramStyle.interval_class_colors;
  }
  if (!pitch_names) {
    pitch_names = 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/);
  }
  // pitch_names = '1 2b 2 3b 3 4 T 5 6b 6 7b 7'.split(/\s/)
  const r = 10;
  const r_label = r + 7;

  const pitch_class_angle = pitchClass => ((pitchClass - 3) * 2 * PI) / 12;

  const bounds = { left: 0, top: 0, right: 0, bottom: 0 };
  const extend_bounds = function(left, top, bottom, right) {
    // right ?= left
    // bottom ?= top
    bounds.left = min(bounds.left, left);
    bounds.top = min(bounds.top, top);
    bounds.right = max(bounds.right, right != null ? right : left);
    return (bounds.bottom = max(bounds.bottom, bottom != null ? bottom : top));
  };

  for (var pitchClass of Array.from(pitchClasses)) {
    angle = pitch_class_angle(pitchClass);
    x = r * cos(angle);
    y = r * sin(angle);

    if (options.draw) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    extend_bounds(x, y);

    if (options.draw) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * PI, false);
      ctx.fillStyle = pitch_colors[pitchClass] || 'black';
      ctx.fill();
    }
  }

  ctx.font = '4pt Times';
  ctx.fillStyle = 'black';
  for (pitchClass = 0; pitchClass < pitch_names.length; pitchClass++) {
    const class_name = pitch_names[pitchClass];
    angle = pitch_class_angle(pitchClass);
    const m = ctx.measureText(class_name);
    x = r_label * cos(angle) - m.width / 2;
    y = r_label * sin(angle) + m.emHeightDescent;
    if (options.draw) {
      ctx.fillText(class_name, x, y);
    }
    bounds.left = min(bounds.left, x);
    bounds.right = max(bounds.right, x + m.width);
    bounds.top = min(bounds.top, y - m.emHeightAscent);
    bounds.bottom = max(bounds.bottom, y + m.emHeightAscent);
  }

  return bounds;
};

export const draw = draw_pitch_diagram;
