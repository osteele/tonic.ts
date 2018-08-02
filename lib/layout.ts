/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Context = { canvas: null };

const drawText = function(text, options) {
  if (options == null) {
    options = {};
  }
  const { ctx } = Context;
  if (_.isObject(text)) {
    options = text;
  }
  let { font, fillStyle, x, y, gravity, width } = options;
  if (!gravity) {
    gravity = '';
  }
  if (options.choices) {
    for (let choice of Array.from(options.choices)) {
      if (_.isString(choice)) {
        text = choice;
      }
      if (_.isObject(choice)) {
        ({ font } = choice);
      }
      if (measure_text(text, { font }).width <= options.width) {
        break;
      }
    }
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
};

const withCanvas = function(canvas, cb) {
  const savedCanvas = Context.canvas;
  try {
    Context.canvas = canvas;
    return cb();
  } finally {
    Context.canvas = savedCanvas;
  }
};

const withGraphicsContext = function(cb) {
  const { ctx } = Context;
  ctx.save();
  try {
    return cb(ctx);
  } finally {
    ctx.restore();
  }
};

export { withCanvas, withGraphicsContext };
