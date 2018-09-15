import { midi2name, name2midi } from '../../src/internal/midi';

describe('midi2name', () => {
  it('should return a pitch name', () => {
    expect(midi2name(0)).toBe('C-1');
    expect(midi2name(12)).toBe('C0');
    expect(midi2name(13)).toBe('C♯0');
    expect(midi2name(23)).toBe('B0');
    expect(midi2name(24)).toBe('C1');
    expect(midi2name(36)).toBe('C2');
    expect(midi2name(127)).toBe('G9');
  });
});

describe('name2midi', () => {
  it('should return a midi number', () => {
    expect(name2midi('C-1')).toBe(0);
    expect(name2midi('C0')).toBe(12);
    expect(name2midi('C♯0')).toBe(13);
    expect(name2midi('B0')).toBe(23);
    expect(name2midi('C1')).toBe(24);
    expect(name2midi('C2')).toBe(36);
    expect(name2midi('G9')).toBe(127);
  });
});
