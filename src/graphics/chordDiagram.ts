import * as _ from 'lodash';
import {
  FretCount,
  FretNumbers,
  FrettedInstrument,
  StringFret,
} from '../Instrument';
import { Interval } from '../Interval';
import { GraphicsContext } from './graphics';
import { hsv2css } from './utils';

export interface Style {
  hGutter: number;
  vGutter: number;
  stringSpacing: number;
  fretHeight: number;
  aboveFretboard: number;
  noteRadius: number;
  closedStringFontSize: number;
  chordDegreeColors: string[];
  intervalClassColors: string[];
}

// tslint:disable-next-line variable-name
export const SmallStyle = {
  hGutter: 5,
  vGutter: 5,

  aboveFretboard: 8,
  closedStringFontsize: 4,
  fretHeight: 8,
  noteRadius: 1,
  stringSpacing: 6,

  chordDegreeColors: ['red', 'blue', 'green', 'orange'],
  intervalClassColors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) =>
    // i = (7 * n) % 12  # color by circle of fifth ascension
    hsv2css({ h: (n * 360) / 12, s: 1, v: 1 }),
  ),
};

// tslint:disable-next-line variable-name
export const DefaultStyle = {
  ...SmallStyle,
  closedStringFontSize: 8,
  fretHeight: 16,
  noteRadius: 3,
  stringSpacing: 12,
};

function computeChordDiagramDimensions(
  instrument: FrettedInstrument,
  style: Style = DefaultStyle,
) {
  if (style == null) {
    style = DefaultStyle;
  }
  return {
    height: 2 * style.vGutter + (style.fretHeight + 2) * FretCount,
    width:
      2 * style.hGutter + (instrument.stringCount - 1) * style.stringSpacing,
  };
}

//
// Drawing Methods
//

function drawChordDiagramStrings(
  ctx: GraphicsContext,
  instrument: FrettedInstrument,
  options: { dimStrings?: number[] } = {},
) {
  const style = DefaultStyle;
  instrument.stringNumbers.forEach((stringNumber) => {
    const x = stringNumber * style.stringSpacing + style.hGutter;
    ctx.beginPath();
    ctx.moveTo(x, style.vGutter + style.aboveFretboard);
    ctx.lineTo(
      x,
      style.vGutter + style.aboveFretboard + FretCount * style.fretHeight,
    );
    ctx.strokeStyle =
      options.dimStrings && options.dimStrings.indexOf(stringNumber) >= 0
        ? 'rgba(0,0,0,0.2)'
        : 'black';
    ctx.stroke();
  });
}

function drawChordDiagramFrets(
  ctx: GraphicsContext,
  instrument: FrettedInstrument,
  param = { drawNut: true },
) {
  const { drawNut } = param;
  const style = DefaultStyle;
  ctx.strokeStyle = 'black';
  FretNumbers.forEach((fret) => {
    const y = style.vGutter + style.aboveFretboard + fret * style.fretHeight;
    ctx.beginPath();
    ctx.moveTo(style.vGutter - 0.5, y);
    ctx.lineTo(
      style.vGutter + 0.5 + (instrument.stringCount - 1) * style.stringSpacing,
      y,
    );
    if (fret === 0 && drawNut) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    ctx.lineWidth = 1;
  });
}

