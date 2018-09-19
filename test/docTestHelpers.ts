export function stringify(value: any): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value.name === 'string') {
    return value.name;
  }
  if (Array.isArray(value)) {
    return '[' + value.map(stringify).join(', ') + ']';
  }
  if (typeof value.toString === 'function') {
    return value.toString();
  }
  return JSON.stringify(value);
}
