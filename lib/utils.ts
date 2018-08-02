/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const hsv2rgb = function({ h, s, v }) {
  h /= 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const components = (() => {
    switch (Math.floor(h * 6) % 6) {
      case 0:
        return [c, x, 0];
      case 1:
        return [x, c, 0];
      case 2:
        return [0, c, x];
      case 3:
        return [0, x, c];
      case 4:
        return [x, 0, c];
      case 5:
        return [c, 0, x];
    }
  })();
  const [r, g, b] = Array.from(
    Array.from(components).map(component => component + v - c)
  );
  return { r, g, b };
};

const rgb2css = function({ r, g, b }) {
  [r, g, b] = Array.from([r, g, b].map(c => Math.floor(255 * c)));
  return `rgb(${r}, ${g}, ${b})`;
};

const hsv2css = hsv => rgb2css(hsv2rgb(hsv));

export { hsv2css, hsv2rgb, rgb2css };
