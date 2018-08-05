export const AccidentalValues: { [_: string]: number } = {
  '#': 1,
  '♯': 1,
  b: -1,
  '♭': -1,
  '𝄪': 2,
  '𝄫': -2
};
const AccidentalNames = ['𝄫', '♭', '', '♯', '𝄪'];

export function semitonesToAccidentalString(n: number): string {
  // fast path:
  if (-2 <= n && n <= 2) {
    return AccidentalNames[n + 2];
  }
  let [single, double] = ['♯', '𝄪'];
  if (n < 0) {
    [n, single, double] = [-n, '♭', '𝄫'];
  }
  let s = new Array(Math.floor((n + 2) / 2)).join(double);
  if (n % 2) {
    s = single + s;
  }
  return s;
}
