export function powerset<T>(array: ReadonlyArray<T>): T[][] {
  if (!array.length) {
    return [[]];
  }
  const [x, ...xs] = array;
  const tail = powerset(xs);
  return [...tail, ...tail.map((ys) => [x, ...ys])];
}

export function rotateArray<T>(array: ReadonlyArray<T>, n: number): T[] {
  return [...array.slice(n), ...array.slice(0, n)];
}

export function memoize0<T>(fn: () => T): () => T {
  let g = () => {
    const x = fn();
    g = () => x;
    return x;
  };
  return () => g();
}

export function reverseMap<K, V>(map: Map<K, V>): Map<V, K> {
  return new Map<V, K>(
    Array.from(map.entries()).map(([k, v]) => [v, k] as [V, K]),
  );
}
