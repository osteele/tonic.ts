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

  fillStyle: string;
  font: string;
  lineWidth: number;
  strokeStyle: string;
}
