import { FretCount, FretNumbers, FrettedInstrument, StringFret } from '../Instrument';
import { GraphicsContext } from './graphics';

//
// Style
//

// tslint:disable-next-line variable-name
const DefaultStyle = {
  hGutter: 10,
  vGutter: 10,

  fretOverhang: 0.3 * 45,
  fretWidth: 45,
  stringSpacing: 20,
};

function paddedFretboardWidth(
  instrument: FrettedInstrument,
  style = DefaultStyle,
) {
  return 2 * style.vGutter + style.fretWidth * FretCount + style.fretOverhang;
}

function paddedFretboardHeight(
  instrument: FrettedInstrument,
  style = DefaultStyle,
) {
  if (style == null) {
    style = DefaultStyle;
  }
  return 2 * style.hGutter + (instrument.stringCount - 1) * style.stringSpacing;
}

//
// Drawing Methods
//

function drawFretboardStrings(
  ctx: GraphicsContext,
  instrument: FrettedInstrument,
) {
  const style = DefaultStyle;
  instrument.stringNumbers.forEach((stringNumber) => {
    const y = stringNumber * style.stringSpacing + style.hGutter;
    ctx.beginPath();
    ctx.moveTo(style.hGutter, y);
    ctx.lineTo(
      style.hGutter + FretCount * style.fretWidth + style.fretOverhang,
      y,
    );
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawFretboardFrets(
  ctx: GraphicsContext,
  instrument: FrettedInstrument,
) {
  const style = DefaultStyle;
  FretNumbers.forEach((fret) => {
    const x = style.hGutter + fret * style.fretWidth;
    ctx.beginPath();
    ctx.moveTo(x, style.hGutter);
    ctx.lineTo(
      x,
      style.hGutter + (instrument.stringCount - 1) * style.stringSpacing,
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
  position: StringFret,
  options: { isRoot?: boolean; color?: string } = {},
) {
  const style = DefaultStyle;
  const { stringNumber, fretNumber } = position;
  const color = options.color || (options.isRoot ? 'red' : 'white');
  let x = style.hGutter + (fretNumber - 0.5) * style.fretWidth;
  if (fretNumber === 0) {
    x = style.hGutter;
  }
  const y = style.vGutter + (5 - stringNumber) * style.stringSpacing;
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
  instrument: FrettedInstrument,
  positions: StringFret[],
) {
  drawFretboardStrings(ctx, instrument);
  drawFretboardFrets(ctx, instrument);
  (positions || []).forEach((position) =>
    drawFretboardFingerPosition(ctx, position),
  );
}

export { paddedFretboardWidth as width, paddedFretboardHeight as height, drawFretboard as draw };
