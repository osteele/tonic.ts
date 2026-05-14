export function stringify(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string'
  ) {
    return value.name;
  }
  if (Array.isArray(value)) {
    return '[' + value.map(stringify).join(', ') + ']';
  }
  if (
    value !== null &&
    value !== undefined &&
    typeof value.toString === 'function'
  ) {
    return value.toString();
  }
  return JSON.stringify(value);
}
