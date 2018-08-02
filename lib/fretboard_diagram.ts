/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { FretCount, FretNumbers } from './instruments';

//
// Style
//

const DefaultStyle = {
  h_gutter: 10,
  v_gutter: 10,
  string_spacing: 20,
  fret_width: 45,
  fret_overhang: 0.3 * 45
};

function paddedFretboardWidth(instrument, style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return (
    2 * style.v_gutter + style.fret_width * FretCount + style.fret_overhang
  );
}

function paddedFretboardHeight(instrument, style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return 2 * style.h_gutter + (instrument.strings - 1) * style.string_spacing;
}

//
// Drawing Methods
//

const drawFretboardStrings = function(instrument, ctx) {
  const style = DefaultStyle;
  return (() => {
    const result = [];
    for (let string of Array.from(instrument.stringNumbers)) {
      const y = string * style.string_spacing + style.h_gutter;
      ctx.beginPath();
      ctx.moveTo(style.h_gutter, y);
      ctx.lineTo(
        style.h_gutter + FretCount * style.fret_width + style.fret_overhang,
        y
      );
      ctx.lineWidth = 1;
      result.push(ctx.stroke());
    }
    return result;
  })();
};

const drawFretboardFrets = function(ctx, instrument) {
  const style = DefaultStyle;
  return (() => {
    const result = [];
    for (let fret of Array.from(FretNumbers)) {
      const x = style.h_gutter + fret * style.fret_width;
      ctx.beginPath();
      ctx.moveTo(x, style.h_gutter);
      ctx.lineTo(
        x,
        style.h_gutter + (instrument.strings - 1) * style.string_spacing
      );
      if (fret === 0) {
        ctx.lineWidth = 3;
      }
      ctx.stroke();
      result.push((ctx.lineWidth = 1));
    }
    return result;
  })();
};

const drawFretboardFingerPosition = function(
  ctx,
  instrument,
  position,
  options
) {
  if (options == null) {
    options = {};
  }
  const { string, fret } = position;
  let { isRoot, color } = options;
  const style = DefaultStyle;
  if (!color) {
    color = isRoot ? 'red' : 'white';
  }
  let x = style.h_gutter + (fret - 0.5) * style.fret_width;
  if (fret === 0) {
    x = style.h_gutter;
  }
  const y = style.v_gutter + (5 - string) * style.string_spacing;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  if (!isRoot) {
    ctx.lineWidth = 2;
  }
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'black';
  return (ctx.lineWidth = 1);
};

function drawFretboard(ctx, instrument, positions) {
  drawFretboardStrings(ctx, instrument);
  drawFretboardFrets(ctx, instrument);
  return Array.from(positions || []).map(position =>
    drawFretboardFingerPosition(ctx, instrument, position, position)
  );
}

export const width = paddedFretboardWidth;
export const height = paddedFretboardHeight;
export const draw = drawFretboard;
