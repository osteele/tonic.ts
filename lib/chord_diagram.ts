import * as _ from 'lodash';
import { hsv2css } from './color_utils';
import { FretCount, FretNumbers, Instrument } from './instruments';
import { Interval } from './interval';

type Style = {
  h_gutter: number;
  v_gutter: number;
  string_spacing: number;
  fret_height: number;
  above_fretboard: number;
  note_radius: number;
  closed_string_fontsize: number;
  chord_degree_colors: string[];
  intervalClass_colors: string[];
};

const SmallStyle = {
  h_gutter: 5,
  v_gutter: 5,
  string_spacing: 6,
  fret_height: 8,
  above_fretboard: 8,
  note_radius: 1,
  closed_string_fontsize: 4,
  chord_degree_colors: ['red', 'blue', 'green', 'orange'],
  intervalClass_colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n =>
    // i = (7 * n) % 12  # color by circle of fifth ascension
    hsv2css({ h: (n * 360) / 12, s: 1, v: 1 })
  )
};

const DefaultStyle = {
  ...SmallStyle,
  string_spacing: 12,
  fret_height: 16,
  note_radius: 3,
  closed_string_fontsize: 8
};

function computeChordDiagramDimensions(
  instrument: Instrument,
  style: Style = DefaultStyle
) {
  if (style == null) {
    style = DefaultStyle;
  }
  return {
    width: 2 * style.h_gutter + (instrument.strings - 1) * style.string_spacing,
    height: 2 * style.v_gutter + (style.fret_height + 2) * FretCount
  };
}

//
// Drawing Methods
//

interface DrawingContext {
  arc: (
    x: number,
    y: number,
    radius: number,
    a: number,
    b: number,
    c: boolean
  ) => void;
  beginPath: () => void;
  fill: () => void;
  lineTo: (x: number, y: number) => void;
  moveTo: (x: number, y: number) => void;
  rect: (x: number, y: number, width: number, height: number) => void;
  restore: () => void;
  save: () => void;
  scale: (x: number, y: number) => void;
  stroke: () => void;
  translate: (x: number, y: number) => void;

  fillStyle: string;
  lineWidth: number;
  strokeStyle: string;
}

function drawChordDiagramStrings(
  ctx: DrawingContext,
  instrument: Instrument,
  options: { dimStrings?: number[] } = {}
) {
  const style = DefaultStyle;
  const result = [];
  instrument.stringNumbers.forEach(string => {
    const x = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(x, style.v_gutter + style.above_fretboard);
    ctx.lineTo(
      x,
      style.v_gutter + style.above_fretboard + FretCount * style.fret_height
    );
    ctx.strokeStyle =
      options.dimStrings && options.dimStrings.indexOf(string) >= 0
        ? 'rgba(0,0,0,0.2)'
        : 'black';
    ctx.stroke();
  });
}

function drawChordDiagramFrets(
  ctx: DrawingContext,
  instrument: Instrument,
  param = { drawNut: true }
) {
  const { drawNut } = param;
  const style = DefaultStyle;
  ctx.strokeStyle = 'black';
  FretNumbers.forEach(fret => {
    const y = style.v_gutter + style.above_fretboard + fret * style.fret_height;
    ctx.beginPath();
    ctx.moveTo(style.v_gutter - 0.5, y);
    ctx.lineTo(
      style.v_gutter + 0.5 + (instrument.strings - 1) * style.string_spacing,
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
  ctx: DrawingContext,
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
      x: style.h_gutter + string * style.string_spacing,
      y:
        style.v_gutter +
        style.above_fretboard +
        (fret - 0.5) * style.fret_height +
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
      (r => ctx.rect(x - r, y - r, 2 * r, 2 * r))(style.note_radius);
    } else {
      ctx.arc(x, y, style.note_radius, 0, Math.PI * 2, false);
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
      ctx.translate((x1 + x2) / 2, y - style.fret_height * 0.25);
      ctx.beginPath();
      const eccentricity = 10;

      ctx.save();
      ctx.scale(w, eccentricity);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, Math.PI, 0, false);
      ctx.restore();

      ctx.save();
      ctx.scale(w, 14);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, 0, Math.PI, true);
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
        color: style.intervalClass_colors[position.intervalClass.semitones],
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
    const r = style.note_radius;
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

export const defaultStyle = DefaultStyle;

export const width = (instrument: Instrument) =>
  computeChordDiagramDimensions(instrument).width;

export const height = (instrument: Instrument) =>
  computeChordDiagramDimensions(instrument).height;

export const draw = drawChordDiagram;
