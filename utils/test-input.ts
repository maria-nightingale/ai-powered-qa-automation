/** Append a timestamp so program names are unique across parallel test runs. */
export function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

/** Build a string of exact length for boundary validation tests. */
export function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}
