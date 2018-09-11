import { powerset, reverseMap, rotateArray } from '../src/utils';

describe('powerset', () => {
  it('on an empty set', () => {
    expect(powerset([])).toEqual([[]]);
  });

  it('on a singleton set', () => {
    expect(powerset([1])).toEqual([[], [1]]);
  });

  it('generates all subsets', () => {
    expect(new Set(powerset([1, 2, 3]))).toEqual(
      new Set([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]),
    );
  });
});

describe('rotateArray', () => {
  it('returns the array unchanged when rotating by 0', () => {
    expect(rotateArray([1, 2, 3], 0)).toEqual([1, 2, 3]);
  });
  it('rotates its elements', () => {
    expect(rotateArray([1, 2, 3], 1)).toEqual([2, 3, 1]);
  });
});

describe('reverseMap', () => {
  it('reverses its elements', () => {
    const map = new Map<string, number>([['a', 1], ['b', 2]]);
    const rev: Map<number, string> = reverseMap(map);
    expect(rev.get(1)).toBe('a');
    expect(rev.get(2)).toBe('b');
  });
});
