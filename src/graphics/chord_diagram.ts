import * as _ from 'lodash';
import { FretCount, FretNumbers, Instrument } from '../instruments';
import { Interval } from '../interval';
import { hsv2css } from './color_utils';
import { GraphicsContext } from './graphics';

export type Style = {
  hGutter: number;
  vGutter: number;
  stringSpacing: number;
  fretHeight: number;
  aboveFretboard: number;
  noteRadius: number;
  closedStringFontSize: number;
  chordDegreeColors: string[];
  intervalClassColors: string[];
};

export const SmallStyle = {
  hGutter: 5,
  vGutter: 5,
  stringSpacing: 6,
  fretHeight: 8,
  aboveFretboard: 8,
  noteRadius: 1,
  closedStringFontsize: 4,
  chordDegreeColors: ['red', 'blue', 'green', 'orange'],
  intervalClassColors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n =>
    // i = (7 * n) % 12  # color by circle of fifth ascension
    hsv2css({ h: (n * 360) / 12, s: 1, v: 1 })
  )
};

export const DefaultStyle = {
  ...SmallStyle,
  stringSpacing: 12,
  fretHeight: 16,
  noteRadius: 3,
  closedStringFontSize: 8
};

function computeChordDiagramDimensions(
  instrument: Instrument,
  style: Style = DefaultStyle
) {
  if (style == null) {
    style = DefaultStyle;
  }
  return {
    width: 2 * style.hGutter + (instrument.strings - 1) * style.stringSpacing,
    height: 2 * style.vGutter + (style.fretHeight + 2) * FretCount
  };
}

//
// Drawing Methods
//

function drawChordDiagramStrings(
  ctx: GraphicsContext,
  instrument: Instrument,
  options: { dimStrings?: number[] } = {}
) {
  const style = DefaultStyle;
  const result = [];
  instrument.stringNumbers.forEach(string => {
    const x = string * style.stringSpacing + style.hGutter;
    ctx.beginPath();
    ctx.moveTo(x, style.vGutter + style.aboveFretboard);
    ctx.lineTo(
      x,
      style.vGutter + style.aboveFretboard + FretCount * style.fretHeight
    );
    ctx.strokeStyle =
      options.dimStrings && options.dimStrings.indexOf(string) >= 0
        ? 'rgba(0,0,0,0.2)'
        : 'black';
    ctx.stroke();
  });
}

function drawChordDiagramFrets(
  ctx: GraphicsContext,
  instrument: Instrument,
  param = { drawNut: true }
) {
  const { drawNut } = param;
  const style = DefaultStyle;
  ctx.strokeStyle = 'black';
  FretNumbers.forEach(fret => {
    const y = style.vGutter + style.aboveFretboard + fret * style.fretHeight;
    ctx.beginPath();
    ctx.moveTo(style.vGutter - 0.5, y);
    ctx.lineTo(
      style.vGutter + 0.5 + (instrument.strings - 1) * style.stringSpacing,
      y
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
  instrument: Instrument,
  positions: { fret: number; string: number; intervalClass: Interval }[],
  options: {
    dimUnusedStrings?: boolean;
    dimStrings?: number[];
    barres: { fret: number; firstString: number; stringCount: number }[];
    drawClosedStrings: boolean;
    drawNut: boolean;
    dy: number;
    style: Style;
  } = {
    barres: [],
    drawClosedStrings: true,
    drawNut: true,
    dy: 0,
    style: DefaultStyle
  }
) {
  let fret, string;
  let { barres, dy, drawNut, style } = options;

  let topFret = 0;
  const frets = _
    .chain(positions)
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
      string => usedStrings.indexOf(string) < 0
    );
  }

  function fingerCoordinates({
    string,
    fret
  }: {
    fret: number;
    string: number;
  }) {
    if (fret > 0) {
      fret -= topFret;
    }
    return {
      x: style.hGutter + string * style.stringSpacing,
      y:
        style.vGutter +
        style.aboveFretboard +
        (fret - 0.5) * style.fretHeight +
        dy
    };
  }

  function drawFingerPosition(
    position: { fret: number; string: number },
    options: { isRoot?: boolean; color?: string } = {}
  ) {
    const { isRoot, color } = options;
    const { x, y } = fingerCoordinates(position);
    ctx.fillStyle = color || (isRoot ? 'red' : 'white');
    ctx.strokeStyle = color || (isRoot ? 'red' : 'black');
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isRoot && position.fret) {
      (r => ctx.rect(x - r, y - r, 2 * r, 2 * r))(style.noteRadius);
    } else {
      ctx.arc(x, y, style.noteRadius, 0, Math.PI * 2, false);
    }
    if (position.fret > 0 || isRoot) {
      ctx.fill();
    }
    return ctx.stroke();
  }

  function drawBarres() {
    ctx.fillStyle = 'black';
    barres.forEach(({ fret, firstString, stringCount }) => {
      const { x: x1, y } = fingerCoordinates({ string: firstString, fret });
      const { x: x2 } = fingerCoordinates({
        string: firstString + stringCount - 1,
        fret
      });
      const w = x2 - x1;
      ctx.save();
      ctx.translate((x1 + x2) / 2, y - style.fretHeight * 0.25);
      ctx.beginPath();
      const eccentricity = 10;

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
    positions.forEach(position => {
      const default_options = {
        color: style.intervalClassColors[position.intervalClass.semitones],
        isRoot: position.intervalClass.semitones === 0
      };
      drawFingerPosition(position, _.extend(default_options, position));
    });
  }

  function drawClosedStrings() {
    const fretted_strings = <boolean[]>[];
    positions.forEach(({ string }) => {
      fretted_strings[string] = true;
    });
    const closed_strings = instrument.stringNumbers.filter(
      string => !fretted_strings[string]
    );
    const r = style.noteRadius;
    ctx.fillStyle = 'black';
    closed_strings.forEach(string => {
      const { x, y } = fingerCoordinates({ string, fret: 0 });
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

export const width = (instrument: Instrument) =>
  computeChordDiagramDimensions(instrument).width;

export const height = (instrument: Instrument) =>
  computeChordDiagramDimensions(instrument).height;

export { DefaultStyle as defaultStyle, drawChordDiagram as draw };
