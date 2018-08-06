import { FretCount, FretNumbers, Instrument } from '../instruments';
import { GraphicsContext } from './graphics';

//
// Style
//

const DefaultStyle = {
  hGutter: 10,
  vGutter: 10,
  stringSpacing: 20,
  fretWidth: 45,
  fretOverhang: 0.3 * 45
};

function paddedFretboardWidth(instrument: Instrument, style = DefaultStyle) {
  return 2 * style.vGutter + style.fretWidth * FretCount + style.fretOverhang;
}

function paddedFretboardHeight(instrument: Instrument, style = DefaultStyle) {
  if (style == null) {
    style = DefaultStyle;
  }
  return 2 * style.hGutter + (instrument.strings - 1) * style.stringSpacing;
}

//
// Drawing Methods
//

function drawFretboardStrings(ctx: GraphicsContext, instrument: Instrument) {
  const style = DefaultStyle;
  instrument.stringNumbers.forEach(string => {
    const y = string * style.stringSpacing + style.hGutter;
    ctx.beginPath();
    ctx.moveTo(style.hGutter, y);
    ctx.lineTo(
      style.hGutter + FretCount * style.fretWidth + style.fretOverhang,
      y
    );
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawFretboardFrets(ctx: GraphicsContext, instrument: Instrument) {
  const style = DefaultStyle;
  FretNumbers.forEach(fret => {
    const x = style.hGutter + fret * style.fretWidth;
    ctx.beginPath();
    ctx.moveTo(x, style.hGutter);
    ctx.lineTo(
      x,
      style.hGutter + (instrument.strings - 1) * style.stringSpacing
    );
    if (fret === 0) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    ctx.lineWidth = 1;
  });
}

function drawFretboardFingerPosition(
  ctx: GraphicsContext,
  position: { string: number; fret: number },
  options: { isRoot?: boolean; color?: string } = {}
) {
  const style = DefaultStyle;
  const { string, fret } = position;
  const color = options.color || (options.isRoot ? 'red' : 'white');
  let x = style.hGutter + (fret - 0.5) * style.fretWidth;
  if (fret === 0) {
    x = style.hGutter;
  }
  const y = style.vGutter + (5 - string) * style.stringSpacing;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  if (!options.isRoot) {
    ctx.lineWidth = 2;
  }
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
}

function drawFretboard(
  ctx: GraphicsContext,
  instrument: Instrument,
  positions: { string: number; fret: number }[]
) {
  drawFretboardStrings(ctx, instrument);
  drawFretboardFrets(ctx, instrument);
  (positions || []).forEach(position =>
    drawFretboardFingerPosition(ctx, position)
  );
}

export const width = paddedFretboardWidth;
export const height = paddedFretboardHeight;
export const draw = drawFretboard;