function drawChordDiagram(
  ctx: GraphicsContext,
  instrument: FrettedInstrument,
  positions: Array<{
    fretNumber: number;
    stringNumber: number;
    intervalClass: Interval;
  }>,
  options: {
    dimUnusedStrings?: boolean;
    dimStrings?: number[];
    barres: Array<{
      fretNumber: number;
      firstString: number;
      stringCount: number;
    }>;
    drawClosedStrings: boolean;
    drawNut: boolean;
    dy: number;
    style: Style;
  } = {
    barres: [],
    drawClosedStrings: true,
    drawNut: true,
    dy: 0,
    style: DefaultStyle,
  },
) {
  const { barres, dy, style } = options;
  let { drawNut } = options;

  let topFret = 0;
  const frets = _.chain(positions)
    .map('fret')
    .without(0)
    .value();
  const lowestFret = Math.min(...frets);
  const highestFret = Math.max(...frets);
  if (highestFret > 4) {
    topFret = lowestFret - 1;
    drawNut = false;
  }

  if (options.dimUnusedStrings) {
    const usedStrings = _.map(positions, 'string');
    options.dimStrings = instrument.stringNumbers.filter(
      (stringNumber) => usedStrings.indexOf(stringNumber) < 0,
    );
  }

  function fingerCoordinates({ stringNumber, fretNumber }: StringFret) {
    if (fretNumber > 0) {
      fretNumber -= topFret;
    }
    return {
      x: style.hGutter + stringNumber * style.stringSpacing,
      y:
        style.vGutter +
        style.aboveFretboard +
        (fretNumber - 0.5) * style.fretHeight +
        dy,
    };
  }

  function drawFingerPosition(
    position: StringFret,
    options: { isRoot?: boolean; color?: string } = {},
  ) {
    const { isRoot, color } = options;
    const { x, y } = fingerCoordinates(position);
    ctx.fillStyle = color || (isRoot ? 'red' : 'white');
    ctx.strokeStyle = color || (isRoot ? 'red' : 'black');
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isRoot && position.fretNumber) {
      ((r) => ctx.rect(x - r, y - r, 2 * r, 2 * r))(style.noteRadius);
    } else {
      ctx.arc(x, y, style.noteRadius, 0, Math.PI * 2, false);
    }
    if (position.fretNumber > 0 || isRoot) {
      ctx.fill();
    }
    return ctx.stroke();
  }

  function drawBarres() {
    ctx.fillStyle = 'black';
    barres.forEach(({ fretNumber, firstString, stringCount }) => {
      const eccentricity = 10;
      const { x: x1, y } = fingerCoordinates({
        fretNumber,
        stringNumber: firstString,
      });
      const { x: x2 } = fingerCoordinates({
        fretNumber,
        stringNumber: firstString + stringCount - 1,
      });
      const w = x2 - x1;
      ctx.save();
      ctx.translate((x1 + x2) / 2, y - style.fretHeight * 0.25);
      ctx.beginPath();

      ctx.save();
      ctx.scale(w, eccentricity);
      ctx.arc(0, 0, style.stringSpacing / 2 / eccentricity, Math.PI, 0, false);
      ctx.restore();

      ctx.save();
      ctx.scale(w, 14);
      ctx.arc(0, 0, style.stringSpacing / 2 / eccentricity, 0, Math.PI, true);
      ctx.restore();

      ctx.fill();
      ctx.restore();

      // ctx.fillStyle = 'rgba(0,0,0, 0.5)'
      // ctx.beginPath()
      // ctx.arc x1, y, style.string_spacing / 2, Math.PI * 1/2, Math.PI * 3/2, false
      // ctx.arc x2, y, style.string_spacing / 2, Math.PI * 3/2, Math.PI * 1/2, false
      // ctx.fill()
    });
  }

  function drawFingerPositions() {
    positions.forEach((position) => {
      drawFingerPosition(position, {
        ...(options as { isRoot?: boolean; color?: string }),
        color: style.intervalClassColors[position.intervalClass.semitones],
        isRoot: position.intervalClass.semitones === 0,
      });
    });
  }

  function drawClosedStrings() {
    const frettedStrings = new Array<boolean>();
    positions.forEach(({ stringNumber }) => {
      frettedStrings[stringNumber] = true;
    });
    const closedStrings = instrument.stringNumbers.filter(
      (stringNumber) => !frettedStrings[stringNumber],
    );
    const r = style.noteRadius;
    ctx.fillStyle = 'black';
    closedStrings.forEach((stringNumber) => {
      const { x, y } = fingerCoordinates({ stringNumber, fretNumber: 0 });
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x - r, y - r);
      ctx.lineTo(x + r, y + r);
      ctx.moveTo(x - r, y + r);
      ctx.lineTo(x + r, y - r);
      ctx.stroke();
    });
  }

  drawChordDiagramStrings(ctx, instrument, options);
  drawChordDiagramFrets(ctx, instrument, { drawNut });
  if (barres) {
    drawBarres();
  }
  if (positions) {
    drawFingerPositions();
  }
  if (positions && options.drawClosedStrings) {
    drawClosedStrings();
  }
  return { topFret };
}

export const width = (instrument: FrettedInstrument) =>
  computeChordDiagramDimensions(instrument).width;

export const height = (instrument: FrettedInstrument) =>
  computeChordDiagramDimensions(instrument).height;

export { DefaultStyle as defaultStyle, drawChordDiagram as draw };
