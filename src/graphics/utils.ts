export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

export function hsv2rgb({ h, s, v }: HSVColor): RGBColor {
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
  const [r, g, b] = components!.map((component) => component + v - c);
  return { r, g, b };
}

export function rgb2css({ r, g, b }: RGBColor): string {
  const [ri, gi, bi] = [r, g, b].map((c) => Math.floor(255 * c));
  return `rgb(${ri}, ${gi}, ${bi})`;
}

export const hsv2css: (_: HSVColor) => string = (hsv) => rgb2css(hsv2rgb(hsv));
