export interface GraphicsContext {
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
  fillText: (_: string, x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  measureText: (
    _: string
  ) => { width: number; emHeightAscent: number; emHeightDescent: number };
  moveTo: (x: number, y: number) => void;
  rect: (x: number, y: number, width: number, height: number) => void;
  restore: () => void;
  save: () => void;
  scale: (x: number, y: number) => void;
  stroke: () => void;
  translate: (x: number, y: number) => void;

  globalAlpha: number;
  fillStyle: string;
  font: string;
  lineWidth: number;
  strokeStyle: string;
}

var Context: GraphicsContext | null;

export type Gravity =
  | 'top'
  | 'center'
  | 'middle'
  | 'bottom'
  | 'centerbottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'botLeft'
  | 'botRight'
  | '';

export type DrawTextOptions = {
  font: string;
  fillStyle: string;
  x: number;
  y: number;
  gravity: Gravity;
  width: number;
};

export function drawText(text: string, options: Partial<DrawTextOptions> = {}) {
  const ctx = Context!;
  let { font, fillStyle, x, y, gravity, width } = options;
  if (!gravity) {
    gravity = '';
  }
  if (font) {
    ctx.font = font;
  }
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  const m = ctx.measureText(text);
  if (!x) {
    x = 0;
  }
  if (!y) {
    y = 0;
  }
  if (gravity.match(/^(top|center|middle|centerbottom)$/i)) {
    x -= m.width / 2;
  }
  if (gravity.match(/^(right|topRight|botRight)$/i)) {
    x -= m.width;
  }
  if (gravity.match(/^(bottom|botLeft|botRight)$/i)) {
    y -= m.emHeightDescent;
  }
  if (gravity.match(/^(top|topLeft|topRight)$/i)) {
    y += m.emHeightAscent;
  }
  return ctx.fillText(text, x, y);
}

export function withCanvas(canvas: GraphicsContext, cb: () => any) {
  const savedContext = Context;
  try {
    Context = canvas;
    return cb();
  } finally {
    Context = savedContext;
  }
}

export function withGraphicsContext(cb: (_: GraphicsContext) => any) {
  const ctx = Context!;
  ctx.save();
  try {
    return cb(ctx);
  } finally {
    ctx.restore();
  }
}
